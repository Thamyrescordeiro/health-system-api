import { IsIn, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsIn(['doctor', 'patient', 'admin'])
  role: 'doctor' | 'patient' | 'admin';
}
