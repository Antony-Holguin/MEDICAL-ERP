# Cómo crear un CRUD completo: módulo de Tareas

Esta guía te lleva paso a paso por la creación del módulo `Task` siguiendo exactamente los patrones de este proyecto. Al final tendrás endpoints funcionales, documentados en Swagger y protegidos con JWT.

---

## Estructura final que vas a crear

```
src/modules/task/
├── controller/
│   └── task.controller.ts
├── dto/
│   ├── create-task.dto.ts
│   ├── update-task.dto.ts
│   ├── filter-task.dto.ts
│   ├── task.dto.ts
│   └── index.ts
├── entity/
│   └── task.entity.ts
├── mapper/
│   └── task.mapper.ts
├── repository/
│   └── task.repository.ts
├── service/
│   └── task.service.ts
└── task.module.ts
```

---

## Paso 1 — Modelo en Prisma

Abre `prisma/schema.prisma` y agrega el modelo al final, antes de los `enum`:

```prisma
model Task {
  id          String   @id @default(uuid())
  title       String
  description String?
  completed   Boolean  @default(false)
  state       Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([state])
  @@index([completed])
}
```

> **Por qué `state` y no `deletedAt`?**
> Este proyecto usa soft-delete por `state: false` en lugar de borrado físico.
> El campo `state` es el estándar en todos los modelos existentes.

Luego crea y aplica la migración:

```bash
npx prisma migrate dev --name add_task_model
npx prisma generate
```

---

## Paso 2 — Entity

La entity es la representación TypeScript del modelo Prisma. Implementa la interfaz generada por Prisma para tener type-safety completo.

Crea `src/modules/task/entity/task.entity.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { Task } from 'src/generated/prisma/client';

export class TaskEntity implements Task {
  @ApiProperty({ example: 'uuid-aqui', description: 'Identificador único' })
  id: string;

  @ApiProperty({ example: 'Revisar documentación', description: 'Título de la tarea' })
  title: string;

  @ApiProperty({ example: 'Revisar la documentación de Prisma', description: 'Descripción', required: false })
  description: string | null;

  @ApiProperty({ example: false, description: 'Si la tarea está completada' })
  completed: boolean;

  @ApiProperty({ example: true, description: 'Si el registro está activo' })
  state: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
```

---

## Paso 3 — DTOs

Los DTOs validan los datos de entrada y documentan los esquemas en Swagger.

### `create-task.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Revisar documentación', description: 'Título de la tarea' })
  @IsString({ message: 'El título debe ser un texto' })
  title: string;

  @ApiProperty({ example: 'Revisar la doc de Prisma', description: 'Descripción', required: false })
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsOptional()
  description?: string;

  @ApiProperty({ example: false, description: 'Estado de completado', required: false })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
```

### `update-task.dto.ts`

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

// PartialType hace todos los campos opcionales y los hereda con sus decoradores
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
```

### `filter-task.dto.ts`

```typescript
import { PaginationOptions } from '@core/models/paginationOptions';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterTaskDto extends PaginationOptions {
  @ApiProperty({ type: String, description: 'Filtrar por título', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ type: Boolean, description: 'Filtrar por completadas', required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  completed?: boolean;
}
```

### `task.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class TaskDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description: string | null;

  @ApiProperty()
  completed: boolean;

  @ApiProperty()
  state: boolean;

  @ApiProperty()
  createdAt: Date;
}
```

### `index.ts`

```typescript
export { CreateTaskDto } from './create-task.dto';
export { UpdateTaskDto } from './update-task.dto';
export { FilterTaskDto } from './filter-task.dto';
export { TaskDto } from './task.dto';
```

---

## Paso 4 — Mapper

El mapper transforma datos entre capas. Si en el futuro necesitas encriptar campos (como hace `UserMapper`), solo modificas el mapper sin tocar el servicio ni el repositorio.

Crea `src/modules/task/mapper/task.mapper.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { TaskEntity } from '../entity/task.entity';
import { TaskDto, CreateTaskDto } from '../dto';

