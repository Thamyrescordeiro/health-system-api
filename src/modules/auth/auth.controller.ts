import {
  Controller,
  Post,
  Body,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDoctorDto } from './dtos/register-doctor.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { RegisterPatientDto } from './dtos/register-patient.dto';
import { RegisterAdminDto } from './dtos/register-admin.dto';
import { RolesGuard } from './guards/roles.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @Post('register/patient')
  async registerPatient(
    @Body() dto: RegisterPatientDto,
    @Query('companyId') companyId: string,
    @Query('token') token: string,
  ) {
    if (!companyId || !token) {
      throw new HttpException('Invalid invite', HttpStatus.BAD_REQUEST);
    }

    dto.company_id = companyId;

    return this.authService.registerPatientWithInvite(dto, companyId, token);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('register/doctor')
  async registerDoctor(
    @Body() dto: RegisterDoctorDto,
    @Request() req: { user: { company_id: string; role: string } },
  ) {
    return this.authService.registerDoctor(
      dto,
      req.user.company_id,
      req.user.role,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Post('register/admins')
  async registerAdmin(@Body() dto: RegisterAdminDto) {
    return this.authService.registerAdmin(dto, dto.company_id);
  }

  @Post('forgot-password')
  @UseGuards(RateLimitGuard)
  async sendPasswordResetCode(@Body('email') email: string) {
    return this.authService.sendPasswordResetCode(email);
  }

  @Post('reset-password')
  async resetPasswordWithCode(
    @Body('email') email: string,
    @Body('code') code: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPasswordWithCode(email, code, newPassword);
  }
}
