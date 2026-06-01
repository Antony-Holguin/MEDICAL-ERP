import { SetMetadata } from '@nestjs/common';
import { ActionType } from 'src/generated/prisma/enums';

/**
 * Metadata key para almacenar los permisos requeridos
 */
export const PERMISSIONS_KEY = 'permissions';

/**
 * Interface para definir un permiso requerido
 */
export interface RequiredPermission {
  resource: string;
  action: ActionType;
}

/**
 * Decorator to require specific permissions on an endpoint
 *
 * @example
 * ```typescript
 * @RequirePermission('users', ActionType.CREATE)
 * @Post()
 * async createUser() { ... }
 *
 * // Multiple permissions (requires ALL)
 * @RequirePermission('invoices', ActionType.CREATE, ActionType.APPROVE)
 * @Post('approve')
 * async approveInvoice() { ... }
 * ```
 */
export const RequirePermission = (
  resource: string,
  ...actions: ActionType[]
) => {
  const permissions: RequiredPermission[] = actions.map((action) => ({
    resource,
    action,
  }));
  return SetMetadata(PERMISSIONS_KEY, permissions);
};
