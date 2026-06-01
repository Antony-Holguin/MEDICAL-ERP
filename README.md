# 🚀 NestJS Backend Template

<p align="center">
  Template de backend profesional y production-ready construido con NestJS, Prisma y PostgreSQL
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-10.x-E0234E?style=flat&logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/Node.js-22.x-339933?style=flat&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-6.x-2D3748?style=flat&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat&logo=redis" alt="Redis" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker" alt="Docker" />
</p>

## 📋 Descripción

**NestJS Backend Template** es un template de API REST production-ready diseñado para acelerar el desarrollo de nuevos proyectos. Desarrollado con las mejores prácticas y tecnologías modernas, incluye:

- 🔐 **Autenticación y Autorización** con JWT y sistema RBAC completo
- 👥 **RBAC (Role-Based Access Control)** con permisos granulares por recursos y acciones
- 📧 **Sistema de correos** con colas de procesamiento (Bull + Redis)
- 🗄️ **Base de datos** PostgreSQL con Prisma ORM
- 📝 **Documentación API** automática con Swagger
- 🐳 **Containerización** completa con Docker y Docker Compose
- 🔒 **Encriptación** de datos sensibles
- 📊 **Logging** estructurado con Pino
- ✅ **Sistema de validación** robusto con class-validator
- 🏗️ **Arquitectura modular** escalable y mantenible

> **💡 Template Reutilizable**: Este proyecto está diseñado como base para múltiples aplicaciones. Clónalo, personaliza los módulos según tu necesidad y comienza a desarrollar de inmediato.

## 📑 Tabla de Contenidos

