# Etapa 1: Construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copiar el resto del código y compilar
COPY . .
RUN npx prisma generate
RUN npm run build

# Etapa 2: Producción
FROM node:20-alpine

WORKDIR /app

# Instalar OpenSSL (Requerido por Prisma en Alpine)
RUN apk add --no-cache openssl

# Copiar artefactos de construcción
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Script de inicio: aplica migraciones y levanta la app
CMD sh -c "npx prisma migrate deploy && npm run start:prod"
