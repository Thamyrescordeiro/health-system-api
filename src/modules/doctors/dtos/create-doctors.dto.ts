import {
  IsDateString,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateDoctorDto {
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
  @Matches(/^\d{4,10}$/, {
    message: 'CRM must be a number between 4 and 10 digits',
  })
  crm: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsDateString()
  birthDate: string;

  @IsNotEmpty()
  @IsString()
  specialty: string;
}
