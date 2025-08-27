import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { IsFutureDateConstraint } from './types';
import { AppointmentStatus } from './types';
import { Type } from 'class-transformer';
import { CreatePatientInlineDto } from 'src/modules/patient/dtos/Create-patientInline.dto';

export class CreateAppoimentsDto {
  @IsNotEmpty()
  @IsDateString({}, { message: 'Date must be in ISO 8601 format' })
  @Validate(IsFutureDateConstraint)
  dateTime: string;

  @IsEnum(AppointmentStatus, { message: 'Status da consulta inválido' })
  status: AppointmentStatus;

  @IsOptional()
  @IsString()
  notes: string;

  @IsUUID()
  doctor_id: string;

  @IsOptional()
  @IsUUID()
  patient_id?: string;

  @IsOptional()
  @IsUUID()
  company_id?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePatientInlineDto)
  patient?: CreatePatientInlineDto;
}
