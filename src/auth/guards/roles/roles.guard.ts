import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../prisma/services/prisma.service';
import { ROLES_KEY } from '../../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';
import { PayloadModel } from '../../models/payloadModel';
import { UserRolService } from '@modules/user/service';

/**
 * Simple guard to verify roles (without granular permissions)
 *
 * Verifies that the user has at least ONE of the specified roles.
 * Use this guard when you only need to verify roles, not specific permissions.
 *
 * @example
 * ```typescript
 * // En el controller
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('admin', 'accountant')
 * @Get()
 * async getUsers() { ... }
 * ```
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private reflector: Reflector,
    private readonly _userRolService: UserRolService,
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

    // Obtener roles requeridos del decorador
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Obtener usuario del request
    const request = context.switchToHttp().getRequest();
    const user: PayloadModel = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // Verificar roles del usuario
    const hasRole = await this._userRolService.checkUserRoles(
      user.id,
      requiredRoles,
    );

    if (!hasRole) {
      this.logger.warn(
        `User ${user.email} attempted to access without required role: ${requiredRoles.join(', ')}`,
      );
      throw new UnauthorizedException(
        'You do not have the necessary role to access this resource',
      );
    }

    return true;
  }
}
