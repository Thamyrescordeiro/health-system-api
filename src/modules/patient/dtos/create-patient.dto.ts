import { IsDateString, IsNotEmpty, IsString, Length } from 'class-validator';
import { IsCPF } from './types';

export class CreatePatientDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 20)
  name: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 20)
  lastName: string;

  @IsNotEmpty()
  @IsString()
  @IsCPF()
  cpf: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsDateString()
  birthDate: string;
}
