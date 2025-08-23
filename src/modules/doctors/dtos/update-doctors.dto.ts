import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CreateDoctorDto } from './create-doctors.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  crm?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  speciality?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
