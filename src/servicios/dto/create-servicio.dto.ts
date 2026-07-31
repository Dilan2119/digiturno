import { IsString, IsInt } from 'class-validator';

export class CreateServicioDto {
  @IsInt()
  sedeId: number;

  @IsString()
  nombre: string;

  @IsString()
  prefijo: string;
}
