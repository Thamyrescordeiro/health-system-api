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
import { Company } from '../Company/company.entity';
import { EmailService } from '../../Email/email.service';

interface UserPayload {
  user_id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin' | 'super_admin';
  company_id: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly jwtService: JwtService,
    @InjectModel(Doctor) private doctorModel: typeof Doctor,
    @InjectModel(Patient) private patientModel: typeof Patient,
    @InjectModel(Admin) private adminModel: typeof Admin,
    @InjectModel(Company) private companyModel: typeof Company,
    private sequelize: Sequelize,
    private readonly emailService: EmailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<UserPayload> {
    const user = await this.userModel.findOne({ where: { email } });
    if (user && (await user.comparePassword(pass))) {
      const result = user.get({ plain: true });
      return {
        user_id: result.user_id,
        email: result.email,
        role: result.role,
        company_id: result.company_id || '',
      };
    }
    throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
  }

  login(user: UserPayload & { company_id: string }) {
    const payload = {
      email: user.email,
      sub: user.user_id,
      role: user.role,
      company_id: user.company_id,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async registerPatient(dto: RegisterDto) {
    const existingUser = await this.userModel.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new HttpException('Email already in use', HttpStatus.BAD_REQUEST);
    }
    const existingPatient = await this.adminModel.findOne({
      where: { cpf: (dto.profile as CreatePatientDto).cpf },
    });
    if (existingPatient) {
      throw new HttpException('CPF already in use', HttpStatus.BAD_REQUEST);
    }

    if (!dto.company_id) {
      throw new HttpException(
        'Company ID is required for patient registration',
        HttpStatus.BAD_REQUEST,
      );
    }
    const company = await this.companyModel.findOne({
      where: { company_id: dto.company_id, active: true },
    });
    if (!company) {
      throw new HttpException(
        'Company not found or inactive',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.sequelize.transaction(async (t) => {
      const user = await this.userModel.create(
        {
          email: dto.email,
          password: dto.password,
          role: 'patient',
          company_id: dto.company_id,
        },
        { transaction: t },
      );

      const patientData: CreatePatientDto & {
        user_id: string;
        company_id: string;
      } = {
        ...(dto.profile as CreatePatientDto),
        user_id: user.user_id,
        company_id: dto.company_id,
      };

      const profile = await this.patientModel.create(patientData, {
        transaction: t,
      });

      return { user, profile };
    });
  }
  async registerDoctor(dto: RegisterDto, currentUserRole: string) {
    if (currentUserRole !== 'admin') {
      throw new ForbiddenException('Only admins can create doctors.');
    }

    const existingUser = await this.userModel.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new HttpException('Email already in use', HttpStatus.BAD_REQUEST);
    }
    const existingDoctor = await this.doctorModel.findOne({
      where: { crm: (dto.profile as CreateDoctorDto).crm },
    });
    if (existingDoctor) {
      throw new HttpException('CRM already in use', HttpStatus.BAD_REQUEST);
    }

    const company = await this.companyModel.findOne({
      where: { company_id: dto.company_id, active: true },
    });
    if (!company) {
      throw new HttpException(
        'Company not found or inactive',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.sequelize.transaction(async (t) => {
      const user = await this.userModel.create(
        {
          email: dto.email,
          password: dto.password,
          role: 'doctor',
          company_id: dto.company_id,
        },
        { transaction: t },
      );

      const doctorData: CreateDoctorDto & { user_id: string } = {
        ...(dto.profile as CreateDoctorDto),
        user_id: user.user_id,
      };

      const profile = await this.doctorModel.create(doctorData, {
        transaction: t,
      });

      return { user, profile };
    });
  }

  // Admins //

  async registerAdmin(dto: RegisterDto) {
    const existingUser = await this.userModel.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new HttpException('Email already in use', HttpStatus.BAD_REQUEST);
    }

    const existingAdmin = await this.adminModel.findOne({
      where: { cpf: (dto.profile as CreateAdminDto).cpf },
    });
    if (existingAdmin) {
      throw new HttpException('CPF already in use', HttpStatus.BAD_REQUEST);
    }

    const company = await this.companyModel.findOne({
      where: { company_id: dto.company_id, active: true },
    });
    if (!company) {
      throw new HttpException(
        'Company not found or inactive',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.sequelize.transaction(async (t) => {
      const user = await this.userModel.create(
        {
          email: dto.email,
          password: dto.password,
          role: 'admin',
          company_id: dto.company_id,
        },
        { transaction: t },
      );

      const adminData: CreateAdminDto & {
        user_id: string;
        company_id: string;
      } = {
        ...(dto.profile as CreateAdminDto),
        user_id: user.user_id,
        company_id: dto.company_id,
      };
      const profile = await this.adminModel.create(adminData, {
        transaction: t,
      });

      return {
        user,
        profile,
      };
    });
  }
  async sendPasswordResetCode(email: string) {
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const now = new Date();

    // Bloqueia se já existe um código ativo que não foi usado
    if (
      user.reset_code &&
      !user.reset_code_used &&
      user.reset_code_expires_at &&
      user.reset_code_expires_at > now
    ) {
      const remainingSeconds = Math.ceil(
        (user.reset_code_expires_at.getTime() - now.getTime()) / 1000,
      );
      throw new HttpException(
        `You must wait ${remainingSeconds} seconds before requesting another reset code.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Gera novo código
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    user.reset_code = code;
    user.reset_code_used = false;
    user.reset_code_expires_at = new Date(Date.now() + 2 * 60 * 1000); // 2 minutos
    user.last_reset_request_at = now; // marca o horário do envio

    // <<< Aqui você testa os valores antes de salvar no banco
    console.log('Código:', user.reset_code);
    console.log('Expira em:', user.reset_code_expires_at);
    console.log('Código usado?', user.reset_code_used);
    console.log('Última requisição:', user.last_reset_request_at);

    await user.save();

    await this.emailService.sendMail(
      user.email,
      'Password reset code',
      `Your code is: ${code}. It expires in 2 minutes.`,
    );

    return { message: 'Reset code sent to email' };
  }

  async resetPasswordWithCode(
    email: string,
    code: string,
    newPassword: string,
  ) {
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const now = new Date();

    // Verifica se o código é válido
    if (
      !user.reset_code ||
      user.reset_code_used ||
      !user.reset_code_expires_at ||
      user.reset_code_expires_at < now ||
      user.reset_code.trim() !== code.trim()
    ) {
      throw new HttpException(
        'Invalid or expired code',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Atualiza senha e marca código como usado
    await user.update({
      password: newPassword,
      reset_code_used: true,
    });

    return { message: 'Password updated successfully' };
  }
}
