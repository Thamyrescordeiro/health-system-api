import { IsOptional, IsUUID } from 'class-validator';
import { AppointmentStatus } from './types';

export class UpdateAppoimentsDto {
  @IsOptional()
  dateTime?: string;

  @IsOptional()
  status?: AppointmentStatus;

  @IsOptional()
  notes?: string;

  @IsUUID()
  patient_id: string;

  @IsUUID()
  doctor_id: string;
}
