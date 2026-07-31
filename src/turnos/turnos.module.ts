import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TurnosController } from './turnos.controller';
import { TurnosService } from './turnos.service';
import { TurnosGateway } from './turnos.gateway';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [TurnosController],
  providers: [TurnosService, TurnosGateway],
})
export class TurnosModule {}
