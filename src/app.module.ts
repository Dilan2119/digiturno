import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SedesModule } from './sedes/sedes.module';
import { SalasModule } from './salas/salas.module';
import { VisoresModule } from './visores/visores.module';
import { ServiciosModule } from './servicios/servicios.module';
import { ModulosModule } from './modulos/modulos.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { TurnosModule } from './turnos/turnos.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PlaylistModule } from './playlist/playlist.module';
import { UploadModule } from './upload/upload.module';
import { PublicController } from './public/public.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    SedesModule,
    SalasModule,
    VisoresModule,
    ServiciosModule,
    ModulosModule,
    UsuariosModule,
    TurnosModule,
    DashboardModule,
    PlaylistModule,
    UploadModule,
  ],
  controllers: [PublicController],
})
export class AppModule {}
