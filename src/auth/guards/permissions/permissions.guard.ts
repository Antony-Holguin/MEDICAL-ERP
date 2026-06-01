import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../prisma/services/prisma.service';
import {
  PERMISSIONS_KEY,
  RequiredPermission,
} from '../../decorators/require-permission.decorator';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';
import { PayloadModel } from '../../models/payloadModel';

/**
 * Guard to verify RBAC permissions based on Resource + Action
 *
 * This guard verifies that the user has at least one of the roles
 * that contains ALL permissions required by the endpoint.
 *
 * @example
 * ```typescript
 * // En el controller
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @RequirePermission('users', ActionType.CREATE)
 * @Post()
 * async createUser() { ... }
 * ```
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the endpoint is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Obtener permisos requeridos del decorador
    const requiredPermissions = this.reflector.getAllAndOverride<
      RequiredPermission[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    // Si no hay permisos requeridos, permitir acceso
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Get user from request
    const request = context.switchToHttp().getRequest();
    const user: PayloadModel = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Verify user permissions
    const hasPermission = await this.checkUserPermissions(
      user.id,
      requiredPermissions,
    );

    if (!hasPermission) {
      this.logger.warn(
        `User ${user.email} attempted to access without permissions: ${JSON.stringify(requiredPermissions)}`,
      );
      throw new UnauthorizedException(
        'You do not have sufficient permissions to perform this action',
      );
    }

    return true;
  }

  /**
   * Verifies if the user has all required permissions
   */
  private async checkUserPermissions(
    userId: string,
    requiredPermissions: RequiredPermission[],
  ): Promise<boolean> {
    try {
      // Optimized query: gets all user permissions in a single query
      const userPermissions = await this.prisma.userRol.findMany({
        where: {
          userId,
          rol: { state: true }, // Solo roles activos
        },
        include: {
          rol: {
            include: {
              permisos: {
                where: { state: true }, // Solo permisos activos
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

      // Extract all unique user permissions
      const userPermissionSet = new Set<string>();
      userPermissions.forEach((userRol) => {
        userRol.rol.permisos.forEach((rolPerm) => {
          const key = `${rolPerm.permission.resource.name}:${rolPerm.permission.action}`;
          userPermissionSet.add(key);
        });
      });

      // Verify that the user has ALL required permissions
      const hasAllPermissions = requiredPermissions.every((required) => {
        const key = `${required.resource}:${required.action}`;
        return userPermissionSet.has(key);
      });

      return hasAllPermissions;
    } catch (error) {
      this.logger.error(
        `Error verifying permissions for user ${userId}`,
        error,
      );
      return false;
    }
  }
}
