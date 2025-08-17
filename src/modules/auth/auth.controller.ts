import {
  Controller,
  Request,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
  @Post('register/admin')
  @UseGuards(JwtAuthGuard)
  async registerAdmin(
    @Body() dto: RegisterDto,
    @Req() req: Request & { user?: { role?: string } },
  ) {
    const currentUserRole = req.user?.role;
    return this.authService.register(dto, currentUserRole);
  }
}
