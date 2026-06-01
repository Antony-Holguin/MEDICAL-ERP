# Docker - Facturador Backend

Este documento proporciona instrucciones para ejecutar la aplicación usando Docker.

## 📋 Requisitos Previos

- Docker 20.10+
- Docker Compose 2.0+

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` y actualiza las siguientes variables **OBLIGATORIAS**:

```env
# JWT - ¡CAMBIA ESTO!
JWT_SECRET=tu-clave-secreta-jwt-muy-segura

# Encryption - ¡CAMBIA ESTO!
DATA_KEY=tu-clave-de-encriptacion-de-datos-minimo-32-caracteres
HMAC_KEY=tu-clave-hmac-minimo-32-caracteres

# Mail - Configura tu servidor SMTP
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=tu-password-de-aplicacion
MAIL_FROM="Facturador <noreply@facturador.com>"
```

### 2. Construir y Ejecutar

```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs solo de la aplicación
docker-compose logs -f app
```

### 3. Verificar Estado

```bash
# Ver estado de los contenedores
docker-compose ps

# La aplicación estará disponible en:
# - API: http://localhost:3000/api
# - Swagger: http://localhost:3000/docs
```

## 🛠️ Comandos Útiles

### Gestión de Contenedores

```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (¡CUIDADO! Elimina la base de datos)
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart app

# Reconstruir la imagen de la aplicación
docker-compose build app

# Reconstruir sin caché
docker-compose build --no-cache app
```

### Base de Datos y Migraciones

```bash
# Ejecutar migraciones manualmente
docker-compose exec app npx prisma migrate deploy

# Ver estado de migraciones
docker-compose exec app npx prisma migrate status

# Abrir Prisma Studio
docker-compose exec app npx prisma studio

# Acceder a PostgreSQL
docker-compose exec postgres psql -U postgres -d facturador
```

### Desarrollo y Debugging

```bash
# Ejecutar shell en el contenedor de la aplicación
docker-compose exec app sh

# Ver logs en tiempo real
docker-compose logs -f app

# Inspeccionar un contenedor
docker inspect facturador-app
```

## 🏗️ Estructura de Servicios

### PostgreSQL

- **Puerto**: 5432
- **Base de datos**: facturador
- **Usuario**: postgres
- **Volumen**: `postgres_data` (persistente)

### Redis

- **Puerto**: 6379
- **Autenticación**: Habilitada con password
- **Volumen**: `redis_data` (persistente)

### Aplicación NestJS

- **Puerto**: 3000
- **Health Check**: Habilitado
- **Logs**: Montados en `./logs`

## 🔒 Seguridad

### Variables Sensibles a Cambiar

Antes de producción, **DEBES** cambiar:

1. `JWT_SECRET` - Usa una clave aleatoria fuerte
2. `DATA_KEY` - Mínimo 32 caracteres aleatorios
3. `HMAC_KEY` - Mínimo 32 caracteres aleatorios
4. `POSTGRES_PASSWORD` - Contraseña fuerte para la base de datos
5. `REDIS_PASSWORD` - Contraseña fuerte para Redis

### Generar Claves Seguras

```bash
# En macOS/Linux
openssl rand -base64 32

# Generar múltiples claves
for i in {1..3}; do openssl rand -base64 32; done
```

## 🐳 Solo Docker (sin Docker Compose)

### Construir la Imagen

```bash
docker build -t facturador-backend .
```

### Ejecutar el Contenedor

```bash
docker run -d \
  --name facturador-app \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e REDIS_HOST="redis-host" \
  -e REDIS_PORT="6379" \
  -e JWT_SECRET="tu-secret" \
  -e DATA_KEY="tu-data-key" \
  -e HMAC_KEY="tu-hmac-key" \
  facturador-backend
```

## 📊 Monitoreo

### Health Check

El contenedor incluye un health check automático que verifica cada 30 segundos:

```bash
# Ver estado de salud
docker inspect --format='{{.State.Health.Status}}' facturador-app
```

### Recursos

```bash
# Ver uso de recursos
docker stats facturador-app

# Ver uso de recursos de todos los servicios
docker-compose stats
```

## 🔧 Troubleshooting

### La aplicación no inicia

```bash
# Verificar logs
docker-compose logs app

# Verificar que la base de datos esté lista
docker-compose exec postgres pg_isready

# Verificar que Redis esté funcionando
docker-compose exec redis redis-cli ping
```

### Error de migraciones

```bash
# Resetear migraciones (¡CUIDADO! Solo en desarrollo)
docker-compose exec app npx prisma migrate reset --force

# Ejecutar migraciones manualmente
docker-compose exec app npx prisma migrate deploy
```

### Problemas de permisos

```bash
# Verificar permisos del directorio logs
chmod -R 777 logs

# O crear el directorio con los permisos correctos
mkdir -p logs && chown -R 1001:1001 logs
```

### Limpiar todo y empezar de nuevo

```bash
# Detener y eliminar todo
docker-compose down -v

# Eliminar imágenes
docker rmi facturador-backend

# Limpiar sistema Docker
docker system prune -a
```

## 🚀 Despliegue en Producción

### Variables de Entorno Adicionales

```env
NODE_ENV=production
ENVIRONMENT=production
```

### Recomendaciones

1. **Usa Docker Secrets** para variables sensibles
2. **Configura límites de recursos**:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 1G
   ```
3. **Habilita logs externos** (ELK, CloudWatch, etc.)
4. **Usa un reverse proxy** (Nginx, Traefik) para SSL/TLS
5. **Configura backups automáticos** de PostgreSQL

## 📝 Notas

- Las migraciones se ejecutan automáticamente al iniciar el contenedor
- Los logs se guardan en el directorio `./logs` montado como volumen
- El usuario dentro del contenedor es `nestjs` (UID: 1001) por seguridad
- El health check verifica que el servidor esté respondiendo

## 🤝 Soporte

Para problemas o preguntas:

1. Revisa los logs: `docker-compose logs`
2. Verifica la configuración de variables de entorno
3. Consulta la documentación de NestJS y Prisma
