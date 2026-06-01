# 🔐 Sistema de Guards y Autorización RBAC

## 📚 Componentes Creados

### **Decoradores** (`src/auth/decorators/`)

1. `@RequirePermission(resource, ...actions)` - Verificar permisos granulares
2. `@Roles(...roles)` - Verificar roles simples
3. `@Public()` - Marcar endpoints públicos
4. `@CurrentUser()` - Obtener usuario actual

### **Guards** (`src/auth/guards/`)

1. `PermissionsGuard` - Verifica permisos RBAC (Resource + Action)
2. `RolesGuard` - Verifica roles simples (código de rol)
3. `JwtAuthGuard` - Autenticación JWT (ya existente)

---

## 🚀 Ejemplos de Uso

### **1. Verificar Permisos Específicos (RECOMENDADO)**

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@auth/guards/auth/auth.guard';
import { PermissionsGuard } from '@auth/guards/permissions/permissions.guard';
import { RequirePermission, CurrentUser } from '@auth/decorators';
import { ActionType } from '@generated/prisma/enums';
import { PayloadModel } from '@auth/models/payloadModel';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard) // Orden importante!
export class UserController {
  // Usuario necesita permiso: users:READ
  @RequirePermission('users', ActionType.READ)
  @Get()
  async findAll(@CurrentUser() user: PayloadModel) {
    console.log(`Usuario ${user.email} listando usuarios`);
    return this.userService.findAll();
  }

  // Usuario necesita permiso: users:CREATE
  @RequirePermission('users', ActionType.CREATE)
  @Post()
  async create(@CurrentUser('id') userId: string) {
    return this.userService.create(userId);
  }

  // Múltiples permisos requeridos (debe tener TODOS)
  @RequirePermission('invoices', ActionType.APPROVE, ActionType.UPDATE)
  @Post('approve')
  async approveInvoice() {
    return 'Factura aprobada';
  }
}
```

### **2. Verificar Solo Roles (Más Simple)**

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@auth/guards/auth/auth.guard';
import { RolesGuard } from '@auth/guards/roles/roles.guard';
import { Roles } from '@auth/decorators';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  // Solo admin y auditor pueden acceder
  @Roles('admin', 'auditor')
  @Get('reports')
  async getReports() {
    return 'Reportes administrativos';
  }

  // Solo admin
  @Roles('admin')
  @Get('settings')
  async getSettings() {
    return 'Configuración del sistema';
  }
}
```

### **3. Endpoints Públicos (Sin Autenticación)**

```typescript
import { Controller, Post } from '@nestjs/common';
import { Public } from '@auth/decorators';

@Controller('auth')
export class AuthController {
  @Public() // No requiere autenticación
  @Post('login')
  async login() {
    return 'Login exitoso';
  }

  @Public()
  @Post('register')
  async register() {
    return 'Usuario registrado';
  }
}
```

### **4. Aplicar Guard Globalmente (app.module.ts)**

```typescript
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@auth/guards/auth/auth.guard';
import { PermissionsGuard } from '@auth/guards/permissions/permissions.guard';

@Module({
  providers: [
    // Todos los endpoints requieren autenticación por defecto
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Verificar permisos en todos los endpoints con @RequirePermission
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
```

### **5. Obtener Usuario Actual**

```typescript
@Get('profile')
async getProfile(@CurrentUser() user: PayloadModel) {
  return {
    id: user.id,
    email: user.email,
    roles: user.roles,
  };
}

// Solo obtener el ID
@Get('my-invoices')
async getMyInvoices(@CurrentUser('id') userId: string) {
  return this.invoiceService.findByUserId(userId);
}
```

---

## 🔧 Configuración Requerida

### **1. Actualizar AuthService para incluir roles en JWT**

```typescript
// src/auth/services/auth/auth.service.ts

async signIn(signInDto: SignInDto) {
  const user = await this.validateUser(signInDto);

  // Obtener roles del usuario
  const userRoles = await this.prisma.userRol.findMany({
    where: { userId: user.id },
    include: { rol: true },
  });

  const payload: PayloadModel = {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: userRoles.map(ur => ur.rol.code), // ['admin', 'accountant']
  };

  return {
    access_token: this.jwtService.sign(payload),
    user: payload,
  };
}

async validateToken(payload: PayloadModel) {
  const isValid = await this.userService.validateUser(payload);
  if (!isValid) {
    throw new UnauthorizedException('Token inválido');
  }
  return payload; // Este payload se adjunta a request.user
}
```

### **2. Registrar Guards en AuthModule**

```typescript
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PermissionsGuard } from './guards/permissions/permissions.guard';
import { RolesGuard } from './guards/roles/roles.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    PermissionsGuard,
    RolesGuard,
    // ... otros providers
  ],
  exports: [PermissionsGuard, RolesGuard],
})
export class AuthModule {}
```

---

## 📊 Matriz de Decisión: ¿Qué Guard Usar?

| Caso de Uso                | Guard Recomendado  | Decorador                                        |
| -------------------------- | ------------------ | ------------------------------------------------ |
| Verificar permiso granular | `PermissionsGuard` | `@RequirePermission('users', ActionType.CREATE)` |
| Solo verificar rol         | `RolesGuard`       | `@Roles('admin', 'accountant')`                  |
| Endpoint público           | Ninguno            | `@Public()`                                      |
| Solo autenticación         | `JwtAuthGuard`     | Ningún decorador especial                        |

---

## 🎯 Orden de Ejecución de Guards

```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
         ⬆️              ⬆️
         1º              2º
```

1. **JwtAuthGuard**: Verifica token JWT, adjunta `user` al request
2. **PermissionsGuard**: Lee `user` del request, verifica permisos en DB

⚠️ **Importante**: `JwtAuthGuard` debe ejecutarse SIEMPRE antes que los otros guards.

---

## 🔍 Testing

```typescript
// user.controller.spec.ts
import { Test } from '@nestjs/testing';
import { PermissionsGuard } from '@auth/guards/permissions/permissions.guard';

describe('UserController with Guards', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: PermissionsGuard,
          useValue: { canActivate: () => true }, // Mock
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should allow access with valid permissions', () => {
    // Test implementation
  });
});
```

---

## 🚨 Troubleshooting

### Error: "Usuario no autenticado"

- Verifica que `JwtAuthGuard` esté antes de `PermissionsGuard`
- Verifica que el JWT contenga el campo `id`

### Error: "No tienes permisos suficientes"

- Verifica que el usuario tenga el rol asignado en la tabla `UserRol`
- Verifica que el rol tenga el permiso en `RolHasPermission`
- Verifica que el permiso esté activo (`state: true`)

### Logs para Debug

```typescript
// En el controller
@Get()
async test(@CurrentUser() user: PayloadModel) {
  console.log('User:', user);
  console.log('Roles:', user.roles);
  return 'OK';
}
```

---

## 📚 Próximos Pasos

1. Actualizar `AuthService.signIn()` para incluir roles
2. Aplicar guards en tus controllers
3. Crear tests para los guards
4. Documentar permisos en Swagger con decoradores
