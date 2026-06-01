# Prisma para desarrolladores de Laravel

Si vienes de Laravel, ya conoces Eloquent ORM. Esta guía traduce cada concepto que ya sabes a su equivalente en Prisma, usando ejemplos reales de este proyecto.

---

## La gran diferencia mental

En Laravel, el modelo **es** el ORM — extiende `Model` y tiene los métodos de consulta integrados.

En Prisma, hay una separación clara:

| Laravel | Prisma |
|---|---|
| `app/Models/User.php` | `prisma/schema/auth.prisma` (solo define la estructura) |
| `User::find(1)` | `prisma.user.findFirst(...)` (el cliente generado) |
| `php artisan migrate` | `npx prisma migrate dev` |
| `php artisan make:model` | Editas el `.prisma` a mano |
| `$fillable`, `$hidden` | No existe — la validación va en los DTOs |

---

## 1. El Schema (equivalente a las Migrations + Model)

En Laravel defines la estructura en las migrations y el modelo por separado.
En Prisma **todo está en el schema** — estructura, tipos, relaciones e índices.

### Laravel
```php
// migration
Schema::create('tasks', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('title');
    $table->text('description')->nullable();
    $table->boolean('completed')->default(false);
    $table->boolean('state')->default(true);
    $table->timestamps();
});

// modelo
class Task extends Model {
    protected $fillable = ['title', 'description', 'completed'];
}
```

### Prisma
```prisma
// prisma/schema/tasks.prisma
model Task {
  id          String   @id @default(uuid())
  title       String
  description String?       // el ? significa nullable
  completed   Boolean  @default(false)
  state       Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt  // se actualiza automáticamente

  @@index([state])
}
```

---

## 2. Tipos de datos

| Laravel / MySQL | Prisma |
|---|---|
| `string` / `VARCHAR` | `String` |
| `text` | `String` |
| `integer` | `Int` |
| `bigInteger` | `BigInt` |
| `float` / `double` | `Float` |
| `decimal` | `Decimal` |
| `boolean` | `Boolean` |
| `timestamp` / `datetime` | `DateTime` |
| `json` | `Json` |
| `uuid()` | `String @id @default(uuid())` |
| `->nullable()` | `String?` (el `?` al final del tipo) |
| `->default(valor)` | `@default(valor)` |
| `->unique()` | `@unique` |

---

## 3. Migraciones

Esta es una de las diferencias más importantes con Laravel. Entiéndela bien antes de tocar la base de datos.

### La diferencia fundamental con Laravel

En Laravel escribes la migración a mano (`up()` y `down()`).
En Prisma **nunca escribes SQL** — modificas el schema y Prisma genera el SQL por ti.

```
Laravel:  tú escribes la migración → Laravel la ejecuta
Prisma:   tú modificas el schema   → Prisma genera y ejecuta la migración
```

---

### Comandos equivalentes

| Laravel | Prisma | Para qué |
|---|---|---|
| `artisan make:migration` | *(modificas el schema)* | Preparar un cambio |
| `artisan migrate` | `prisma migrate dev` | Aplicar en desarrollo |
| `artisan migrate` | `prisma migrate deploy` | Aplicar en producción |
| `artisan migrate:rollback` | *(nueva migración inversa)* | Revertir un cambio |
| `artisan migrate:status` | `prisma migrate status` | Ver estado |
| `artisan migrate:fresh` | `prisma migrate reset` | Borrar todo y re-migrar |
| `artisan migrate:refresh` | `prisma migrate reset` | Igual que fresh |
| `artisan db:wipe` | `prisma migrate reset --skip-seed` | Solo borrar tablas |

---

### Flujo de desarrollo (el más usado)

**Paso 1 — Modificas el schema**

```prisma
// prisma/schema/tasks.prisma
model Task {
  id    String @id @default(uuid())
  title String
}
```

**Paso 2 — Generas y aplicas la migración**

```bash
npx prisma migrate dev --name create_tasks_table
```

Prisma hace tres cosas automáticamente:
1. Compara tu schema con la base de datos actual
2. Genera el archivo SQL en `prisma/migrations/`
3. Ejecuta ese SQL en tu base de datos y llama a `prisma generate`

---

