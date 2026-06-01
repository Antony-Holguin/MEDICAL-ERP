# 🚀 Guía de Despliegue en Dockploy

Esta guía te ayudará a desplegar **Facturador Backend** en Dockploy.

## 📋 Pre-requisitos

- Cuenta en Dockploy o instancia de Dockploy configurada
- Repositorio Git accesible (GitHub, GitLab, etc.)
- Base de datos PostgreSQL 16 (puede ser en Dockploy o externa)
- Redis 7 (puede ser en Dockploy o externo)

## 🏗️ Arquitectura de Despliegue

```
┌─────────────────────────────────────────┐
│           DOCKPLOY                       │
├─────────────────────────────────────────┤
│                                          │
│  ┌──────────────────┐                   │
│  │  PostgreSQL 16   │◄──┐               │
│  │   (Database)     │   │               │
│  └──────────────────┘   │               │
│                          │               │
│  ┌──────────────────┐   │               │
│  │    Redis 7       │◄──┼──┐            │
│  │    (Queue)       │   │  │            │
│  └──────────────────┘   │  │            │
│                          │  │            │
│  ┌──────────────────┐   │  │            │
│  │  Facturador API  │───┘  │            │
│  │  (NestJS App)    │──────┘            │
│  │  Puerto: 3000    │                   │
│  └──────────────────┘                   │
│                                          │
└─────────────────────────────────────────┘
```

## 🔧 Paso 1: Preparar Servicios de Base de Datos

### Opción A: PostgreSQL en Dockploy

1. En Dockploy, crea una nueva **Base de Datos PostgreSQL**
2. Configura:
   - **Nombre**: `facturador-db`
   - **Versión**: PostgreSQL 16
   - **Usuario**: `postgres` (o personalizado)
   - **Contraseña**: Genera una contraseña segura
   - **Base de datos**: `facturador`
3. Guarda la **URL de conexión** generada

### Opción B: PostgreSQL Externa

Si usas una base de datos externa (AWS RDS, DigitalOcean, etc.):

```
postgresql://usuario:contraseña@host:5432/database?schema=public
```

### Redis en Dockploy

1. Crea un nuevo servicio **Redis**
2. Configura:
   - **Nombre**: `facturador-redis`
   - **Versión**: Redis 7
   - **Contraseña**: Genera una contraseña segura
3. Guarda el **host** y **puerto**

## 🚀 Paso 2: Configurar la Aplicación en Dockploy

### 2.1 Crear Nueva Aplicación

1. En Dockploy, haz clic en **"Nueva Aplicación"**
2. Selecciona **"Deploy from Git"**
3. Configura:
   - **Nombre**: `facturador-backend`
   - **Repositorio**: URL de tu repositorio Git
   - **Rama**: `main` (o la que uses)
   - **Build Type**: `Dockerfile`
   - **Dockerfile Path**: `./Dockerfile`

### 2.2 Configurar Variables de Entorno

En la sección de **Variables de Entorno**, agrega:

#### Variables Obligatorias

```bash
# Base de Datos
DATABASE_URL=postgresql://usuario:password@host:5432/facturador?schema=public

# JWT - ¡GENERA CLAVES SEGURAS!
JWT_SECRET=tu-clave-jwt-super-secreta-cambiar-en-produccion
JWT_EXPIRE=3600s

# Encriptación - ¡GENERA CLAVES SEGURAS!
DATA_KEY=clave-de-encriptacion-minimo-32-caracteres-aleatorios
HMAC_KEY=clave-hmac-minimo-32-caracteres-aleatorios-seguros

# Redis
REDIS_HOST=nombre-del-servicio-redis
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=tu-password-redis

# Configuración General
NODE_ENV=production
PORT=3000
ENVIRONMENT=production
```

#### Variables de Correo Electrónico

```bash
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=tu-app-password
MAIL_FROM="Facturador <noreply@facturador.com>"
```

#### Variables Opcionales

```bash
FRONT_URL=https://tu-frontend.com
```

### 2.3 Generar Claves Seguras

Para generar claves seguras, usa estos comandos en tu terminal local:

