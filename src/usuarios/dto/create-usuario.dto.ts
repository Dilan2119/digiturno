import { IsString, IsEmail, IsOptional, IsInt, IsEnum } from 'class-validator';

export class CreateUsuarioDto {
  @IsOptional()
  @IsInt()
  sedeId?: number;

  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(['admin_central', 'profesional', 'dispensador'])
  rol: 'admin_central' | 'profesional' | 'dispensador';
}