### Ver el SQL que generará Prisma antes de aplicarlo

```bash
npx prisma migrate dev --name mi_cambio --create-only
```

Crea el archivo SQL en `prisma/migrations/` pero **no lo ejecuta**. Puedes abrirlo,
revisarlo y luego aplicarlo con:

```bash
npx prisma migrate dev
```

---

### Ver el estado de las migraciones

```bash
npx prisma migrate status
```

Ejemplo de salida:
```
3 migrations found in prisma/migrations

✔ 20260108000856_init_db_template
✔ 20260108001727_rename_field_in_permission
✔ 20260108205425_delete_priority_field_in_rol

All migrations have been applied.
```

---

### Rollback — cómo revertir cambios

**En Laravel** existe `migrate:rollback` porque tú escribiste el método `down()`.

**En Prisma no existe rollback automático.** Para revertir, creas una nueva migración
con el cambio inverso. Esto parece incómodo al principio pero es más seguro en producción
porque el historial queda auditado.

#### Ejemplo: agregaste una columna y quieres quitarla

```prisma
// Quita el campo del schema
model Task {
  id    String @id @default(uuid())
  title String
  // priority Int  ← comentado o eliminado
}
```

```bash
npx prisma migrate dev --name remove_priority_from_task
```

Prisma genera automáticamente `ALTER TABLE "Task" DROP COLUMN "priority"`.

---

### Borrar todo y empezar de cero (equivalente a migrate:fresh)

```bash
# Borra todas las tablas, re-aplica todas las migraciones y corre el seed
npx prisma migrate reset

# Sin seed
npx prisma migrate reset --skip-seed
```

> **Cuidado:** Esto borra todos los datos. Úsalo solo en desarrollo.

---

### Aplicar migraciones en producción

En producción **nunca uses `migrate dev`** — ese comando puede resetear datos.
Usa siempre:

```bash
npx prisma migrate deploy
```

| | `migrate dev` | `migrate deploy` |
|---|---|---|
| Entorno | Desarrollo | Producción |
| Genera nuevas migraciones | ✅ Sí | ❌ No |
| Aplica migraciones pendientes | ✅ Sí | ✅ Sí |
| Puede resetear la BD | ✅ Sí (si hay conflictos) | ❌ Nunca |
| Llama a `generate` | ✅ Sí | ❌ No |

En este proyecto, `migrate deploy` se ejecuta automáticamente al iniciar el contenedor
Docker (ver el `CMD` en el `Dockerfile`).

---

### Estructura de la carpeta de migraciones

```
prisma/
└── migrations/
    ├── 20260108000856_init_db_template/
    │   └── migration.sql          ← SQL generado por Prisma
    ├── 20260108001727_rename_field_in_permission/
    │   └── migration.sql
    └── migration_lock.toml        ← no toques este archivo
```

El `migration_lock.toml` guarda el provider para evitar que apliques migraciones
de PostgreSQL en MySQL por accidente.

---

### Prisma Studio (equivalente a Tinker visual / TablePlus)

```bash
npx prisma studio
```

Se abre en `http://localhost:5555` — interfaz web para explorar y editar datos
directamente. Útil para verificar que el seed funcionó correctamente.

---

## 4. El cliente Prisma (equivalente a Eloquent)

En este proyecto, el cliente se inyecta a través de `PrismaService`:

```typescript
// En cualquier Repository
@Injectable()
export class TaskRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // Aquí usas: this.prismaService.task.metodo(...)
  //                                  ↑
  //                        nombre del modelo en minúscula
}
```

El cliente tiene un acceso por cada modelo del schema:
- `prismaService.user`
- `prismaService.rol`
- `prismaService.task`
- etc.

---

## 5. CRUD básico

### Crear un registro

**Laravel:**
```php
$task = Task::create(['title' => 'Mi tarea', 'description' => 'Desc']);
```

**Prisma:**
```typescript
const task = await prismaService.task.create({
  data: {
    title: 'Mi tarea',
    description: 'Desc',
  },
});
```

---

### Crear varios registros a la vez

**Laravel:**
```php
Task::insert([
  ['title' => 'Tarea 1'],
  ['title' => 'Tarea 2'],
]);
```