```bash
# JWT Secret
openssl rand -base64 48

# DATA_KEY (debe ser exactamente 32 caracteres)
openssl rand -base64 32

# HMAC_KEY (debe ser exactamente 32 caracteres)
openssl rand -base64 32
```

### 2.4 Configurar Puerto

- **Puerto del Contenedor**: `3000`
- Dockploy automáticamente asignará un puerto externo y configurará el proxy inverso

### 2.5 Configurar Health Check (Opcional pero Recomendado)

Dockploy puede usar el health check del Dockerfile:
- **Endpoint**: `/api` o `/docs`
- **Intervalo**: 30s
- **Timeout**: 10s
- **Start Period**: 60s

## 🔐 Paso 3: Configurar Dominio (Opcional)

1. En Dockploy, ve a la configuración de tu aplicación
2. Agrega tu **dominio personalizado**: `api.tudominio.com`
3. Dockploy automáticamente configurará:
   - Certificado SSL (Let's Encrypt)
   - Reverse proxy
   - Redirección HTTPS

## 🚀 Paso 4: Desplegar

1. Haz clic en **"Deploy"** en Dockploy
2. Dockploy automáticamente:
   - Clonará tu repositorio
   - Construirá la imagen Docker
   - Ejecutará las migraciones de Prisma
   - Iniciará el contenedor
   - Configurará el networking

### Tiempo Estimado
- **Primera construcción**: 5-8 minutos
- **Despliegues posteriores**: 2-4 minutos (con caché)

## 📊 Paso 5: Verificar Despliegue

### 5.1 Ver Logs

En Dockploy, ve a la pestaña **"Logs"** para ver:
- Logs de construcción
- Logs de la aplicación
- Errores de inicio

### 5.2 Probar la API

```bash
# Reemplaza con tu URL de Dockploy
curl https://tu-app.dockploy.io/api

# Debería devolver un 404 con información de la API
```

### 5.3 Acceder a Swagger

```
https://tu-app.dockploy.io/docs
```

### 5.4 Verificar Base de Datos

Desde los logs, verifica que veas:
```
✓ Prisma Migrate applied successfully
✓ Application started on port 3000
```

## 🔄 Actualizaciones y Re-despliegues

### Despliegue Automático

Configura webhooks en Dockploy para desplegar automáticamente cuando hagas push a la rama principal:

1. En Dockploy, habilita **"Auto Deploy"**
2. Selecciona la rama: `main`
3. Cada push activará un nuevo despliegue

### Despliegue Manual

1. Ve a tu aplicación en Dockploy
2. Haz clic en **"Redeploy"**
3. Selecciona si quieres:
   - Usar caché (más rápido)
   - Build limpio (--no-cache)

## 🔍 Monitoreo y Mantenimiento

### Ver Logs en Tiempo Real

```bash
# En Dockploy, usa la interfaz web de logs
# O si tienes acceso SSH:
docker logs -f nombre-del-contenedor
```

### Métricas

Dockploy muestra:
- CPU usage
- Memoria usage
- Network I/O
- Uptime

### Backups de Base de Datos

Configura backups automáticos de PostgreSQL en Dockploy:
1. Ve a tu base de datos PostgreSQL
2. Configura **"Backups Automáticos"**
3. Frecuencia recomendada: Diaria

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

**Solución**:
1. Verifica que el `DATABASE_URL` sea correcto
2. Asegúrate de que PostgreSQL esté corriendo
3. Verifica que el servicio de la app pueda comunicarse con PostgreSQL en Dockploy

```bash
# El formato correcto es:
DATABASE_URL=postgresql://usuario:password@nombre-servicio-db:5432/database?schema=public
```

### Error: "Prisma migrate failed"

**Solución**:
1. Verifica que la base de datos esté vacía o tenga el esquema correcto
2. Si necesitas resetear (¡CUIDADO! Borrará datos):
   ```bash
   # Conecta por SSH al contenedor y ejecuta:
   npx prisma migrate reset --force
   ```

### Error: "Redis connection refused"

**Solución**:
1. Verifica que Redis esté corriendo
2. Verifica `REDIS_HOST`, `REDIS_PORT` y `REDIS_PASSWORD`
3. Asegúrate de usar el nombre del servicio Redis interno de Dockploy

### La aplicación se reinicia constantemente

**Solución**:
1. Revisa los logs para ver el error
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que el health check no esté fallando

### Error 502 Bad Gateway

**Solución**:
1. Verifica que la app esté escuchando en el puerto 3000
2. Revisa los logs de la aplicación
3. Asegúrate de que el health check esté pasando

## ⚡ Optimizaciones de Rendimiento

### 1. Habilitar Caché de Build

Dockploy cachea las capas de Docker automáticamente. Para optimizar:

```dockerfile
# El Dockerfile ya está optimizado con:
# - Multi-stage build
# - Copiar package.json primero (caché de dependencias)
# - Usar pnpm con --frozen-lockfile
```

### 2. Configurar Resources

En Dockploy, configura límites de recursos:

**Recomendado para inicio**:
- **CPU**: 0.5-1 vCPU
- **Memoria**: 512 MB - 1 GB
- **Storage**: 2-5 GB

**Para producción**:
- **CPU**: 1-2 vCPU
- **Memoria**: 1-2 GB
- **Storage**: 10-20 GB

### 3. Configurar Réplicas (Escalabilidad)

Para alta disponibilidad:
1. En Dockploy, configura **múltiples réplicas**
2. Dockploy automáticamente hace load balancing
3. Recomendado: 2-3 réplicas para producción

## 🔒 Seguridad en Producción

### Checklist de Seguridad

- [ ] Cambiar `JWT_SECRET` a un valor aleatorio fuerte
- [ ] Cambiar `DATA_KEY` a un valor aleatorio de 32+ caracteres
- [ ] Cambiar `HMAC_KEY` a un valor aleatorio de 32+ caracteres
- [ ] Usar contraseñas fuertes para PostgreSQL
- [ ] Usar contraseñas fuertes para Redis
- [ ] Configurar CORS solo para tu frontend
- [ ] Habilitar SSL/TLS (automático con Dockploy)
- [ ] Configurar rate limiting
- [ ] Habilitar backups automáticos
- [ ] Revisar logs regularmente

### Variables Sensibles

**NUNCA** pongas en el repositorio:
- Claves JWT
- Credenciales de base de datos
- API keys
- Passwords de correo

Usa las variables de entorno de Dockploy.

## 📈 Escalabilidad

### Horizontal Scaling

Dockploy soporta múltiples instancias:
1. Aumenta el número de réplicas
2. Dockploy balancea la carga automáticamente

### Vertical Scaling

Si necesitas más recursos:
1. Aumenta CPU/Memoria en la configuración
2. Redeploy la aplicación

### Database Scaling

Para mayor rendimiento de base de datos:
1. Considera PostgreSQL managed (AWS RDS, etc.)
2. Configura read replicas
3. Implementa caché con Redis

## 📞 Soporte

### Recursos Útiles

- [Documentación Dockploy](https://dockploy.com/docs)
- [Documentación NestJS](https://docs.nestjs.com)
- [Documentación Prisma](https://www.prisma.io/docs)

### Logs Importantes

Guarda estos logs para debugging:
```bash
# Logs de construcción
# Logs de la aplicación
# Logs de migraciones
# Logs de errores
```

## ✅ Checklist Final de Despliegue

Antes de marcar como completado:

- [ ] Base de datos PostgreSQL configurada y accesible
- [ ] Redis configurado y accesible
- [ ] Todas las variables de entorno configuradas
- [ ] Claves de seguridad generadas y configuradas
- [ ] Aplicación desplegada exitosamente
- [ ] Migraciones aplicadas correctamente
- [ ] Health check pasando
- [ ] API respondiendo en `/api`
- [ ] Swagger disponible en `/docs`
- [ ] Logs sin errores críticos
- [ ] SSL/TLS configurado (si usas dominio)
- [ ] Backups configurados
- [ ] Monitoreo activo

---

**Última actualización**: Octubre 2025  
**Plataforma**: Dockploy  
**Aplicación**: Facturador Backend v0.0.1
