# Guía de inicio para desarrolladores

Esta guía cubre todo lo que necesitas para levantar el proyecto desde cero sin tropezar con los problemas comunes.

---

## Requisitos previos

Antes de empezar, asegúrate de tener instalado:

- **Node.js** v20 o superior → `node --version`
- **pnpm** → `npm install -g pnpm`
- **PostgreSQL** corriendo localmente (puerto 5432)
- **Redis** corriendo localmente (puerto 6379)

> Si no tienes PostgreSQL o Redis instalados localmente, puedes levantarlos con Docker.
> Ve a la sección **"Levantar servicios con Docker"** al final de esta guía.

---

## 1. Clonar e instalar dependencias

```bash
git clone <url-del-repositorio>
cd back-template
pnpm install
```

> **Nota:** Si `pnpm install` falla con un error sobre "build scripts", ejecuta:
> ```bash
> pnpm config set dangerouslyAllowAllBuilds true
> pnpm install
> ```
> Esto es necesario porque pnpm v10+ bloquea scripts de compilación por defecto,
> y paquetes como `argon2` y `@prisma/client` los requieren.

---

## 2. Configurar variables de entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

Ahora edita `.env` y reemplaza cada valor. A continuación se explica qué es cada uno y cómo generarlo.

---

### 2.1 Base de datos (PostgreSQL)

```env
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/facturador"
```

Reemplaza `tu_password` con la contraseña de tu usuario `postgres` local.

Verifica que la base de datos exista:

```bash
psql -U postgres -c "CREATE DATABASE facturador;" 2>/dev/null && echo "Creada" || echo "Ya existía"
```

---

### 2.2 Redis (cola de emails)

```env
DATABASE_BULL_URL="redis://:redis_password@localhost:6379"
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=redis_password
```

Si tu Redis local no tiene contraseña, déjalo así:

```env
DATABASE_BULL_URL="redis://localhost:6379"
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=
```

---

### 2.3 JWT Secret

Se usa para firmar y verificar los tokens de autenticación. Genera uno con:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copia el resultado en:

```env
JWT_SECRET=pega_aqui_el_resultado
```

> **Nunca compartas ni subas este valor a git.** Si alguien lo tiene, puede crear tokens falsos y acceder a la API como cualquier usuario.

---

### 2.4 DATA_KEY y HMAC_KEY

Estas claves protegen los datos sensibles de los usuarios en la base de datos.

- **DATA_KEY** — encripta/desencripta campos como nombre, apellido y email en la BD (AES-256)
- **HMAC_KEY** — genera un hash del email para poder buscarlo sin desencriptarlo

Genera ambas con un solo comando:

```bash
node -e "
const crypto = require('crypto');
console.log('DATA_KEY=' + crypto.randomBytes(32).toString('base64'));
console.log('HMAC_KEY=' + crypto.randomBytes(32).toString('hex'));
"
```

Copia cada valor en su variable correspondiente en `.env`.

> **Importante:** Si cambias estas claves después de tener usuarios en la base de datos,
> no podrás leer sus datos. Guárdalas en un lugar seguro desde el primer día.

---

### 2.5 Correo (opcional en desarrollo)

Puedes dejar estos valores de ejemplo por ahora. El sistema de emails fallará silenciosamente en desarrollo si no los configuras, pero el resto de la app funciona igual.

```env
MAIL_HOST=your_mail_host
MAIL_PORT=587
MAIL_USER=your_mail_user
MAIL_PASSWORD=your_mail_password
MAIL_FROM=your_mail_from
```

