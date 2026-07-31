import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateSedeDto {
  @IsString()
  nombre: string;

  @IsString()
  direccion: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}