**Prisma:**
```typescript
await prismaService.task.createMany({
  data: [
    { title: 'Tarea 1' },
    { title: 'Tarea 2' },
  ],
  skipDuplicates: true, // ignora si ya existe (equivalente a insertOrIgnore)
});
```

---

### Buscar por ID

**Laravel:**
```php
$task = Task::find($id);
$task = Task::findOrFail($id);
```

**Prisma:**
```typescript
// Busca por clave primaria — retorna null si no existe
const task = await prismaService.task.findUnique({
  where: { id },
});

// Busca por cualquier campo — retorna el primero que coincida
const task = await prismaService.task.findFirst({
  where: { id },
});
```

> `findUnique` solo funciona con campos marcados como `@id` o `@unique` en el schema.

---

### Obtener todos los registros

**Laravel:**
```php
$tasks = Task::all();
$tasks = Task::where('state', true)->get();
```

**Prisma:**
```typescript
// Todos
const tasks = await prismaService.task.findMany();

// Con filtro
const tasks = await prismaService.task.findMany({
  where: { state: true },
});
```

---

### Actualizar

**Laravel:**
```php
Task::where('id', $id)->update(['title' => 'Nuevo título']);
// o
$task->update(['title' => 'Nuevo título']);
```

**Prisma:**
```typescript
const updated = await prismaService.task.update({
  where: { id },
  data: { title: 'Nuevo título' },
});
```

---

### Eliminar (hard delete)

**Laravel:**
```php
Task::destroy($id);
```

**Prisma:**
```typescript
await prismaService.task.delete({
  where: { id },
});
```

### Soft delete (patrón de este proyecto)

Este proyecto **no usa** `SoftDeletes` de Eloquent. En cambio usa `state: false`:

**Laravel:**
```php
// Con SoftDeletes trait
$task->delete(); // marca deletedAt
Task::withTrashed()->find($id); // incluye eliminados
```

**Prisma (patrón del proyecto):**
```typescript
// "Eliminar" = marcar state como false
await prismaService.task.update({
  where: { id },
  data: { state: false },
});

// Consultar solo activos
await prismaService.task.findMany({
  where: { state: true },
});
```

---

## 6. Filtros y condiciones (WHERE)

**Laravel:**
```php
Task::where('title', 'like', '%prisma%')
    ->where('completed', false)
    ->where('state', true)
    ->get();
```

**Prisma:**
```typescript
const tasks = await prismaService.task.findMany({
  where: {
    title: { contains: 'prisma', mode: 'insensitive' }, // ILIKE
    completed: false,
    state: true,
  },
});
```

### Operadores de comparación

| Laravel | Prisma |
|---|---|
| `->where('price', '>', 100)` | `price: { gt: 100 }` |
| `->where('price', '>=', 100)` | `price: { gte: 100 }` |
| `->where('price', '<', 100)` | `price: { lt: 100 }` |
| `->where('price', '<=', 100)` | `price: { lte: 100 }` |
| `->where('name', 'like', '%texto%')` | `name: { contains: 'texto' }` |
| `->whereIn('id', [1,2,3])` | `id: { in: ['1','2','3'] }` |
| `->whereNotIn('id', [1,2,3])` | `id: { notIn: ['1','2','3'] }` |
| `->whereNull('deletedAt')` | `deletedAt: null` |
| `->whereNotNull('deletedAt')` | `deletedAt: { not: null }` |

### OR y AND

**Laravel:**
```php
Task::where('title', 'like', '%prisma%')
    ->orWhere('description', 'like', '%prisma%')
    ->get();
```

**Prisma:**
```typescript
await prismaService.task.findMany({
  where: {
    OR: [
      { title: { contains: 'prisma' } },
      { description: { contains: 'prisma' } },
    ],
  },
});

// AND explícito (también se puede usar AND: [...])
await prismaService.task.findMany({
  where: {
    AND: [
      { state: true },
      { completed: false },
    ],
  },
});
```

---

## 7. Ordenar y Paginar

**Laravel:**
```php
Task::orderBy('createdAt', 'desc')
    ->skip(20)
    ->take(10)
    ->get();
```

**Prisma:**
```typescript
await prismaService.task.findMany({
  orderBy: { createdAt: 'desc' },
  skip: 20,   // equivalente a OFFSET
  take: 10,   // equivalente a LIMIT
});
```

