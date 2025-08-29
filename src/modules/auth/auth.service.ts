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
import { Company } from '../Company/company.entity';
import { EmailService } from '../../Email/email.service';
import { RegisterPatientDto } from './dtos/register-patient.dto';
import { RegisterAdminDto } from './dtos/register-admin.dto';
import { RegisterDoctorDto } from './dtos/register-doctor.dto';
import { randomBytes } from 'crypto';

export interface UserPayload {
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
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    if (!user.active) {
      throw new HttpException('User is deactivated', HttpStatus.FORBIDDEN);
    }

    const isPasswordValid = await user.comparePassword(pass);
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    return {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      company_id: user.company_id || '',
    };
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

  async registerDoctor(
    dto: RegisterDoctorDto,
    companyId: string,
    currentUserRole: string,
  ) {
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
      where: { crm: dto.profile.crm },
    });
    if (existingDoctor) {
      throw new HttpException('CRM already in use', HttpStatus.BAD_REQUEST);
    }

    const company = await this.companyModel.findOne({
      where: { company_id: companyId, active: true },
    });
    if (!company) {
      throw new HttpException(
        'Company not found or inactive',
        HttpStatus.BAD_REQUEST,
      );
    }
    const result = await this.sequelize.transaction(async (t) => {
      const user = await this.userModel.create(
        {
          email: dto.email,
          password: dto.password,
          role: 'doctor',
          company_id: companyId,
        },
        { transaction: t },
      );

      const doctor = await this.doctorModel.create(
        {
          ...dto.profile,
          user_id: user.user_id,
          company_id: companyId,
        },
        { transaction: t },
      );

      return { user, doctor };
    });

    await this.emailService.sendMail(
      result.user.email,
      'Sua conta de doutor foi criada',
      `Olá Dr(a). ${result.doctor.name},\n\nSua conta foi criada com sucesso.\n\nEmail: ${result.user.email}\nSenha: ${dto.password}\n\nVocê pode acessar o sistema pelo link: ${process.env.FRONT_URL}/login`,
    );
    return result;
  }

  async registerPatientWithInvite(
    dto: RegisterPatientDto,
    companyId: string,
    token: string,
  ) {
    const company = await this.companyModel.findOne({
      where: { company_id: companyId, active: true },
    });

    if (!company) {
      throw new HttpException(
        'Company not found or inactive',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!company.invite_token || company.invite_token !== token) {
      throw new HttpException('Invalid invite token', HttpStatus.BAD_REQUEST);
    }

    dto.company_id = companyId;

    const existingUser = await this.userModel.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new HttpException('Email already in use', HttpStatus.BAD_REQUEST);
    }

    const existingPatient = await this.patientModel.findOne({
      where: { cpf: dto.profile.cpf },
    });
    if (existingPatient) {
      throw new HttpException('CPF already in use', HttpStatus.BAD_REQUEST);
    }

    return this.sequelize.transaction(async (t) => {
      const user = await this.userModel.create(
        {
          email: dto.email,
          password: dto.password,
          role: 'patient',
          company_id: companyId,
        },
        { transaction: t },
      );

      const patientData = {
        ...dto.profile,
        user_id: user.user_id,
        company_id: companyId,
      };

      const profile = await this.patientModel.create(patientData, {
        transaction: t,
      });

      return { user, profile };
    });
  }

  async registerAdmin(dto: RegisterAdminDto, companyId?: string) {
    if (!companyId) {
      if (!dto.company_id) {
        throw new HttpException(
          'company_id is required when creating admin as super_admin',
          HttpStatus.BAD_REQUEST,
        );
      }
      companyId = dto.company_id;
    }

    const existingUser = await this.userModel.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new HttpException('Email already in use', HttpStatus.BAD_REQUEST);
    }

    const existingAdmin = await this.adminModel.findOne({
      where: { cpf: dto.profile.cpf },
    });
    if (existingAdmin) {
      throw new HttpException('CPF already in use', HttpStatus.BAD_REQUEST);
    }

    const company = await this.companyModel.findOne({
      where: { company_id: companyId, active: true },
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
          company_id: companyId,
        },
        { transaction: t },
      );

      const adminData = {
        ...dto.profile,
        user_id: user.user_id,
        company_id: companyId,
      };

      const profile = await this.adminModel.create(adminData, {
        transaction: t,
      });

      const inviteToken = randomBytes(16).toString('hex');
      await company.update({ invite_token: inviteToken }, { transaction: t });

      const frontUrl = process.env.FRONT_URL;
      const inviteLink = `${frontUrl}/register/patient?companyId=${companyId}&token=${inviteToken}`;

      return { user, profile, inviteLink };
    });
  }

  async sendPasswordResetCode(email: string) {
    const user = await this.userModel.findOne({ where: { email } });

    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const now = new Date();

    if (
      user.last_reset_request_at &&
      now.getTime() - user.last_reset_request_at.getTime() < 2 * 60 * 1000
    ) {
      const remainingSeconds = Math.ceil(
        (2 * 60 * 1000 -
          (now.getTime() - user.last_reset_request_at.getTime())) /
          1000,
      );
      throw new HttpException(
        `You must wait ${remainingSeconds} seconds before requesting another reset code.`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    user.reset_code = code;
    user.reset_code_used = false;
    user.reset_code_expires_at = new Date(Date.now() + 2 * 60 * 1000);
    user.last_reset_request_at = now;

    await user.save();

    await this.emailService.sendMail(
      user.email,
      'Password reset code',
      `Your code is: ${code}. It expires in 2 minutes.`,
    );

    return { message: 'Reset code sent to email' };
  }

  async validateResetCode(email: string, code: string) {
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const now = new Date();

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

    return { message: 'Code is valid' };
  }

  async resetPasswordWithCode(
    email: string,
    code: string,
    newPassword: string,
  ) {
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const now = new Date();

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

    await user.update({
      password: newPassword,
      reset_code_used: true,
    });

    return { message: 'Password updated successfully' };
  }
}
