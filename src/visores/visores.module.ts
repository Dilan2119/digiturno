import { Module } from '@nestjs/common';
import { VisoresController } from './visores.controller';
import { VisoresService } from './visores.service';

@Module({
  controllers: [VisoresController],
  providers: [VisoresService],
})
export class VisoresModule {}