### Contar registros

**Laravel:**
```php
Task::where('state', true)->count();
```

**Prisma:**
```typescript
await prismaService.task.count({
  where: { state: true },
});
```

---

## 8. Relaciones

### hasMany / belongsTo (uno a muchos)

En el schema defines la relación en **ambos** modelos:

```prisma
model User {
  id    String @id @default(uuid())
  name  String
  tasks Task[]  // un usuario tiene muchas tareas
}

model Task {
  id     String @id @default(uuid())
  title  String
  userId String
  user   User   @relation(fields: [userId], references: [id])
  //             ↑ userId es la FK    ↑ id es la PK de User
}
```

**Laravel:**
```php
// En el modelo
public function user() { return $this->belongsTo(User::class); }
public function tasks() { return $this->hasMany(Task::class); }

// Al consultar
Task::with('user')->find($id);
User::with('tasks')->find($id);
```

**Prisma:**
```typescript
// Equivalente a with('user') — se llama include
const task = await prismaService.task.findFirst({
  where: { id },
  include: { user: true },
});

// Equivalente a with('tasks')
const user = await prismaService.user.findFirst({
  where: { id },
  include: { tasks: true },
});
```

### Relación N:M con tabla pivote (belongsToMany)

Ejemplo real del proyecto: `User` ↔ `Rol` a través de `UserRol`.

**Laravel:**
```php
// Modelo
public function roles() {
    return $this->belongsToMany(Rol::class, 'user_rols');
}
User::with('roles')->find($id);
```

**Prisma:**
```typescript
// La tabla pivote (UserRol) es un modelo explícito en el schema
const user = await prismaService.user.findFirst({
  where: { id },
  include: {
    roles: {           // → trae los UserRol
      include: {
        rol: true,     // → dentro de cada UserRol, trae el Rol
      },
    },
  },
});

// Resultado: user.roles[0].rol.name
```

### Include anidado (eager loading profundo)

Ejemplo real del proyecto — cargar usuario → roles → permisos → resource:

```typescript
await prismaService.userRol.findMany({
  where: { userId },
  include: {
    rol: {
      include: {
        permisos: {
          where: { state: true },
          include: {
            permission: {
              include: {
                resource: true,
              },
            },
          },
        },
      },
    },
  },
});
```

**Laravel equivalente:**
```php
User::with('roles.permissions.resource')->find($id);
```

---

## 9. Select (elegir solo ciertos campos)

**Laravel:**
```php
Task::select('id', 'title', 'completed')->get();
```

**Prisma:**
```typescript
await prismaService.task.findMany({
  select: {
    id: true,
    title: true,
    completed: true,
    // description: false  ← no es necesario, lo que no pones no se trae
  },
});
```

> No puedes usar `select` e `include` juntos en el mismo nivel.
> Si necesitas relaciones con select, anida el select dentro del include:
> ```typescript
> include: { user: { select: { name: true } } }
> ```

---

## 10. Transacciones

**Laravel:**
```php
DB::transaction(function () use ($userId, $rolIds) {
    UserRol::where('user_id', $userId)->delete();
    foreach ($rolIds as $rolId) {
        UserRol::create(['user_id' => $userId, 'rol_id' => $rolId]);
    }
});
```

**Prisma:**
```typescript
// Ejemplo real del proyecto (UserRolRepository)
await prismaService.$transaction(async (prisma) => {
  await prisma.userRol.deleteMany({
    where: { userId },
  });
  await prisma.userRol.createMany({
    data: rolIds.map((rolId) => ({ userId, rolId })),
    skipDuplicates: true,
  });
});
```

---

## 11. Seeders

En Laravel tienes clases Seeder separadas orquestadas por `DatabaseSeeder`. En Prisma el seed es un script TypeScript, y este proyecto sigue el mismo patrón de orquestación.

### Estructura de seeders (equivalente a DatabaseSeeder)

```
prisma/seeds/
├── seed.ts                  ← orquestador principal (equivalente a DatabaseSeeder)
└── seeders/
    ├── resource.seeder.ts
    ├── rol.seeder.ts
    └── permission.seeder.ts
```

