import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
  password: string;

  @IsNotEmpty()
  @IsEnum(['patient', 'doctor', 'admin'], {
    message: 'Role must be either patient, doctor or admin',
  })
  role: 'patient' | 'doctor' | 'admin';
}
