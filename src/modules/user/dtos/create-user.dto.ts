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
  @IsEnum(['patient', 'doctor'], {
    message: 'Role must be either patient or doctor',
  })
  role: 'patient' | 'doctor';
}
