# Etapa 1: Construcción
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Argumentos para Vite en tiempo de compilación
ARG VITE_API_URL
ARG VITE_WS_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

RUN npm run build

# Etapa 2: Producción (Servidor Nginx)
FROM nginx:alpine

# Copiar estáticos
COPY --from=builder /app/dist /usr/share/nginx/html

# Configurar Nginx para SPA (React Router)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
