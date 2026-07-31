import { IsString, IsInt } from 'class-validator';

export class CreateModuloDto {
  @IsInt()
  sedeId: number;

  @IsString()
  nombre: string;
}
