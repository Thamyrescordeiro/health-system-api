import { IsNotEmpty, IsString, Length } from 'class-validator';
import { IsCPF } from './types';

export class CreateAdminDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 20)
  name: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 20)
  lastname: string;

  @IsNotEmpty()
  @IsString()
  @IsCPF()
  cpf: string;

  @IsNotEmpty()
  @IsString()
  phone: string;
}
