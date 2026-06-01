# 📊 Arquitectura del Proyecto - Facturador Backend

## 🏗️ Arquitectura Utilizada

Este proyecto implementa una **Arquitectura en Capas (Layered Architecture)** con patrones de **NestJS**, específicamente:

### 1. Clean Architecture / Hexagonal Architecture (Ports & Adapters)

- Separación clara entre capas: **Controller → Service → Repository → Database**
- Uso de **DTOs** para transferencia de datos entre capas
- **Mappers** para transformación entre entidades y DTOs
- **Entities** como modelos de dominio

### 2. RBAC (Role-Based Access Control)

- Sistema robusto de permisos basado en **recursos** y **acciones**
- Guards personalizados: `JwtAuthGuard`, `PermissionsGuard`, `RolesGuard`
- Decoradores para autorización: `@RequirePermission`, `@Roles`, `@Public`
- Control granular de acceso a recursos

### 3. Arquitectura Modular de NestJS

- Módulos independientes con dependency injection
- Cada módulo encapsula su funcionalidad completa
- Módulos principales: `UserModule`, `AuthModule`, `RolModule`, `MailModule`

---

## 📁 Estructura de Carpetas

```
fact-back/
│
├── src/
│   ├── core/                    # 🌐 Funcionalidades transversales
│   │   ├── config/             # Configuración de la aplicación
│   │   ├── filters/            # Filtros de excepciones globales
│   │   ├── middlewares/        # Middlewares (requestId, etc)
│   │   ├── models/             # Modelos compartidos (paginación)
│   │   ├── services/           # Servicios compartidos (encryption, logging)
│   │   └── utils/              # Utilidades (pagination, buildWhereCondition)
│   │
│   ├── auth/                    # 🔐 Módulo de autenticación
│   │   ├── controller/         # Controladores de auth
│   │   ├── decorators/         # Decoradores personalizados
│   │   ├── dto/                # DTOs de autenticación
│   │   ├── guards/             # Guards de seguridad
│   │   ├── models/             # Modelos (PayloadModel, ResponseAuth)
│   │   ├── services/           # Servicios de auth y hash
│   │   └── strategy/           # Estrategias JWT
│   │
│   ├── modules/                 # 📦 Módulos de negocio
│   │   ├── user/
│   │   │   ├── controller/     # API endpoints
│   │   │   ├── dto/            # Data Transfer Objects
│   │   │   ├── entity/         # Entidades de dominio
│   │   │   ├── mapper/         # Transformación de datos
│   │   │   ├── repository/     # Acceso a datos (Prisma)
│   │   │   ├── service/        # Lógica de negocio
│   │   │   └── user.module.ts  # Definición del módulo
│   │   │
│   │   ├── rol/                # Gestión de roles y permisos
│   │   └── mail/               # Sistema de correos
│   │
│   ├── prisma/                  # 🗄️ Módulo de base de datos
│   │   └── services/           # PrismaService
│   │
│   ├── generated/               # 🤖 Código generado por Prisma
│   │   └── prisma/             # Cliente de Prisma tipado
│   │
│   ├── app.module.ts           # Módulo raíz de la aplicación
│   └── main.ts                 # Punto de entrada
│
├── prisma/
│   ├── schema.prisma           # Esquema de base de datos
│   ├── migrations/             # Migraciones versionadas
│   └── seeds/                  # Datos iniciales
│
├── test/                        # Tests E2E
├── docker-compose.yml          # Orquestación de servicios
└── Dockerfile                  # Imagen de producción
```

---

## 📋 Lineamientos y Patrones de Desarrollo

### 🎯 1. Patrón Repository

- **Propósito**: Abstraer el acceso a datos de la lógica de negocio
- **Implementación**: Cada módulo tiene su `Repository` (ej: `UserRepository`)
- **Responsabilidades**:
  - Operaciones CRUD con Prisma
  - Consultas complejas
  - Paginación y filtros
  - Transacciones de base de datos

**Ejemplo:**

```typescript
@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(entity: UserEntity) {
    return await this.prismaService.user.create({ data: entity });
  }

  async findBy<T>(key: string, value: T): Promise<UserEntity | null> {
    return await this.prismaService.user.findFirst({ where: { [key]: value } });
  }
}
```

### 🔄 2. Patrón Mapper

- **Propósito**: Transformar datos entre capas (Entity ↔ DTO)
- **Responsabilidades**:
  - Convertir entidades de BD a DTOs
  - Encriptar/desencriptar datos sensibles
  - Preparar datos para respuestas API

**Ejemplo:**

```typescript
@Injectable()
export class UserMapper {
  toDto(entity: UserEntity): UserDto {
    return {
      id: entity.id,
      name: this.encryptionService.decryptData(entity.name),
      email: this.encryptionService.decryptData(entity.email),
      // ...
    };
  }
}
```

### 📦 3. DTOs (Data Transfer Objects)