Cuando necesites probar emails, usa [Mailtrap](https://mailtrap.io) — es gratis y captura los correos sin enviarlos realmente.

---

### Ejemplo de `.env` completo listo para desarrollo

```env
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/facturador"
DATABASE_BULL_URL="redis://localhost:6379"

DATA_KEY=TU_DATA_KEY_GENERADA_AQUI
HMAC_KEY=TU_HMAC_KEY_GENERADA_AQUI

JWT_SECRET=TU_JWT_SECRET_GENERADO_AQUI

ENVIRONMENT=development

MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=587
MAIL_USER=tu_usuario_mailtrap
MAIL_PASSWORD=tu_password_mailtrap
MAIL_FROM=noreply@tuapp.com

FRONT_URL=http://localhost:4300

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=
```

---

## 3. Preparar la base de datos

### 3.1 Generar el cliente Prisma

Prisma genera código TypeScript a partir de tu `schema.prisma`. Debes hacerlo antes de iniciar la app o el seeder.

```bash
npx prisma generate
```

> Debes volver a ejecutar esto cada vez que modifiques `prisma/schema.prisma`.

### 3.2 Crear las tablas

```bash
npx prisma migrate deploy
```

Esto aplica todas las migraciones pendientes y crea las tablas en tu base de datos.

### 3.3 Cargar datos iniciales (seed)

```bash
pnpm run seed
```

Esto crea:
- 5 roles: `admin`, `user`, `client`, `accountant`, `auditor`
- 3 recursos: `users`, `roles`, `permission`
- 30 permisos (10 acciones × 3 recursos)
- El rol `admin` recibe todos los permisos automáticamente

---

## 4. Iniciar la app

```bash
pnpm run start:dev
```

La app arranca en `http://localhost:3000`.

Verifica que esté corriendo:

```bash
curl http://localhost:3000/health
```

Documentación Swagger disponible en:

```
http://localhost:3000/api/docs
```

---

## 5. Primer usuario y login

El seed no crea usuarios, solo la estructura de roles y permisos. Crea tu primer usuario administrador desde Swagger o con curl:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "lastName": "Sistema",
    "email": "admin@example.com",
    "password": "Admin1234!",
    "rolId": "ID_DEL_ROL_ADMIN"
  }'
```

> Para obtener el ID del rol `admin`, consulta la base de datos:
> ```bash
> psql -U postgres -d facturador -c "SELECT id, name FROM \"Rol\";"
> ```

Luego haz login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Admin1234!"}'
```

Copia el token JWT de la respuesta y úsalo en Swagger haciendo clic en **Authorize** (candado) → `Bearer TU_TOKEN`.

---

## Levantar servicios con Docker

Si no tienes PostgreSQL o Redis instalados localmente, puedes usar Docker solo para los servicios de base de datos.

### Instalar Docker Compose (si no lo tienes)

```bash
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```

### Levantar solo PostgreSQL y Redis

Edita `docker-compose.yml` y comenta el servicio `app` (para no dockerizar la app en desarrollo), luego:

```bash
docker compose up postgres redis -d
```

Usa esta `DATABASE_URL` en tu `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/facturador"
DATABASE_BULL_URL="redis://:redis_password@localhost:6379"
```

---

## Resumen de comandos

```bash
# Una sola vez al clonar el proyecto
pnpm install
npx prisma generate
npx prisma migrate deploy
pnpm run seed

# Cada vez que inicias el desarrollo
pnpm run start:dev

# Cada vez que modificas schema.prisma
npx prisma migrate dev --name describe_el_cambio
npx prisma generate
```

---

## Problemas frecuentes

| Error | Causa | Solución |
|---|---|---|
| `Cannot find module '.../prisma/client'` | Cliente Prisma no generado | `npx prisma generate` |
| `ERR_PNPM_IGNORED_BUILDS` | pnpm bloquea build scripts | `pnpm config set dangerouslyAllowAllBuilds true` |
| `address already in use :5432` | PostgreSQL ya corre en ese puerto | Usar el PostgreSQL local en vez de Docker |
| `invalid hostPort` | Variables de `.env` con valores de ejemplo | Reemplazar todos los `your_*` en `.env` |
| `Cannot connect to Docker daemon` | Docker no está corriendo | `sudo systemctl start docker` |
| Datos ilegibles en BD | `DATA_KEY` o `HMAC_KEY` cambiados | No cambiar estas claves con datos existentes |
