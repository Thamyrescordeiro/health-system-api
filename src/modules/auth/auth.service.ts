import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../user/user.entity';

interface UserPayload {
  user_id: string;
  email: string;
  role: 'patient' | 'doctor';
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly jwtService: JwtService,
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
}
