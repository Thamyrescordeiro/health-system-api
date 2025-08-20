import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
  IsUUID,
} from 'class-validator';
import { IsFutureDateConstraint } from './types';
import { AppointmentStatus } from './types';

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
}
