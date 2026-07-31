import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/digiturno?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  const hash = await bcrypt.hash('123456', 10);

  // ---- Sedes ----
  const sedeNorte = await prisma.sede.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, nombre: 'Sede Norte', direccion: 'Av. Principal 123', activa: true },
  });
  const sedeSur = await prisma.sede.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, nombre: 'Sede Sur', direccion: 'Calle Secundaria 456', activa: true },
  });

  // ---- Servicios ----
  const servicios = [
    { id: 1, sedeId: 1, nombre: 'Vacunación', prefijo: 'VAC' },
    { id: 2, sedeId: 1, nombre: 'Medicina General', prefijo: 'MED' },
    { id: 3, sedeId: 1, nombre: 'Pediatría', prefijo: 'PED' },
    { id: 4, sedeId: 2, nombre: 'Vacunación', prefijo: 'VAC' },
    { id: 5, sedeId: 2, nombre: 'Odontología', prefijo: 'ODT' },
  ];
  for (const s of servicios) {
    await prisma.servicio.upsert({ where: { id: s.id }, update: {}, create: s });
  }

  // ---- Salas ----
  const salaNorte1 = await prisma.sala.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, sedeId: 1, nombre: 'Sala Principal' },
  });
  const salaNorte2 = await prisma.sala.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, sedeId: 1, nombre: 'Sala Pediatría' },
  });
  const salaSur1 = await prisma.sala.upsert({
    where: { id: 3 },
    update: {},
    create: { id: 3, sedeId: 2, nombre: 'Sala Principal' },
  });

  // ---- Visores ----
  await prisma.visor.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, salaId: 1, nombre: 'Visor Principal Norte', mostrarCedula: false },
  });
  await prisma.visor.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, salaId: 2, nombre: 'Visor Pediatría Norte', mostrarCedula: true },
  });
  await prisma.visor.upsert({
    where: { id: 3 },
    update: {},
    create: { id: 3, salaId: 3, nombre: 'Visor Principal Sur', mostrarCedula: false },
  });

  // ---- Módulos ----
  await prisma.modulo.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, sedeId: 1, nombre: 'Módulo 1' },
  });
  await prisma.modulo.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, sedeId: 1, nombre: 'Módulo 2' },
  });
  await prisma.modulo.upsert({
    where: { id: 3 },
    update: {},
    create: { id: 3, sedeId: 1, nombre: 'Módulo 3' },
  });
  await prisma.modulo.upsert({
    where: { id: 4 },
    update: {},
    create: { id: 4, sedeId: 2, nombre: 'Módulo 1' },
  });

  // ---- Usuarios ----
  const usuarios = [
    { id: 1, sedeId: null as number | null, nombre: 'Admin Central', email: 'admin@digiturno.com', rol: 'admin_central' },
    { id: 2, sedeId: 1, nombre: 'Dr. López', email: 'lopez@digiturno.com', rol: 'profesional' },
    { id: 3, sedeId: 1, nombre: 'Dra. García', email: 'garcia@digiturno.com', rol: 'profesional' },
    { id: 4, sedeId: 2, nombre: 'Dr. Martínez', email: 'martinez@digiturno.com', rol: 'profesional' },
    { id: 5, sedeId: 1, nombre: 'Recepcionista Norte', email: 'recep@digiturno.com', rol: 'dispensador' },
    { id: 6, sedeId: 2, nombre: 'Recepcionista Sur', email: 'recep2@digiturno.com', rol: 'dispensador' },
  ];
  for (const u of usuarios) {
    const { id, sedeId, nombre, email, rol } = u;
    await prisma.usuario.upsert({
      where: { id },
      update: {},
      create: { id, sedeId, nombre, email, passwordHash: hash, rol: rol as any },
    });
  }

  // ---- Contadores iniciales ----
  const hoy = new Date();
  hoy.setUTCHours(0, 0, 0, 0);
  for (const s of servicios) {
    await prisma.contadorTurno.upsert({
      where: { servicioId_fecha: { servicioId: s.id, fecha: hoy } },
      update: {},
      create: { servicioId: s.id, fecha: hoy, ultimoNumero: 0 },
    });
  }

  console.log('Seed complete.');
  console.log('  Users: admin@digiturno.com / 123456 (admin_central)');
  console.log('         lopez@digiturno.com / 123456 (profesional, Sede Norte)');
  console.log('         recep@digiturno.com / 123456 (dispensador, Sede Norte)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