@Injectable()
export class TaskMapper {
  toDto(entity: TaskEntity): TaskDto {
    if (!entity) return null;
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      completed: entity.completed,
      state: entity.state,
      createdAt: entity.createdAt,
    };
  }

  toEntity(dto: CreateTaskDto): Partial<TaskEntity> {
    return {
      title: dto.title,
      description: dto.description ?? null,
      completed: dto.completed ?? false,
    };
  }
}
```

---

## Paso 5 — Repository

El repositorio es la única capa que habla con Prisma. El servicio nunca importa `PrismaService` directamente.

Crea `src/modules/task/repository/task.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/services/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { getSkip, getTake } from '@core/utils/pagination.utils';
import { UpdateTaskDto } from '../dto';
import { TaskEntity } from '../entity/task.entity';

@Injectable()
export class TaskRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: Partial<TaskEntity>) {
    return await this.prismaService.task.create({ data });
  }

  async findAll<T>(whereConditions: T, limit: number, page: number) {
    return await this.prismaService.task.findMany({
      where: whereConditions,
      orderBy: { createdAt: Prisma.SortOrder.desc },
      take: getTake(limit, whereConditions),
      skip: getSkip(page, limit, whereConditions),
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
      data: { state: false },
    });
  }

  async getTotalCount(onlyActive?: boolean): Promise<number> {
    return await this.prismaService.task.count({
      where: { state: onlyActive ? true : undefined },
    });
  }
}
```

---

## Paso 6 — Service

El servicio contiene la lógica de negocio. Usa el repositorio para acceder a datos y el mapper para transformarlos.

Crea `src/modules/task/service/task.service.ts`:

```typescript
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { TaskRepository } from '../repository/task.repository';
import { TaskMapper } from '../mapper/task.mapper';
import { CreateTaskDto, FilterTaskDto, TaskDto, UpdateTaskDto } from '../dto';
import { PaginationResult } from '@core/models/paginationResult';
import { buildContainsCondition } from '@core/utils/buildWhereCondition.utils';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private readonly _taskRepository: TaskRepository,
    private readonly _taskMapper: TaskMapper,
  ) {}

  async create(dto: CreateTaskDto): Promise<TaskDto> {
    try {
      this.logger.log('Creating task');
      const entity = this._taskMapper.toEntity(dto);
      const created = await this._taskRepository.create(entity);
      return this._taskMapper.toDto(created);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(options: FilterTaskDto, onlyActive?: boolean): Promise<PaginationResult<TaskDto>> {
    try {
      const { page, limit } = options;
      const where = this.buildWhereConditions(options, onlyActive);
      const tasks = await this._taskRepository.findAll(where, limit, page);

      return {
        results: tasks.map((t) => this._taskMapper.toDto(t)),
        total: await this._taskRepository.getTotalCount(onlyActive),
        page,
        limit,
      };
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string): Promise<TaskDto> {
    try {
      const task = await this._taskRepository.findById(id);
      if (!task) throw new HttpException('Tarea no encontrada', HttpStatus.NOT_FOUND);
      return this._taskMapper.toDto(task);
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, dto: UpdateTaskDto): Promise<TaskDto> {
    try {
      await this.findOne(id); // Valida que exista antes de actualizar
      const updated = await this._taskRepository.update(id, dto);
      return this._taskMapper.toDto(updated);
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.findOne(id); // Valida que exista antes de eliminar
      await this._taskRepository.softDelete(id);
    } catch (error) {
      throw new HttpException(error, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private buildWhereConditions(options: FilterTaskDto, onlyActive?: boolean) {
    return {
      title: buildContainsCondition(options.title),
      completed: options.completed !== undefined ? options.completed : undefined,
      state: onlyActive ? true : undefined,
    };
  }
}
```

---

## Paso 7 — Controller

El controlador recibe las peticiones HTTP, delega al servicio y documenta los endpoints para Swagger.

Crea `src/modules/task/controller/task.controller.ts`:

```typescript
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth/auth.guard';
import { TaskService } from '../service/task.service';
import { CreateTaskDto, FilterTaskDto, TaskDto, UpdateTaskDto } from '../dto';
import { PaginationResult } from '@core/models/paginationResult';

@ApiTags('Task')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una tarea' })
  @ApiOkResponse({ description: 'Tarea creada', type: TaskDto })
  @ApiBody({ type: CreateTaskDto })
  create(@Body() dto: CreateTaskDto) {
    return this.taskService.create(dto);
  }

  @Post('all')
  @ApiOperation({ summary: 'Listar todas las tareas con paginación y filtros' })
  @ApiOkResponse({ description: 'Lista de tareas', type: PaginationResult<TaskDto> })
  findAll(@Body() options: FilterTaskDto) {
    return this.taskService.findAll(options);
  }

  @Post('active')
  @ApiOperation({ summary: 'Listar solo las tareas activas' })
  @ApiOkResponse({ description: 'Lista de tareas activas', type: PaginationResult<TaskDto> })
  findAllActive(@Body() options: FilterTaskDto) {
    return this.taskService.findAll(options, true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una tarea por ID' })
  @ApiOkResponse({ description: 'Tarea encontrada', type: TaskDto })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una tarea' })
  @ApiOkResponse({ description: 'Tarea actualizada', type: TaskDto })
  @ApiBody({ type: UpdateTaskDto })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.taskService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una tarea (soft delete)' })
  @ApiResponse({ status: 200, description: 'Tarea eliminada' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  remove(@Param('id') id: string) {
    return this.taskService.remove(id);
  }
}
```

---

## Paso 8 — Module

El módulo ensambla todas las piezas y declara qué se puede usar desde fuera.

Crea `src/modules/task/task.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TaskController } from './controller/task.controller';
import { TaskService } from './service/task.service';
import { TaskRepository } from './repository/task.repository';
import { TaskMapper } from './mapper/task.mapper';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CoreModule } from '@core/core.module';

@Module({
  controllers: [TaskController],
  providers: [TaskService, TaskRepository, TaskMapper],
  imports: [PrismaModule, CoreModule],
  exports: [TaskService],
})
export class TaskModule {}
```

---

## Paso 9 — Registrar en AppModule

Abre `src/app.module.ts` y agrega `TaskModule` en los imports:

```typescript
import { TaskModule } from '@modules/task/task.module';

@Module({
  imports: [
    // ... otros módulos existentes
    TaskModule,
  ],
})
export class AppModule {}
```

---

## Paso 10 — Verificar

Reinicia la app y confirma que todo funciona:

```bash
pnpm run start:dev
```

Abre Swagger en `http://localhost:3000/api/docs` — deberías ver la sección **Task** con todos los endpoints.

---

## Flujo completo de una petición

```
HTTP Request
    │
    ▼
Controller         → valida que el token JWT sea válido (@UseGuards)
    │              → transforma el body al DTO correcto (@Body)
    ▼
Service            → aplica la lógica de negocio
    │              → valida reglas (ej: que el registro exista antes de actualizar)
    ▼
Mapper             → convierte DTO → Entity (para escribir)
    │              → convierte Entity → DTO (para responder)
    ▼
Repository         → única capa que habla con Prisma
    │
    ▼
PostgreSQL
```

---

## Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/task` | Crear tarea |
| `POST` | `/api/task/all` | Listar con filtros y paginación |
| `POST` | `/api/task/active` | Listar solo activas |
| `GET` | `/api/task/:id` | Obtener por ID |
| `PATCH` | `/api/task/:id` | Actualizar |
| `DELETE` | `/api/task/:id` | Eliminar (soft delete) |

Todos requieren el header:
```
Authorization: Bearer <tu_jwt_token>
```

---

## Preguntas frecuentes

**¿Por qué los listados usan POST y no GET?**
Porque los filtros y la paginación se envían en el body. Con GET los parámetros van en la URL (query strings), lo cual es incómodo para objetos complejos.

**¿Qué es soft delete?**
En vez de borrar el registro de la base de datos, se cambia `state: false`. Así los datos quedan auditables y recuperables.

**¿Cuándo necesito un Mapper?**
Siempre. Aunque hoy tu tarea no tenga campos encriptados, el mapper desacopla la capa de datos de la capa de presentación. Si mañana necesitas encriptar `title`, solo cambias el mapper.

**¿Cómo agrego permisos granulares?**
Reemplaza `@UseGuards(JwtAuthGuard)` por:
```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('tasks', ActionType.CREATE)
```
Y agrega el resource `tasks` al seed.