- **Validación**: Usando `class-validator` y `class-transformer`
- **Documentación**: Decoradores de Swagger/OpenAPI
- **Tipos específicos**:
  - `CreateDto`: Crear nuevos registros
  - `UpdateDto`: Actualizar registros existentes
  - `FilterDto`: Filtros y paginación
  - `ResponseDto`: Respuestas personalizadas

**Ejemplo:**

```typescript
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Nombre del usuario' })
  name: string;

  @IsEmail()
  @ApiProperty({ description: 'Email del usuario' })
  email: string;
}
```

### 🔒 4. Seguridad

#### Encriptación de Datos Sensibles

- **Campos encriptados**: nombre, apellido, email
- **Servicio**: `EncryptionService` en core
- **HMAC**: `emailHash` para búsquedas sin exponer datos reales

#### Autenticación y Autorización

- **JWT**: Tokens para autenticación
- **Guards en capas**:
  1. `JwtAuthGuard` - Verifica token válido
  2. `PermissionsGuard` - Verifica permisos de recursos
  3. `RolesGuard` - Verifica roles específicos

#### Decoradores de Seguridad

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserController {
  @RequirePermission('users', ActionType.READ)
  @Get()
  findAll() {
    /* ... */
  }

  @Public() // Endpoint sin autenticación
  @Post('register')
  register() {
    /* ... */
  }
}
```

### 📝 5. Sistema de Logging

- **Librería**: Pino (logging estructurado)
- **RequestId**: Middleware para trazabilidad de requests
- **Niveles**: log, error, warn, debug
- **Contexto**: Cada servicio tiene su logger

**Ejemplo:**

```typescript
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  async create(dto: CreateUserDto) {
    this.logger.log('Creando usuario');
    // ...
    this.logger.log('Usuario creado');
  }
}
```

### 🚨 6. Gestión de Errores

- **Filtros globales**:
  - `AllExceptionsFilter`: Maneja todas las excepciones
  - `UnauthorizedExceptionFilter`: Excepciones de autorización
- **HttpException**: Con códigos de estado HTTP apropiados
- **Manejo consistente**: Try-catch en servicios con logging

**Ejemplo:**

```typescript
async findOne(id: string): Promise<UserDto> {
  try {
    const user = await this._userRepository.findBy('id', id);
    if (!user) {
      throw new HttpException('Usuario no existe', HttpStatus.NOT_FOUND);
    }
    return this._userMapper.toDto(user);
  } catch (error) {
    throw new HttpException(error, error.status);
  }
}
```

### 📄 7. Paginación Estandarizada

- **Modelo genérico**: `PaginationResult<T>`
- **Utilities**:
  - `buildWhereCondition`: Construir condiciones de filtro
  - `getSkip`, `getTake`: Cálculo de paginación
- **Consistente**: Todos los listados usan el mismo patrón

**Modelo:**

```typescript
export interface PaginationResult<T> {
  results: T[];
  total: number;
  page: number;
  limit: number;
}
```

### 🔄 8. Colas de Trabajo (Bull + Redis)

- **Propósito**: Procesamiento asíncrono de tareas pesadas
- **Uso principal**: Envío de correos electrónicos
- **Beneficios**:
  - No bloquea el flujo principal
  - Reintentos automáticos
  - Escalabilidad

### 📚 9. Documentación con Swagger

- **Endpoint**: `/docs`
- **Decoradores en controladores**:
  - `@ApiTags`: Agrupar endpoints
  - `@ApiOperation`: Descripción de operación
  - `@ApiResponse`: Documentar respuestas
  - `@ApiBearerAuth`: Requerir autenticación
- **Generación automática**: A partir del código

### 🐳 10. Docker & DevOps

- **docker-compose.yml**: PostgreSQL + Redis + App
- **Dockerfile**: Multi-stage para producción optimizada
- **Variables de entorno**: Bien documentadas en `.env.example`
- **Separación de ambientes**: development, production

### 🗄️ 11. Base de Datos (Prisma)

- **ORM**: Prisma con TypeScript
- **Migraciones**: Versionadas y controladas
- **Seeds**: Datos iniciales para desarrollo
- **Cliente tipado**: Generado automáticamente
- **Soft deletes**: Campo `state` en lugar de eliminar físicamente

### 💅 12. Convenciones de Código

#### Naming

- **Clases**: `PascalCase` (UserService, UserController)
- **Métodos/Variables**: `camelCase` (findOne, createUser)
- **Archivos**: `kebab-case` (user.service.ts, user.controller.ts)
- **Constantes**: `SCREAMING_SNAKE_CASE` (JWT_SECRET)

#### Estructura de Archivos

```
feature/
├── controller/         # feature.controller.ts
├── service/           # feature.service.ts
├── repository/        # feature.repository.ts
├── mapper/            # feature.mapper.ts
├── dto/               # *.dto.ts
├── entity/            # feature.entity.ts
└── feature.module.ts
```

#### Imports

- **Alias configurados** en `tsconfig.json`:
  - `@core` → `src/core`
  - `@auth` → `src/auth`
  - `@modules` → `src/modules`
  - `@prisma` → `src/prisma`
  - `@generated` → `src/generated`

#### Async/Await

- Uso consistente de promesas
- Manejo de errores con try-catch
- Siempre tipar el retorno

### 🧪 13. Testing

- **Framework**: Jest
- **Tipos de tests**:
  - Unit tests: `*.spec.ts` junto a cada archivo
  - E2E tests: carpeta `test/`
- **Cobertura**: Configurada en package.json

---

## 🔄 Flujo de una Petición

```
1. Request HTTP
   ↓
