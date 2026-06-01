# Mejores Prácticas del Proyecto

Guía de convenciones, patrones y decisiones de arquitectura de este proyecto.
Léela antes de crear cualquier módulo nuevo.

---

## Tabla de contenidos

1. [Arquitectura general](#1-arquitectura-general)
2. [Estructura de un módulo](#2-estructura-de-un-módulo)
3. [Principio de desacoplamiento](#3-principio-de-desacoplamiento)
4. [DTOs y validación](#4-dtos-y-validación)
5. [Repositorios y Prisma](#5-repositorios-y-prisma)
6. [Mappers](#6-mappers)
7. [Manejo de errores](#7-manejo-de-errores)
8. [Autenticación y autorización](#8-autenticación-y-autorización)
9. [Variables de entorno](#9-variables-de-entorno)
10. [Paginación y filtros](#10-paginación-y-filtros)
11. [Logging](#11-logging)
12. [Path aliases](#12-path-aliases)
13. [Migraciones](#13-migraciones)
14. [Seeders](#14-seeders)
15. [Librerías externas — cómo instalarlas](#15-librerías-externas--cómo-instalarlas)

---

## 1. Arquitectura general

El proyecto sigue **Clean Architecture** con separación estricta por capas:

```
HTTP Request
    │
    ▼
Controller     → recibe la petición, delega, responde
    │
    ▼
Service        → lógica de negocio, validaciones de dominio
    │
    ▼
Mapper         → convierte entre DTOs y Entities
    │
    ▼
Repository     → única capa que habla con Prisma
    │
    ▼
PostgreSQL
```

**Regla principal:** cada capa solo conoce a la capa inmediatamente inferior.
El Controller nunca importa el Repository. El Service nunca importa PrismaService directamente.

---

## 2. Estructura de un módulo

Cada módulo de negocio sigue exactamente esta estructura:

```
src/modules/nombre/
├── controller/
│   └── nombre.controller.ts
├── dto/
│   ├── create-nombre.dto.ts
│   ├── update-nombre.dto.ts
│   ├── filter-nombre.dto.ts
│   ├── nombre.dto.ts           ← DTO de respuesta
│   └── index.ts
├── entity/
│   └── nombre.entity.ts        ← implementa la interfaz de Prisma
├── mapper/
│   └── nombre.mapper.ts
├── repository/
│   └── nombre.repository.ts
├── service/
│   └── nombre.service.ts
└── nombre.module.ts
```

El modelo en Prisma va en su propio archivo:

```
prisma/schema/nombre.prisma
```

### Convenciones de nombres

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivos | `kebab-case` | `create-task.dto.ts` |
| Clases | `PascalCase` | `TaskService` |
| Variables/métodos | `camelCase` | `findAll()` |
| Columnas BD | `camelCase` | `createdAt`, `userId` |
| Tablas BD | `PascalCase` | `Task`, `UserRol` |
| Tokens de inyección | `SCREAMING_SNAKE_CASE` | `EXCEL_READER` |

---

## 3. Principio de desacoplamiento

**Toda librería externa debe estar detrás de una interfaz.** Nunca importes una
librería de terceros directamente en un Service o Controller.

Esto permite cambiar la implementación en un solo lugar sin tocar el resto del código.

### Patrón obligatorio para librerías externas

**Paso 1 — Define la interfaz y el token en `src/core/services/<nombre>/`:**

```typescript
// src/core/services/excel/excel-reader.interface.ts
export interface IExcelReader {
  read<T = Record<string, unknown>>(buffer: Buffer, sheet?: number | string): T[];
}

export const EXCEL_READER = 'EXCEL_READER';
```

**Paso 2 — Crea la implementación concreta:**

```typescript
// src/core/services/excel/xlsx-excel-reader.service.ts
import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';           // ← la librería solo entra aquí
import { IExcelReader } from './excel-reader.interface';

@Injectable()
export class XlsxExcelReaderService implements IExcelReader {
  read<T>(buffer: Buffer, sheet: number | string = 0): T[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = typeof sheet === 'number'
      ? workbook.SheetNames[sheet]
      : sheet;
    return XLSX.utils.sheet_to_json<T>(workbook.Sheets[sheetName]);
  }
}
```

**Paso 3 — Registra en `CoreModule` con el token:**

```typescript
// src/core/core.module.ts
{
  provide: EXCEL_READER,
  useClass: XlsxExcelReaderService,  // ← cambias solo esta línea para swapear
}
```

**Paso 4 — Inyecta por token en cualquier Service:**

```typescript
constructor(
  @Inject(EXCEL_READER) private readonly excelReader: IExcelReader,
) {}
```

### Librerías ya desacopladas en este proyecto

| Librería | Interfaz | Token | Implementación |
|---|---|---|---|
| `xlsx` | `IExcelReader` | `EXCEL_READER` | `XlsxExcelReaderService` |
| `argon2` | *(en HashPasswordService)* | — | `HashPasswordService` |
| `nodemailer` | *(en MailService)* | — | `MailService` |

### Cómo cambiar una implementación

Ejemplo: cambiar de `xlsx` a `exceljs`:

```typescript
// 1. Crea la nueva implementación
export class ExceljsExcelReaderService implements IExcelReader {
  read<T>(buffer: Buffer): T[] { /* ... */ }
}

// 2. En CoreModule, cambia una línea
{ provide: EXCEL_READER, useClass: ExceljsExcelReaderService }

// 3. Listo. Ningún otro archivo cambia.
```

---

## 4. DTOs y validación

Los DTOs validan la entrada y documentan el contrato de la API en Swagger.
**Nunca pases el body crudo de una request al servicio.**

### DTO de creación

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Mi tarea', description: 'Título' })
  @IsString({ message: 'El título debe ser texto' })
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
```

### DTO de actualización — siempre extiende con `PartialType`

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
```

### DTO de filtro — siempre extiende `PaginationOptions`

```typescript
import { PaginationOptions } from '@core/models/paginationOptions';

export class FilterTaskDto extends PaginationOptions {
  @ApiProperty({ required: false })
  title?: string;
}
```

### DTO de respuesta — solo los campos que el cliente debe ver

```typescript
export class TaskDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() completed: boolean;
  @ApiProperty() createdAt: Date;
  // nunca expongas: password, emailHash, claves internas
}
```

### Reglas de validación

- Usa `class-validator` para toda validación de entrada
- Siempre incluye `@ApiProperty` en todos los campos (Swagger)
- Usa `@IsOptional()` en campos no requeridos
- Agrega mensajes descriptivos: `@IsString({ message: '...' })`
- El `ValidationPipe` global ya está configurado en `main.ts`

---

## 5. Repositorios y Prisma

### Reglas de oro

1. **`PrismaService` solo se inyecta en Repositories**, nunca en Services ni Controllers
2. Cada modelo de Prisma tiene su propio Repository
3. Los Repositories no contienen lógica de negocio — solo acceso a datos

### Estructura base de un Repository

```typescript
@Injectable()
export class TaskRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: Partial<TaskEntity>) {
    return await this.prismaService.task.create({ data });
  }

  async findAll<T>(where: T, limit: number, page: number) {
    return await this.prismaService.task.findMany({
      where,
      orderBy: { createdAt: Prisma.SortOrder.desc },
      take: getTake(limit, where),
      skip: getSkip(page, limit, where),
    });
  }

  async findById(id: string) {
    return await this.prismaService.task.findFirst({ where: { id } });
  }

  async update(id: string, data: UpdateTaskDto) {
    return await this.prismaService.task.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return await this.prismaService.task.update({
      where: { id },
      data: { state: false },   // ← nunca hard delete en producción
    });
  }

  async count(onlyActive?: boolean): Promise<number> {
    return await this.prismaService.task.count({
      where: { state: onlyActive ? true : undefined },
    });
  }
}
```

### Soft delete obligatorio

Este proyecto **nunca borra registros físicamente**. Siempre usa `state: false`.
Todo modelo debe tener el campo `state Boolean @default(true)` en el schema.

```typescript
// ✅ Correcto
await prismaService.task.update({ where: { id }, data: { state: false } });

// ❌ Prohibido en producción
await prismaService.task.delete({ where: { id } });
```

### Filtros con `buildContainsCondition`

Para búsquedas de texto, usa siempre el helper de `@core/utils`:

```typescript
import { buildContainsCondition } from '@core/utils/buildWhereCondition.utils';

private buildWhereConditions(options: FilterTaskDto) {
  return {
    title: buildContainsCondition(options.title),  // case-insensitive automático
    state: options.onlyActive ? true : undefined,
  };
}
```

---

## 6. Mappers

El Mapper convierte datos entre capas. Su propósito es que ni el Service
ni el Controller conozcan la estructura interna de la base de datos.

```typescript
@Injectable()
export class TaskMapper {
  // BD → respuesta al cliente
  toDto(entity: TaskEntity): TaskDto {
    if (!entity) return null;
    return {
      id: entity.id,
      title: entity.title,
      completed: entity.completed,
      createdAt: entity.createdAt,
    };
  }

  // request del cliente → datos para insertar en BD
  toEntity(dto: CreateTaskDto): Partial<TaskEntity> {
    return {
      title: dto.title,
      description: dto.description ?? null,
      completed: dto.completed ?? false,
    };
  }
}
```

**Cuándo el Mapper hace más trabajo:**
- Encriptar/desencriptar campos sensibles (ver `UserMapper`)
- Calcular campos derivados (`completeName = name + lastName`)
- Transformar tipos (`string` → `Date`, etc.)

---

## 7. Manejo de errores

### En los Services — usa `HttpException`

```typescript
async findOne(id: string): Promise<TaskDto> {
  try {
    const task = await this._taskRepository.findById(id);
    if (!task) throw new HttpException('Tarea no encontrada', HttpStatus.NOT_FOUND);
    return this._taskMapper.toDto(task);
  } catch (error) {
    throw new HttpException(error, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
```

### Respuesta estandarizada automática

El `AllExceptionsFilter` global intercepta todas las excepciones y responde con:

```json
{
  "statusCode": 404,
  "message": "Tarea no encontrada",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "requestId": "uuid-para-rastrear",
  "path": "/api/task/abc123",
  "method": "GET"
}
```

No necesitas formatear las respuestas de error manualmente.

### Nunca hagas esto

```typescript
// ❌ No lances errores genéricos
throw new Error('algo salió mal');

// ❌ No captures excepciones y las ignores
try { ... } catch (e) { }

// ✅ Lanza HttpException con código HTTP apropiado
throw new HttpException('Tarea no encontrada', HttpStatus.NOT_FOUND);
```

---

## 8. Autenticación y autorización

### Los tres niveles de protección

**Nivel 1 — Solo verifica que el token sea válido:**
```typescript
@UseGuards(JwtAuthGuard)
@Get(':id')
findOne(@Param('id') id: string) { }
```

**Nivel 2 — Verifica token + rol:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'accountant')
@Delete(':id')
remove(@Param('id') id: string) { }
```

**Nivel 3 — Verifica token + permiso granular (recurso + acción):**
```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('tasks', ActionType.CREATE)
@Post()
create(@Body() dto: CreateTaskDto) { }
```

### Endpoint público (sin autenticación)

```typescript
@Public()
@Post('login')
login(@Body() dto: LoginDto) { }
```

### Obtener el usuario autenticado en el Controller

```typescript
// El usuario completo del token
@Get('profile')
getProfile(@CurrentUser() user: PayloadModel) { }

// Solo un campo específico
@Get('my-tasks')
getMyTasks(@CurrentUser('id') userId: string) { }
```

### Aplicar el guard a todo el controller

Cuando todos los endpoints del controller requieren el mismo nivel, ponlo en la clase:

```typescript
@UseGuards(JwtAuthGuard)
@Controller('task')
export class TaskController { }
```

---

## 9. Variables de entorno

**Nunca accedas a `process.env` directamente en un Service o Controller.**
Usa siempre `ConfigService` de NestJS.

```typescript
// ❌ Prohibido
const secret = process.env.JWT_SECRET;

// ✅ Correcto
constructor(private readonly configService: ConfigService) {}
const secret = this.configService.get<string>('JWT_SECRET');
```

### Variables requeridas (la app no arranca sin ellas)

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL |
| `JWT_SECRET` | Firma de tokens — mínimo 64 bytes hex |
| `DATA_KEY` | Encriptación AES-256 — exactamente 32 bytes en base64 |
| `HMAC_KEY` | Firma HMAC-SHA256 — 32 bytes hex |

### Generar las claves de seguridad

```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# DATA_KEY y HMAC_KEY juntos
node -e "
const c = require('crypto');
console.log('DATA_KEY=' + c.randomBytes(32).toString('base64'));
console.log('HMAC_KEY=' + c.randomBytes(32).toString('hex'));
"
```

> **DATA_KEY y HMAC_KEY son críticas:** si las cambias después de tener usuarios
> en la BD, los datos encriptados existentes serán ilegibles. Guárdalas en un
> gestor de secretos (AWS Secrets Manager, Vault, etc.) desde el primer día.

---

## 10. Paginación y filtros

### Los listados siempre usan POST con body

```typescript
@Post('all')
findAll(@Body() options: FilterTaskDto) {
  return this.taskService.findAll(options);
}
```

Los filtros y la paginación van en el body, no en query params. Esto permite
estructuras de filtro complejas sin limitaciones de URL.

### Estructura de request

```json
{
  "page": 0,
  "limit": 10,
  "title": "prisma"
}
```

### Estructura de respuesta paginada

```json
{
  "results": [...],
  "total": 42,
  "page": 0,
  "limit": 10
}
```

### Helpers de paginación

```typescript
import { getTake, getSkip } from '@core/utils/pagination.utils';

// En el Repository:
findMany({
  take: getTake(limit, whereConditions),
  skip: getSkip(page, limit, whereConditions),
})
```

> Nota: cuando hay filtros activos, `getTake` y `getSkip` retornan `undefined`
> para traer todos los resultados que coincidan con el filtro.

---

## 11. Logging

El proyecto tiene logging en tres niveles simultáneos:

| Nivel | Dónde | Para qué |
|---|---|---|
| Consola | Terminal | Desarrollo |
| Archivo | `logs/error.log` | Diagnóstico en servidor |
| Base de datos | Tabla `SystemLog` | Auditoría permanente |

### Usa el Logger de NestJS en los Services

```typescript
@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  async create(dto: CreateTaskDto) {
    this.logger.log('Creating task');
    // ...
    this.logger.error('Error creating task', error.stack);
    this.logger.warn('Task already exists');
  }
}
```

### No uses `console.log` en producción

```typescript
// ❌ No usar
console.log('algo pasó');

// ✅ Usar el Logger de NestJS
this.logger.log('algo pasó');
```

### Trazabilidad con requestId

Cada request tiene un `X-Request-Id` único generado por el middleware. Aparece
automáticamente en los logs y en las respuestas de error, lo que permite
rastrear toda la cadena de un request en los logs.

---

## 12. Path aliases

Usa siempre los aliases en lugar de rutas relativas largas:

```typescript
// ❌ Evitar
import { EncryptionService } from '../../../core/services/encryption/encryption.service';

// ✅ Usar aliases
import { EncryptionService } from '@core/services';
import { UserService } from '@modules/user/service/user.service';
import { PrismaService } from '@prisma/services/prisma.service';
```

| Alias | Apunta a |
|---|---|
| `@core/*` | `src/core/*` |
| `@auth/*` | `src/auth/*` |
| `@modules/*` | `src/modules/*` |
| `@prisma/*` | `src/prisma/*` |
| `@generated/*` | `src/generated/*` |

---

## 13. Migraciones

### Flujo en desarrollo

```bash
# 1. Editas prisma/schema/<modelo>.prisma
# 2. Generas y aplicas
npx prisma migrate dev --name describe_el_cambio
# (generate se ejecuta automáticamente)
```

### Flujo en producción

```bash
# Solo aplica migraciones pendientes, nunca resetea
npx prisma migrate deploy
npx prisma generate
```

### No existe rollback — se crea una migración inversa

```bash
# Revertir = modificar el schema al estado anterior + nueva migración
npx prisma migrate dev --name revert_campo_x
```

### Convenciones para nombres de migración

```bash
# ✅ Descriptivos y en snake_case
npx prisma migrate dev --name create_tasks_table
npx prisma migrate dev --name add_priority_to_task
npx prisma migrate dev --name remove_legacy_column_from_user
npx prisma migrate dev --name rename_field_description_in_rol

# ❌ Evitar nombres genéricos
npx prisma migrate dev --name update
npx prisma migrate dev --name fix
```

---

## 14. Seeders

### Estructura obligatoria — un archivo por entidad

Nunca pongas todos los datos en un solo `seed.ts`. Separa cada entidad en su propio archivo:

```
prisma/seeds/
├── seed.ts                  ← orquestador, el único que se ejecuta
└── seeders/
    ├── resource.seeder.ts
    ├── rol.seeder.ts
    ├── permission.seeder.ts
    └── task.seeder.ts       ← cada módulo nuevo agrega su seeder aquí
```

### Cómo crear un seeder

Cada seeder es una función que recibe el cliente Prisma compartido:

```typescript
// prisma/seeds/seeders/task.seeder.ts
import { PrismaClient } from '../../../src/generated/prisma/client';

export async function taskSeeder(prisma: PrismaClient) {
  await prisma.task.createMany({
    data: [
      { title: 'Tarea inicial' },
    ],
    skipDuplicates: true,  // no falla si ya existe
  });

  console.log('  ✔ Tasks');
}
```

### Registrar el seeder en el orquestador

Abre `prisma/seeds/seed.ts` y agrega una línea:

```typescript
const seeders = [
  resourceSeeder,
  rolSeeder,
  permissionSeeder,
  taskSeeder,      // ← solo agregas esto
];
```

> **El orden importa.** Si tu seeder depende de datos de otro
> (por ejemplo, necesita un `rolId`), ponlo después del seeder del que depende.

### Ejecutar

```bash
pnpm run seed
```

Todos los seeders corren en orden con una sola conexión a la BD compartida.

---

## 15. Librerías externas — cómo instalarlas

Cuando necesites instalar una nueva librería, sigue estos pasos:

### Checklist de instalación

- [ ] Instalar con `pnpm add <libreria>`
- [ ] Crear interfaz en `src/core/services/<nombre>/`
- [ ] Crear implementación que `implements` la interfaz
- [ ] Definir token de inyección (`export const TOKEN = 'TOKEN'`)
- [ ] Registrar en `CoreModule` con `provide: TOKEN, useClass: Implementacion`
- [ ] Exportar el token desde `CoreModule`
- [ ] Inyectar con `@Inject(TOKEN)` usando el tipo de la interfaz
- [ ] Actualizar esta documentación en la sección 3

### Librerías ya instaladas y su estado de desacoplamiento

| Librería | Propósito | Desacoplada | Token |
|---|---|---|---|
| `xlsx` | Leer archivos Excel | ✅ | `EXCEL_READER` |
| `argon2` | Hash de contraseñas | ✅ | — (en `HashPasswordService`) |
| `nodemailer` | Envío de emails | ✅ | — (en `MailService`) |
| `ioredis` | Conexión a Redis | ✅ | — (via `BullModule`) |
| `@nestjs/jwt` | Tokens JWT | ✅ | — (via `JwtModule`) |
| `passport-jwt` | Estrategia JWT | ✅ | — (via `JwtStrategy`) |

### Librerías que podrían necesitarse en el futuro

| Propósito | Opción actual | Alternativa posible |
|---|---|---|
| Leer Excel | `xlsx` | `exceljs` |
| Generar PDF | — | `pdfmake` / `puppeteer` |
| Envío de SMS | — | `twilio` / `aws-sns` |
| Storage de archivos | — | `aws-s3` / `minio` |
| Cache | — | `ioredis` / `node-cache` |

Al agregar cualquiera de estas, aplica el mismo patrón de la sección 3.
