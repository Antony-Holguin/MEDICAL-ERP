import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key para almacenar los roles requeridos
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator to require specific roles on an endpoint
 *
 * @example
 * ```typescript
 * @Roles('admin', 'accountant')
 * @Get()
 * async getUsers() { ... }
 * ```
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
