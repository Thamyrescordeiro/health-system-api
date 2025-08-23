import { IsOptional, IsString, IsDateString, IsBoolean } from 'class-validator';
import { CreatePatientDto } from './create-patient.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
