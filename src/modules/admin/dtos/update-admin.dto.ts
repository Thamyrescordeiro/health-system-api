import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CreateAdminDto } from './create-admin.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
