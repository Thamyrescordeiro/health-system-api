import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsCPF } from './types';

export class CreatePatientInlineDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  @IsCPF()
  cpf: string;

  @IsNotEmpty()
  @IsString()
  birthDate: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
