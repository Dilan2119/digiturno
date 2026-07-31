-- DropForeignKey
ALTER TABLE "turno_eventos" DROP CONSTRAINT "turno_eventos_usuarioId_fkey";

-- AlterTable
ALTER TABLE "turno_eventos" ALTER COLUMN "usuarioId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "turno_eventos" ADD CONSTRAINT "turno_eventos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
