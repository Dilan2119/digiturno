import { IsString, IsInt, IsOptional, IsArray } from 'class-validator';

export class CreateSalaDto {
  @IsInt()
  sedeId: number;

  @IsString()
  nombre: string;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  serviciosIds?: number[];
}
