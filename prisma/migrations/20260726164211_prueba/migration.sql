/*
  Warnings:

  - You are about to drop the column `servicio_id` on the `contador_turnos` table. All the data in the column will be lost.
  - You are about to drop the column `sede_id` on the `modulos` table. All the data in the column will be lost.
  - You are about to drop the column `visor_id` on the `playlist` table. All the data in the column will be lost.
  - You are about to drop the column `sede_id` on the `salas` table. All the data in the column will be lost.
  - You are about to drop the column `sede_id` on the `servicios` table. All the data in the column will be lost.
  - You are about to drop the column `turno_id` on the `turno_eventos` table. All the data in the column will be lost.
  - You are about to drop the column `usuario_id` on the `turno_eventos` table. All the data in the column will be lost.
  - You are about to drop the column `modulo_id` on the `turnos` table. All the data in the column will be lost.
  - You are about to drop the column `sede_id` on the `turnos` table. All the data in the column will be lost.
  - You are about to drop the column `servicio_id` on the `turnos` table. All the data in the column will be lost.
  - You are about to drop the column `sede_id` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `sala_id` on the `visores` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[servicioId,fecha]` on the table `contador_turnos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sedeId,nombre]` on the table `modulos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sedeId,nombre]` on the table `salas` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sedeId,nombre]` on the table `servicios` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sedeId,prefijo]` on the table `servicios` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `servicioId` to the `contador_turnos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sedeId` to the `modulos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `visorId` to the `playlist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sedeId` to the `salas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sedeId` to the `servicios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `turnoId` to the `turno_eventos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `turno_eventos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sedeId` to the `turnos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `servicioId` to the `turnos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salaId` to the `visores` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "contador_turnos" DROP CONSTRAINT "contador_turnos_servicio_id_fkey";

-- DropForeignKey
ALTER TABLE "modulos" DROP CONSTRAINT "modulos_sede_id_fkey";

-- DropForeignKey
ALTER TABLE "playlist" DROP CONSTRAINT "playlist_visor_id_fkey";

-- DropForeignKey
ALTER TABLE "salas" DROP CONSTRAINT "salas_sede_id_fkey";

-- DropForeignKey
ALTER TABLE "servicios" DROP CONSTRAINT "servicios_sede_id_fkey";

-- DropForeignKey
ALTER TABLE "turno_eventos" DROP CONSTRAINT "turno_eventos_turno_id_fkey";

-- DropForeignKey
ALTER TABLE "turno_eventos" DROP CONSTRAINT "turno_eventos_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "turnos" DROP CONSTRAINT "turnos_modulo_id_fkey";

-- DropForeignKey
ALTER TABLE "turnos" DROP CONSTRAINT "turnos_sede_id_fkey";

-- DropForeignKey
ALTER TABLE "turnos" DROP CONSTRAINT "turnos_servicio_id_fkey";

-- DropForeignKey
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_sede_id_fkey";

-- DropForeignKey
ALTER TABLE "visores" DROP CONSTRAINT "visores_sala_id_fkey";

-- DropIndex
DROP INDEX "contador_turnos_servicio_id_fecha_key";

-- DropIndex
DROP INDEX "modulos_sede_id_nombre_key";

-- DropIndex
DROP INDEX "playlist_visor_id_orden_activo_idx";

-- DropIndex
DROP INDEX "salas_sede_id_nombre_key";

-- DropIndex
DROP INDEX "servicios_sede_id_nombre_key";

-- DropIndex
DROP INDEX "servicios_sede_id_prefijo_key";

-- DropIndex
DROP INDEX "turno_eventos_turno_id_timestamp_idx";

-- DropIndex
DROP INDEX "turnos_sede_id_created_at_idx";

-- DropIndex
DROP INDEX "turnos_sede_id_status_idx";

-- DropIndex
DROP INDEX "turnos_servicio_id_created_at_idx";

-- AlterTable
ALTER TABLE "contador_turnos" DROP COLUMN "servicio_id",
ADD COLUMN     "servicioId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "modulos" DROP COLUMN "sede_id",
ADD COLUMN     "sedeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "playlist" DROP COLUMN "visor_id",
ADD COLUMN     "visorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "salas" DROP COLUMN "sede_id",
ADD COLUMN     "sedeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "servicios" DROP COLUMN "sede_id",
ADD COLUMN     "sedeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "turno_eventos" DROP COLUMN "turno_id",
DROP COLUMN "usuario_id",
ADD COLUMN     "turnoId" INTEGER NOT NULL,
ADD COLUMN     "usuarioId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "turnos" DROP COLUMN "modulo_id",
DROP COLUMN "sede_id",
DROP COLUMN "servicio_id",
ADD COLUMN     "moduloId" INTEGER,
ADD COLUMN     "sedeId" INTEGER NOT NULL,
ADD COLUMN     "servicioId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "sede_id",
ADD COLUMN     "sedeId" INTEGER;

-- AlterTable
ALTER TABLE "visores" DROP COLUMN "sala_id",
ADD COLUMN     "salaId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "contador_turnos_servicioId_fecha_key" ON "contador_turnos"("servicioId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "modulos_sedeId_nombre_key" ON "modulos"("sedeId", "nombre");

-- CreateIndex
CREATE INDEX "playlist_visorId_orden_activo_idx" ON "playlist"("visorId", "orden", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "salas_sedeId_nombre_key" ON "salas"("sedeId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "servicios_sedeId_nombre_key" ON "servicios"("sedeId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "servicios_sedeId_prefijo_key" ON "servicios"("sedeId", "prefijo");

-- CreateIndex
CREATE INDEX "turno_eventos_turnoId_timestamp_idx" ON "turno_eventos"("turnoId", "timestamp");

-- CreateIndex
CREATE INDEX "turnos_sedeId_status_idx" ON "turnos"("sedeId", "status");

-- CreateIndex
CREATE INDEX "turnos_servicioId_created_at_idx" ON "turnos"("servicioId", "created_at");

-- CreateIndex
CREATE INDEX "turnos_sedeId_created_at_idx" ON "turnos"("sedeId", "created_at");

-- AddForeignKey
ALTER TABLE "salas" ADD CONSTRAINT "salas_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visores" ADD CONSTRAINT "visores_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "salas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicios" ADD CONSTRAINT "servicios_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modulos" ADD CONSTRAINT "modulos_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "sedes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "servicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "modulos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turno_eventos" ADD CONSTRAINT "turno_eventos_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "turnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turno_eventos" ADD CONSTRAINT "turno_eventos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist" ADD CONSTRAINT "playlist_visorId_fkey" FOREIGN KEY ("visorId") REFERENCES "visores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contador_turnos" ADD CONSTRAINT "contador_turnos_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "servicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
