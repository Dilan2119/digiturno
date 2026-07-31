import { IsString, IsInt, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class CreateVisorDto {
  @IsInt()
  salaId: number;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsObject()
  configMultimedia?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  mostrarCedula?: boolean;
}
