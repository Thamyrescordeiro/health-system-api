import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../user/user.entity';
import { Doctor } from '../doctors/doctors.entity';
import { Patient } from '../patient/patient.entity';
import { Admin } from '../admin/admin.entity';
import { Sequelize } from 'sequelize-typescript';
import { RegisterDto } from './dtos/register.dto';
import { CreatePatientDto } from '../patient/dtos/create-patient.dto';
import { CreateDoctorDto } from '../doctors/dtos/create-doctors.dto';
import { CreateAdminDto } from '../admin/dtos/create-admin.dto';

interface UserPayload {
  user_id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly jwtService: JwtService,
    @InjectModel(Doctor) private doctorModel: typeof Doctor,
    @InjectModel(Patient) private patientModel: typeof Patient,
    private sequelize: Sequelize,
  ) {}

  async validateUser(email: string, pass: string): Promise<UserPayload> {
    const user = await this.userModel.findOne({ where: { email } });
    if (user && (await user.comparePassword(pass))) {
      const result = user.get({ plain: true });
      return result as UserPayload;
    }
    throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
  }

  login(user: UserPayload) {
    const payload = { email: user.email, sub: user.user_id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(register: RegisterDto, currentUserRole?: string) {
    if (register.role === 'admin') {
      const adminCount = await this.userModel.count({
        where: { role: 'admin' },
      });

      if (adminCount > 0 && currentUserRole !== 'admin') {
        throw new ForbiddenException(
          'Apenas administradores podem criar outros administradores.',
        );
      }
    }

    return this.sequelize.transaction(async (t) => {
      const user = await this.userModel.create(
        {
          email: register.email,
          password: register.password,
          role: register.role,
        },
        { transaction: t },
      );

      let profile: Patient | Doctor | Admin | null = null;

      if (register.role === 'doctor') {
        const doctorData: CreateDoctorDto & { user_id: string } = {
          ...(register.profile as CreateDoctorDto),
          user_id: user.user_id,
        };
        profile = await this.doctorModel.create(doctorData, { transaction: t });
      } else if (register.role === 'patient') {
        const patientData: CreatePatientDto & { user_id: string } = {
          ...(register.profile as CreatePatientDto),
          user_id: user.user_id,
        };
        profile = await this.patientModel.create(patientData, {
          transaction: t,
        });
      } else if (register.role === 'admin') {
        const adminData: CreateAdminDto & { user_id: string } = {
          ...(register.profile as CreateAdminDto),
          user_id: user.user_id,
        };
        profile = await Admin.create(adminData, { transaction: t });
      }

      return {
        user,
        profile,
      };
    });
  }
}