Cada seeder es una función que recibe el cliente Prisma:

```typescript
// prisma/seeds/seeders/task.seeder.ts
import { PrismaClient } from '../../../src/generated/prisma/client';

export async function taskSeeder(prisma: PrismaClient) {
  await prisma.task.createMany({
    data: [
      { title: 'Primera tarea' },
      { title: 'Segunda tarea' },
    ],
    skipDuplicates: true,
  });

  console.log('  ✔ Tasks');
}
```

El orquestador `seed.ts` los ejecuta en orden — equivalente al `DatabaseSeeder::call()` de Laravel:

```typescript
// prisma/seeds/seed.ts
const seeders = [
  resourceSeeder,
  rolSeeder,
  permissionSeeder,
  taskSeeder,      // ← solo agregas esta línea
];

for (const seeder of seeders) {
  await seeder(prisma);
}
```

> **El orden importa.** Si un seeder necesita datos de otro (por ejemplo, `permissionSeeder`
> necesita que `resourceSeeder` y `rolSeeder` ya hayan corrido), ponlo después.

```bash
# Ejecuta todos los seeders en orden
pnpm run seed
```

Comparación con Laravel:

| Laravel | Prisma |
|---|---|
| `DatabaseSeeder::call([TaskSeeder::class])` | Agregar `taskSeeder` al array `seeders` en `seed.ts` |
| `php artisan db:seed` | `pnpm run seed` |
| `php artisan db:seed --class=TaskSeeder` | No aplica — se ejecutan todos o creas un script aparte |
| `skipDuplicates` implícito con `firstOrCreate` | `createMany({ skipDuplicates: true })` |

---

### Seed básico con datos fijos

**Laravel:**
```php
// database/seeders/TaskSeeder.php
public function run() {
    Task::create(['title' => 'Primera tarea']);
}
// php artisan db:seed --class=TaskSeeder
```

**Prisma:**
```typescript
// prisma/seeds/seed.ts
import { PrismaClient } from '../../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.task.createMany({
    data: [
      { title: 'Primera tarea' },
      { title: 'Segunda tarea' },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => console.log('Seed completado'))
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

```bash
pnpm run seed
```

---

### Seed desde JSON

Si tienes los datos en un archivo JSON (útil para catálogos grandes):

```typescript
// prisma/seeds/data/tasks.json
[
  { "title": "Tarea 1", "description": "Desc 1" },
  { "title": "Tarea 2", "description": "Desc 2" }
]
```

```typescript
// prisma/seeds/seed-tasks.ts
import { PrismaClient } from '../../src/generated/prisma/client';
import tasks from './data/tasks.json';

const prisma = new PrismaClient();