2. RequestIdMiddleware (genera ID único)
   ↓
3. Controller (valida DTOs, decoradores Swagger)
   ↓
4. Guards (JwtAuthGuard → PermissionsGuard → RolesGuard)
   ↓
5. Service (lógica de negocio, logging)
   ↓
6. Mapper (transforma datos, encripta/desencripta)
   ↓
7. Repository (operaciones con Prisma)
   ↓
8. Database (PostgreSQL)
   ↓
9. Repository (retorna entidad)
   ↓
10. Mapper (convierte a DTO)
   ↓
11. Service (retorna resultado)
   ↓
12. Controller (retorna respuesta)
   ↓
13. Filters (maneja excepciones si las hay)
   ↓
14. Response HTTP
```

---

## 🎯 Principios SOLID Aplicados

### Single Responsibility Principle (SRP)

- Cada clase tiene una única responsabilidad
- Controllers: Manejar HTTP
- Services: Lógica de negocio
- Repositories: Acceso a datos
- Mappers: Transformación de datos

### Open/Closed Principle (OCP)

- Guards extensibles sin modificar el core
- Decoradores personalizados
- Estrategias de autenticación

### Liskov Substitution Principle (LSP)

- Interfaces consistentes
- DTOs polimórficos

### Interface Segregation Principle (ISP)

- DTOs específicos por operación
- Interfaces pequeñas y enfocadas

### Dependency Inversion Principle (DIP)

- Dependency Injection de NestJS
- Inyección de servicios en constructores
- Abstracciones sobre implementaciones

---

## 🚀 Tecnologías Principales

| Tecnología     | Versión | Propósito                |
| -------------- | ------- | ------------------------ |
| **Node.js**    | 22.x    | Runtime de JavaScript    |
| **NestJS**     | 10.x    | Framework backend        |
| **TypeScript** | 5.x     | Lenguaje tipado          |
| **Prisma**     | 6.x     | ORM para base de datos   |
| **PostgreSQL** | 16      | Base de datos relacional |
| **Redis**      | 7       | Caché y colas            |
| **Bull**       | 4.x     | Procesamiento de colas   |
| **JWT**        | -       | Autenticación            |
| **Swagger**    | -       | Documentación API        |
| **Pino**       | -       | Logging estructurado     |
| **Docker**     | -       | Containerización         |

---

## 📈 Escalabilidad y Mantenibilidad

### Ventajas de esta Arquitectura

✅ **Modularidad**: Cada módulo es independiente y reutilizable  
✅ **Testeable**: Capas separadas facilitan unit testing  
✅ **Mantenible**: Código organizado y predecible  
✅ **Escalable**: Fácil agregar nuevos módulos y funcionalidades  
✅ **Seguro**: Múltiples capas de seguridad  
✅ **Documentado**: Swagger automático + README + comentarios  
✅ **Tipado**: TypeScript previene errores en tiempo de compilación  
✅ **DevOps Ready**: Docker, migrations, seeds

### Recomendaciones para Nuevos Módulos

Al crear un nuevo módulo, seguir esta estructura:

```bash
# 1. Crear estructura de carpetas
modules/
└── feature/
    ├── controller/
    ├── service/
    ├── repository/
    ├── mapper/
    ├── dto/
    ├── entity/
    └── feature.module.ts

# 2. Implementar siguiendo el orden:
1. Schema Prisma → Migration
2. Entity (modelo de dominio)
3. DTOs (Create, Update, Filter, Response)
4. Repository (acceso a datos)
5. Mapper (transformaciones)
6. Service (lógica de negocio)
7. Controller (API endpoints)
8. Tests

# 3. Registrar en app.module.ts
```

---

## 📚 Recursos Adicionales

- [GUARDS-README.md](./src/auth/guards/GUARDS-README.md) - Sistema de Guards y RBAC
- [DOCKER.md](./DOCKER.md) - Instrucciones de Docker
- [SCHEMA-DER.md](./prisma/SCHEMA-DER.md) - Diagrama de base de datos
- [README.md](./README.md) - Documentación general del proyecto

---

## 👨‍💻 Autor

**Ricardo Yaguachi**

---

_Última actualización: Enero 30, 2026_
