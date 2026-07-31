import { IsInt, IsString, IsOptional } from 'class-validator';

export class CreateTurnoDto {
  @IsInt()
  servicioId: number;

  @IsString()
  cedula: string;

  @IsOptional()
  @IsString()
  nombre?: string;
}
