import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsUUID()
  company_id: string;

  @IsString()
  @IsIn(['doctor', 'patient', 'admin', 'super_admin'])
  role: 'doctor' | 'patient' | 'admin' | 'super_admin';
}