async function main() {
  await prisma.task.createMany({
    data: tasks,
    skipDuplicates: true,
  });
  console.log(`${tasks.length} tareas insertadas`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

### Seed desde Excel (equivalente a Laravel Excel)

En Laravel usas `Maatwebsite\Excel`. En Node.js el equivalente es la librería `xlsx` (SheetJS).

#### Instalación

```bash
pnpm add xlsx
pnpm add -D @types/xlsx
```

#### Estructura del Excel esperada

Tu archivo `tasks.xlsx` debe tener una hoja con encabezados en la primera fila:

| title | description | completed |
|---|---|---|
| Revisar docs | Leer la documentación | FALSE |
| Crear módulo | Crear el módulo de tareas | FALSE |

#### Script de importación

```typescript
// prisma/seeds/seed-from-excel.ts
import { PrismaClient } from '../../src/generated/prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  // 1. Leer el archivo Excel
  const filePath = path.join(__dirname, 'data', 'tasks.xlsx');
  const workbook = XLSX.readFile(filePath);

  // 2. Seleccionar la hoja (por nombre o por índice)
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // 3. Convertir a JSON — los encabezados de la primera fila se vuelven las keys
  const rows: any[] = XLSX.utils.sheet_to_json(sheet);

  console.log(`Filas encontradas: ${rows.length}`);

  // 4. Insertar en la base de datos
  for (const row of rows) {
    await prisma.task.create({
      data: {
        title: String(row['title']),
        description: row['description'] ? String(row['description']) : null,
        completed: row['completed'] === true || row['completed'] === 'TRUE',
      },
    });
  }

  console.log(`${rows.length} tareas importadas desde Excel`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

#### Registrar el script en package.json

```json
"scripts": {
  "seed": "ts-node -r tsconfig-paths/register -r dotenv/config prisma/seeds/seed.ts",
  "seed:excel": "ts-node -r tsconfig-paths/register -r dotenv/config prisma/seeds/seed-from-excel.ts"
}
```

```bash
pnpm run seed:excel
```

---

### Importar Excel desde un endpoint (en producción)

Si necesitas que los usuarios puedan subir un Excel desde el frontend para cargar datos masivamente, el flujo es:

#### 1. Instalar multer para subida de archivos

```bash
pnpm add multer @types/multer
```

#### 2. Controller

```typescript
import { Controller, Post, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth/auth.guard';
import { TaskService } from '../service/task.service';

@ApiTags('Task')
@Controller('task')
export class TaskController {

  @Post('import')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Importar tareas desde un archivo Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  importFromExcel(@UploadedFile() file: Express.Multer.File) {
    return this.taskService.importFromExcel(file.buffer);
  }
}
```

#### 3. Service

```typescript
import * as XLSX from 'xlsx';

@Injectable()
export class TaskService {

  async importFromExcel(buffer: Buffer): Promise<{ imported: number }> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    await this._taskRepository.createMany(
      rows.map((row) => ({
        title: String(row['title']),
        description: row['description'] ? String(row['description']) : null,
        completed: row['completed'] === true || row['completed'] === 'TRUE',
      }))
    );

    return { imported: rows.length };
  }
}
```

#### 4. Repository

```typescript
async createMany(data: Partial<TaskEntity>[]) {
  return await this.prismaService.task.createMany({
    data,
    skipDuplicates: true,
  });
}
```

#### Resultado en Swagger

Aparecerá un botón para subir un archivo `.xlsx` directamente desde la documentación.

---

## 12. upsert (updateOrCreate)

**Laravel:**
```php
Task::updateOrCreate(
    ['title' => 'Mi tarea'],          // condición de búsqueda
    ['description' => 'Actualizada']  // datos a actualizar o crear
);
```

**Prisma:**
```typescript
await prismaService.task.upsert({
  where: { title: 'Mi tarea' },   // debe ser un campo @unique
  update: { description: 'Actualizada' },
  create: { title: 'Mi tarea', description: 'Actualizada' },
});
```

---

## 13. Índices

**Laravel:**
```php
$table->index('state');
$table->unique(['resource_id', 'action']);
```

**Prisma:**
```prisma
model Permission {
  resourceId String
  action     ActionType

  @@index([resourceId])           // índice simple
  @@unique([resourceId, action])  // índice único compuesto
}
```

---

## 14. Flujo completo al agregar un nuevo modelo

Este es el flujo que seguirás cada vez que necesites una nueva tabla:

```bash
# 1. Crear el archivo del schema
# prisma/schema/tasks.prisma  ← defines el model Task

# 2. Crear y aplicar la migración
npx prisma migrate dev --name create_tasks_table

# 3. Regenerar el cliente TypeScript
npx prisma generate

# 4. Ya puedes usar prismaService.task en tu Repository
```

---

## Referencia rápida

| Objetivo | Prisma |
|---|---|
| Crear 1 | `prisma.model.create({ data })` |
| Crear varios | `prisma.model.createMany({ data })` |
| Buscar por PK/unique | `prisma.model.findUnique({ where })` |
| Buscar primero | `prisma.model.findFirst({ where })` |
| Buscar todos | `prisma.model.findMany({ where, orderBy, take, skip })` |
| Actualizar 1 | `prisma.model.update({ where, data })` |
| Actualizar varios | `prisma.model.updateMany({ where, data })` |
| Crear o actualizar | `prisma.model.upsert({ where, create, update })` |
| Eliminar 1 | `prisma.model.delete({ where })` |
| Eliminar varios | `prisma.model.deleteMany({ where })` |
| Contar | `prisma.model.count({ where })` |
| Transacción | `prisma.$transaction(async (tx) => { ... })` |
| Relaciones | `include: { relacion: true }` |
| Campos específicos | `select: { campo: true }` |
