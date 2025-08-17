import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateDoctorDto } from 'src/modules/doctors/dtos/create-doctors.dto';
import { CreatePatientDto } from 'src/modules/patient/dtos/create-patient.dto';
import { CreateAdminDto } from 'src/modules/admin/dtos/create-admin.dto';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsIn(['doctor', 'patient', 'admin'])
  role: 'doctor' | 'patient' | 'admin';

  @IsObject()
  @ValidateNested()
  @Type((options) => {
    if (options?.object?.role === 'doctor') return CreateDoctorDto;
    if (options?.object?.role === 'patient') return CreatePatientDto;
    if (options?.object?.role === 'admin') return CreateAdminDto;
    return Object;
  })
  profile: CreateDoctorDto | CreatePatientDto | CreateAdminDto;
}
