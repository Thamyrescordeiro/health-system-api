import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 20)
  name: string;

  @IsNotEmpty()
  @IsString()
  @Length(14, 14)
  cnpj: string;
}
