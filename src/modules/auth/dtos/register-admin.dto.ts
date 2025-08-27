import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { CreateAdminDto } from 'src/modules/admin/dtos/create-admin.dto';

export class RegisterAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  company_id: string;

  @ValidateNested()
  @Type(() => CreateAdminDto)
  profile: CreateAdminDto;
}
