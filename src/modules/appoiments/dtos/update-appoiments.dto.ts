import { IsOptional, IsUUID, Validate } from 'class-validator';
import { AppointmentStatus, IsFutureDateConstraint } from './types';

export class UpdateAppoimentsDto {
  @IsOptional()
  @Validate(IsFutureDateConstraint)
  dateTime?: string;

  @IsOptional()
  status?: AppointmentStatus;

  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  patient_id: string;

  @IsUUID()
  @IsOptional()
  doctor_id: string;
}
