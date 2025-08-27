import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { IsCPF } from './types';
import { Unique } from 'sequelize-typescript';

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
  @IsCPF({ message: 'Invalid CPF' })
  @Unique({ name: 'cpf', msg: 'CPF already exists' })
  cpf: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format',
  })
  phone: string;

  @IsNotEmpty()
  @IsDateString()
  birthDate: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
