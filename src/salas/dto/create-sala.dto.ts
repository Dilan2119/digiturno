import { IsString, IsInt } from 'class-validator';

export class CreateSalaDto {
  @IsInt()
  sedeId: number;

  @IsString()
  nombre: string;
}
