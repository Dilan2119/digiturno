# Digiturno

Sistema de gestión de turnos multi-sede (NestJS + React + Postgres + Redis).

## Módulos

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Backend API | http://localhost:3000 | NestJS + Socket.IO + Prisma |
| Dispensador | http://localhost:5173 | Totem de emisión de turnos (sede → servicio → nombre → cédula) |
| Atención | http://localhost:5174 | Panel del profesional (llamar/re-llamar/ausente) |
| Visor | http://localhost:5175 | Pantalla de turnos con voz (selecciona sede/sala/visor) |
| CMS | http://localhost:5176 | Admin: sedes, salas, visores, servicios, módulos, usuarios, multimedia |

## Credenciales (seed)

- `admin@digiturno.com / 123456` (admin_central)
- `lopez@digiturno.com / 123456` (profesional)
- `recep@digiturno.com / 123456` (dispensador)

## Requisitos

- **Docker Desktop** (para el modo Docker) o Node 22 + PostgreSQL 16 + Redis
- Docker es la vía recomendada: incluye la base, Redis, backend y los 4 frontends.

## Ejecución con Docker (recomendada)

```bash
git clone <repo-url>
cd Digiturno
docker compose up -d --build
```

Al arrancar, el backend ejecuta las migraciones de Prisma y el seed automáticamente.

Abrir:

- Dispensador: http://localhost:5173
- Atención: http://localhost:5174
- Visor: http://localhost:5175
- CMS: http://localhost:5176

Detener: `docker compose down` (los datos persisten en volúmenes).

## Ejecución en desarrollo

Requisitos: Node 22, PostgreSQL 16 en `localhost:5432`, Redis en `localhost:6379`.

```bash
# 1. Backend (raíz del proyecto)
cp .env.example .env
npm install
npm run prisma:migrate   # crea el esquema
npm run prisma:seed      # datos iniciales
npm run start:dev        # http://localhost:3000

# 2. Frontends (4 terminales)
cd dispensador && npm install && npm run dev   # :5173
cd atencion    && npm install && npm run dev   # :5174
cd visor       && npm install && npm run dev   # :5175
cd cms         && npm install && npm run dev   # :5176
```

> El backend funciona sin Redis en dev: si Redis no está disponible usa el adapter de socket en memoria (los eventos se emiten igual dentro de una sola instancia).

## Notas técnicas

- Multi-sede: `admin_central` ve todo; `profesional`/`dispensador` filtrados a su sede.
- Los turnos se crean con nombre (`nombre`) y cédula (`cedula`); el visor muestra el nombre y lo anuncia por voz.
- Los eventos de turnos se emiten a todas las salas de la sede vía Socket.IO (namespace `/visor`).
- Endpoints públicos para UI kiosk: `/api/public/sedes`, `/api/public/salas`, `/api/public/modulos`, `/api/public/servicios`, `/api/public/visores/*`.
- Los sockets en los frontends usan el mismo origen (proxy de Vite en dev, nginx en Docker); se puede sobrescribir con `VITE_WS_URL`.
