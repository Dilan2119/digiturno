-- CreateEnum
CREATE TYPE "rol" AS ENUM ('admin_central', 'profesional', 'dispensador');

-- CreateEnum
CREATE TYPE "status_turno" AS ENUM ('waiting', 'called', 'attending', 'absent', 'finished');

-- CreateEnum
CREATE TYPE "tipo_evento" AS ENUM ('creado', 'llamado', 're_llamado', 'ausente', 'iniciado_atencion', 'finalizado');

-- CreateEnum
CREATE TYPE "tipo_media" AS ENUM ('imagen', 'video');

-- CreateTable
CREATE TABLE "sedes" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "direccion" VARCHAR(500) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sedes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salas" (
    "id" SERIAL NOT NULL,
    "sede_id" INTEGER NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,

    CONSTRAINT "salas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visores" (
    "id" SERIAL NOT NULL,
    "sala_id" INTEGER NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "config_multimedia" JSONB,
    "mostrar_cedula" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "visores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicios" (
    "id" SERIAL NOT NULL,
    "sede_id" INTEGER NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "prefijo" VARCHAR(20) NOT NULL,

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modulos" (
    "id" SERIAL NOT NULL,
    "sede_id" INTEGER NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,

    CONSTRAINT "modulos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "sede_id" INTEGER,
    "nombre" VARCHAR(200) NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "password_hash" VARCHAR(200) NOT NULL,
    "rol" "rol" NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnos" (
    "id" SERIAL NOT NULL,
    "sede_id" INTEGER NOT NULL,
    "servicio_id" INTEGER NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "cedula" VARCHAR(20) NOT NULL,
    "status" "status_turno" NOT NULL DEFAULT 'waiting',
    "modulo_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turno_eventos" (
    "id" SERIAL NOT NULL,
    "turno_id" INTEGER NOT NULL,
    "tipo_evento" "tipo_evento" NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "turno_eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlist" (
    "id" SERIAL NOT NULL,
    "visor_id" INTEGER NOT NULL,
    "tipo" "tipo_media" NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contador_turnos" (
    "id" SERIAL NOT NULL,
    "servicio_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "ultimo_numero" INTEGER NOT NULL,

    CONSTRAINT "contador_turnos_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE UNIQUE INDEX "salas_sede_id_nombre_key" ON "salas"("sede_id", "nombre");
CREATE UNIQUE INDEX "servicios_sede_id_nombre_key" ON "servicios"("sede_id", "nombre");
CREATE UNIQUE INDEX "servicios_sede_id_prefijo_key" ON "servicios"("sede_id", "prefijo");
CREATE UNIQUE INDEX "modulos_sede_id_nombre_key" ON "modulos"("sede_id", "nombre");
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
CREATE UNIQUE INDEX "contador_turnos_servicio_id_fecha_key" ON "contador_turnos"("servicio_id", "fecha");

CREATE INDEX "turnos_sede_id_status_idx" ON "turnos"("sede_id", "status");
CREATE INDEX "turnos_servicio_id_created_at_idx" ON "turnos"("servicio_id", "created_at");
CREATE INDEX "turnos_sede_id_created_at_idx" ON "turnos"("sede_id", "created_at");
CREATE INDEX "turnos_codigo_idx" ON "turnos"("codigo");
CREATE INDEX "turno_eventos_turno_id_timestamp_idx" ON "turno_eventos"("turno_id", "timestamp");
CREATE INDEX "playlist_visor_id_orden_activo_idx" ON "playlist"("visor_id", "orden", "activo");

-- AddForeignKeys
ALTER TABLE "salas" ADD CONSTRAINT "salas_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "visores" ADD CONSTRAINT "visores_sala_id_fkey" FOREIGN KEY ("sala_id") REFERENCES "salas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "servicios" ADD CONSTRAINT "servicios_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "modulos" ADD CONSTRAINT "modulos_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "modulos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "turno_eventos" ADD CONSTRAINT "turno_eventos_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "turnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "turno_eventos" ADD CONSTRAINT "turno_eventos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "playlist" ADD CONSTRAINT "playlist_visor_id_fkey" FOREIGN KEY ("visor_id") REFERENCES "visores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "contador_turnos" ADD CONSTRAINT "contador_turnos_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