1. [¿Por Qué Usar Este Template?](#-por-qué-usar-este-template)
2. [Inicio Rápido](#-inicio-rápido-con-el-template)
3. [Scripts Disponibles](#️-scripts-disponibles)
4. [Arquitectura](#️-arquitectura-del-proyecto)
5. [Variables de Entorno](#-variables-de-entorno)
6. [Documentación API](#-documentación-api)
7. [Módulos Incluidos](#-módulos-y-modelos-incluidos)
8. [Cómo Usar Este Template](#-cómo-usar-este-template)
9. [Testing](#-testing)
10. [Troubleshooting](#-troubleshooting)

## ✨ ¿Por Qué Usar Este Template?

- ⚡ **Acelera el desarrollo**: Ahorra semanas de configuración inicial
- 🏗️ **Arquitectura probada**: Patrones y estructura escalables desde el día 1
- 🔒 **Seguridad incluida**: RBAC, JWT, encriptación ya implementados
- 📦 **Módulos reutilizables**: Sistema de usuarios, roles y permisos listo para usar
- 🐳 **Production-ready**: Docker, logging, manejo de errores configurados
- 📚 **Bien documentado**: Código claro con ejemplos y guías
- 🧪 **Testing incluido**: Configuración de Jest para tests unitarios y e2e

## 🎬 Inicio Rápido con el Template

### 1️⃣ Clonar y Personalizar

```bash
# Clona este template
git clone <repository-url> mi-nuevo-proyecto
cd mi-nuevo-proyecto

# Elimina el git existente y crea uno nuevo (opcional)
rm -rf .git
git init
git add .
git commit -m "Initial commit from template"

# Actualiza package.json
# Cambia: name, description, author, version
```

### 2️⃣ Requisitos Previos

- Node.js >= 22.20.0
- pnpm >= 10.9.3
- PostgreSQL 16 (o usar Docker)
- Redis 7 (o usar Docker)

---

### 3️⃣ Opción A: Con Docker (Recomendado) 🐳

La forma más rápida de empezar es usando Docker:

```bash
# 1. Copiar y configurar variables de entorno
cp .env.example .env
# Edita .env y configura JWT_SECRET, DATABASE_URL, etc.

# 2. Iniciar todos los servicios (PostgreSQL + Redis + App)
docker-compose up -d

# 3. Ver logs
docker-compose logs -f app
```

✅ **La API estará disponible en**: http://localhost:3000/api  
📚 **Swagger UI**: http://localhost:3000/docs

👉 Para más información sobre Docker, consulta [DOCKER.md](./DOCKER.md)

---

### 4️⃣ Opción B: Instalación Local

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus configuraciones

# 3. Generar cliente Prisma
pnpm prisma generate

# 4. Ejecutar migraciones
pnpm prisma migrate deploy

# 5. (Opcional) Ejecutar seeds para datos de prueba
pnpm run seed

# 6. Iniciar en modo desarrollo
pnpm run start:dev
```

✅ **La API estará disponible en**: http://localhost:3000/api  
📚 **Swagger UI**: http://localhost:3000/docs

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
pnpm run start:dev          # Inicia el servidor en modo watch
pnpm run start:debug        # Inicia con debugger

# Producción
pnpm run build              # Compila el proyecto
pnpm run start:prod         # Inicia en modo producción

# Base de Datos
pnpm prisma generate        # Genera el cliente Prisma
pnpm prisma migrate dev     # Crea y aplica migraciones
pnpm prisma migrate deploy  # Aplica migraciones en producción
pnpm prisma studio          # Abre Prisma Studio
pnpm run seeds              # Ejecuta seeds de datos

# Testing
pnpm run test               # Tests unitarios
pnpm run test:watch         # Tests en modo watch
pnpm run test:cov           # Tests con cobertura
pnpm run test:e2e           # Tests end-to-end

# Calidad de Código
pnpm run lint               # Ejecuta ESLint
pnpm run format             # Formatea código con Prettier
```

## 🏗️ Arquitectura del Proyecto

El template implementa **Clean Architecture / Arquitectura en Capas** siguiendo los principios SOLID y las mejores prácticas de NestJS.

```
src/
├── auth/                   # 🔐 Módulo de autenticación
│   ├── controller/        # Endpoints de auth (login, register, etc.)
│   ├── dto/              # DTOs de autenticación
│   ├── decorators/       # @Public(), @CurrentUser(), @Roles()
│   ├── guards/           # JwtAuthGuard, PermissionsGuard, RolesGuard
│   ├── services/         # Lógica de auth y hash de contraseñas
│   └── strategy/         # JWT Strategy para Passport
│
├── core/                  # 🌐 Funcionalidades transversales
│   ├── config/           # Configuración de env variables
│   ├── filters/          # Exception filters globales
│   ├── middlewares/      # RequestId, logging
│   ├── models/           # Modelos compartidos (paginación)
│   ├── services/         # Servicios compartidos (encriptación, logs)
│   └── utils/            # Utilidades reutilizables
│
├── modules/              # 📦 Módulos de negocio
│   ├── user/            # CRUD de usuarios
│   ├── rol/             # Sistema de roles
│   ├── permission/      # Control de permisos
│   ├── resource/        # Recursos del sistema
│   └── mail/            # Sistema de correos con colas
│   └── [tu-modulo]/     # 👈 Añade tus propios módulos aquí
│
├── prisma/              # 🗄️ Conexión a base de datos
│   └── services/        # PrismaService
│
├── generated/           # 🤖 Cliente Prisma generado
│
├── app.module.ts        # Módulo raíz
└── main.ts              # Bootstrap de la aplicación

prisma/
├── schema.prisma        # 📝 Definición del schema
├── migrations/          # 📂 Historial de migraciones
└── seeds/              # 🌱 Datos iniciales
```

> **📖 Documentación Detallada**: Revisa [ARCHITECTURE.md](ARCHITECTURE.md) para entender a fondo los patrones y lineamientos de desarrollo.

## 🔐 Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
# Base de Datos
DATABASE_URL=postgresql://user:password@localhost:5432/your_database_name

# JWT
JWT_SECRET=tu-clave-secreta-jwt-cambiar-en-produccion
JWT_EXPIRE=3600s

# Encriptación
DATA_KEY=clave-de-32-caracteres-minimo
HMAC_KEY=clave-hmac-32-caracteres-minimo

# Redis (para colas)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=tu-password

# Correo
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=user@example.com
MAIL_PASSWORD=password
MAIL_FROM="Your App <noreply@yourapp.com>"

# General
PORT=3000
ENVIRONMENT=development
FRONT_URL=http://localhost:4200
```

⚠️ **Importante**: Nunca subas el archivo `.env` a git. Usa `.env.example` como plantilla.

## 📚 Documentación API

Una vez iniciada la aplicación, accede a la documentación interactiva de Swagger:

🔗 **http://localhost:3000/docs**

La documentación incluye:

- Todos los endpoints disponibles
- Modelos de datos
- Autenticación con Bearer Token
- Ejemplos de requests/responses
- Posibilidad de probar los endpoints directamente

## 🐳 Despliegue con Docker

El proyecto incluye configuración completa de Docker para desarrollo y producción:

```bash
# Desarrollo
docker-compose up -d

# Producción (con build optimizado)
docker-compose -f docker-compose.yml up -d --build

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

Ver [DOCKER.md](./DOCKER.md) para instrucciones detalladas.

## 🧪 Testing

```bash
# Tests unitarios
pnpm run test

# Tests en modo watch
pnpm run test:watch

# Coverage
pnpm run test:cov

# Tests e2e
pnpm run test:e2e
```

## 🔧 Tecnologías Principales

| Tecnología       | Versión | Propósito                |
| ---------------- | ------- | ------------------------ |
| **NestJS**       | 10.x    | Framework principal      |
| **TypeScript**   | 5.x     | Lenguaje de programación |
| **Prisma**       | 6.x     | ORM para base de datos   |
| **PostgreSQL**   | 16      | Base de datos relacional |
| **Redis**        | 7       | Colas y caché            |
| **Bull**         | 4.x     | Procesamiento de colas   |
| **Passport JWT** | 4.x     | Autenticación            |
| **Argon2**       | 0.44.x  | Hash de contraseñas      |
| **Swagger**      | 11.x    | Documentación API        |
| **Pino**         | 10.x    | Logging estructurado     |

## 📁 Módulos y Modelos Incluidos

### Módulos Core Implementados:

- **User**: Gestión completa de usuarios con CRUD
- **Rol**: Sistema de roles con permisos granulares
- **Permission**: Control de acceso basado en recursos y acciones
- **Resource**: Definición de recursos del sistema
- **Mail**: Sistema de envío de correos con colas
- **Auth**: Autenticación JWT, registro, login, recuperación de contraseña

### Características del Sistema RBAC:

- ✅ Roles multi-nivel con permisos personalizables
- ✅ Permisos por recurso (CREATE, READ, UPDATE, DELETE, EXPORT, etc.)
- ✅ Guards reutilizables: `@RequirePermission()`, `@Roles()`, `@Public()`
- ✅ Sistema flexible para añadir nuevos recursos y acciones

> **💡 Personalización**: Añade tus propios módulos de negocio siguiendo la estructura establecida. Los módulos de ejemplo sirven como guía de arquitectura.

## 🔒 Seguridad

- ✅ Autenticación JWT con refresh tokens
- ✅ Hash de contraseñas con Argon2
- ✅ Encriptación de datos sensibles
- ✅ Guards de autorización por roles
- ✅ Validación de datos con class-validator
- ✅ Protección CORS configurada
- ✅ Rate limiting (configurable)
- ✅ Usuario no-root en contenedor Docker

## 🔧 Cómo Usar Este Template

### 1. Personalización Inicial

```bash
# Clona el template
git clone <repo-url> mi-nuevo-proyecto
cd mi-nuevo-proyecto

# Actualiza el package.json con tu información
# Cambia: name, description, author, repository

# Actualiza las variables de entorno
cp .env.example .env
# Configura tus credenciales y secretos
```

### 2. Adapta el Schema de Prisma

Edita [prisma/schema.prisma](prisma/schema.prisma) según tus necesidades:

- Mantén los modelos base (User, Rol, Permission) si usas RBAC
- Añade tus propios modelos de negocio
- Ejecuta `pnpm prisma migrate dev` para crear las migraciones

### 3. Crea Nuevos Módulos

Usa el CLI de NestJS para generar módulos con la estructura completa:

```bash
# Generar un nuevo módulo completo
nest g resource modules/product

# Sigue la estructura de carpetas existente:
# - controller/
# - dto/
# - entity/
# - mapper/
# - repository/
# - service/
```

### 4. Configura los Permisos

En [prisma/seeds/seed.ts](prisma/seeds/seed.ts):

- Define los recursos de tu aplicación
- Asigna permisos a los roles
- Ejecuta `pnpm run seed` para poblar la base de datos

## 🤝 Contribución

Si mejoras este template y quieres compartir tus cambios:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Convenciones de Código

- **TypeScript** con configuración strict
- **ESLint** para linting
- **Prettier** para formateo automático
- **Conventional Commits** para mensajes de commit
- **Arquitectura modular** siguiendo principios SOLID
- **DTOs** para todas las operaciones de entrada/salida
- **Mappers** para transformación entre entidades y DTOs
- **Repository pattern** para acceso a datos

## 🎯 Características Destacadas del Template

### Sistema RBAC Completo

- Control de acceso granular por recursos y acciones
- Guards reutilizables y decoradores personalizados
- Fácil de extender con nuevos recursos

### Sistema de Correos Profesional

- Colas de procesamiento con Bull y Redis
- Plantillas con React Email
- Manejo de errores y reintentos

### Seguridad de Nivel Enterprise

- Autenticación JWT con refresh tokens
- Encriptación de datos sensibles
- Hash de contraseñas con Argon2
- Validación robusta con class-validator

### Developer Experience

- Hot reload en desarrollo
- Documentación automática con Swagger
- Logging estructurado con Pino
- Docker Compose para desarrollo
- Scripts de seeds y migraciones

## 🐛 Troubleshooting

### Error de conexión a base de datos

```bash
# Verifica que PostgreSQL esté corriendo
docker-compose ps postgres

# Revisa las credenciales en .env
cat .env | grep DATABASE_URL

# Reinicia los servicios
docker-compose restart postgres
```

### Error de migraciones Prisma

```bash
# Resetea las migraciones (solo desarrollo)
pnpm prisma migrate reset

# Regenera el cliente
pnpm prisma generate

# Aplica las migraciones
pnpm prisma migrate dev
```

### Puerto 3000 ya en uso

```bash
# Cambia el puerto en .env
PORT=3001

# O mata el proceso que usa el puerto
lsof -ti:3000 | xargs kill -9
```

### Redis no conecta

```bash
# Verifica que Redis esté corriendo
docker-compose ps redis

# Revisa los logs
docker-compose logs redis
```

## 📞 Soporte

Para reportar bugs, solicitar features o contribuir con mejoras al template, por favor abre un issue en el repositorio.

## 👨‍💻 Autor

**Ricardo Yaguachi**

## 📄 Licencia

Este proyecto es privado y propietario - UNLICENSED

> **Nota**: Al usar este template en tus proyectos, puedes cambiar esta licencia según tus necesidades.

---

<p align="center">
  <strong>⭐ Si este template te es útil, considera darle una estrella ⭐</strong>
</p>

<p align="center">
  Desarrollado con ❤️ usando <a href="https://nestjs.com/">NestJS</a>
</p>
