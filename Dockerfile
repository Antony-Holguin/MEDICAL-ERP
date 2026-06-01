# =========================
# Etapa 1: Builder
# =========================
FROM node:22-alpine AS builder

# Instalar dependencias necesarias para compilación de módulos nativos y Prisma
RUN apk add --no-cache libc6-compat openssl python3 make g++

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json pnpm-lock.yaml ./

# Instalar pnpm y dependencias incluyendo scripts de build
RUN npm install -g pnpm@latest
RUN pnpm config set dangerouslyAllowAllBuilds true
RUN pnpm install

# Copiar el resto del código fuente
COPY . .

# Generar cliente Prisma
RUN npx prisma generate

# Compilar la app
RUN pnpm run build

# Verificar dist
RUN ls -la /app/dist && echo "✅ Build completado"

# =========================
# Etapa 2: Producción
# =========================
FROM node:22-alpine AS production

# Dependencias runtime mínimas
RUN apk add --no-cache dumb-init libc6-compat openssl

WORKDIR /app

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Copiar node_modules primero (mayor peso)
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copiar archivos de configuración
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Copiar directorio de migraciones Prisma
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Copiar cliente Prisma generado
COPY --from=builder --chown=nestjs:nodejs /app/src/generated ./src/generated

# Copiar código compilado (lo más importante)
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Verificar que los archivos fueron copiados correctamente
RUN ls -la /app/ && \
    ls -la /app/dist/ && \
    echo "✅ Archivos copiados a producción"

# Crear directorio de logs
RUN mkdir -p /app/logs && chown -R nestjs:nodejs /app/logs

# Cambiar a usuario no-root
USER nestjs

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production \
    PORT=3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicio: migraciones y app
CMD ["sh", "-c", "ls && npx prisma migrate deploy && npm run start:prod"]
