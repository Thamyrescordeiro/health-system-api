import {
  Controller,
  Request,
  Post,
  Body,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

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
    @Body() dto: Omit<RegisterDto, 'company_id'>, // remove company_id do DTO
    @Query('company_id') companyId: string,
  ) {
    if (!companyId) {
      throw new BadRequestException('Company ID is required');
    }

    return this.authService.registerPatient({ ...dto, company_id: companyId });
  }

  @Post('register/doctor')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  async registerDoctor(
    @Body() dto: RegisterDto,
    @Request() req: { user: { company_id: string; role: string } },
  ) {
    return this.authService.registerDoctor(dto, req.user.role);
  }

  @Post('register/admins')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async registerAdmin(@Body() dto: RegisterDto) {
    return this.authService.registerAdmin(dto);
  }

  @Post('forgot-password')
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
