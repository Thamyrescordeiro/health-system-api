import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { CreatePatientDto } from 'src/modules/patient/dtos/create-patient.dto';

export class RegisterPatientDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  company_id: string;

  @ValidateNested()
  @Type(() => CreatePatientDto)
  profile: CreatePatientDto;
}
