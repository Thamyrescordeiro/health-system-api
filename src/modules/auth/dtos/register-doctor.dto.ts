import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { CreateDoctorDto } from 'src/modules/doctors/dtos/create-doctors.dto';

export class RegisterDoctorDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @ValidateNested()
  @Type(() => CreateDoctorDto)
  profile: CreateDoctorDto;
}
