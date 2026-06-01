import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PayloadModel } from '../models/payloadModel';

/**
 * Decorador para obtener el usuario actual desde el request
 *
 * @example
 * ```typescript
 * @Get('profile')
 * async getProfile(@CurrentUser() user: PayloadModel) {
 *   return user;
 * }
 *
 * // Obtener solo el ID
 * @Get('my-data')
 * async getData(@CurrentUser('id') userId: string) {
 *   return this.service.findById(userId);
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof PayloadModel | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as PayloadModel;

    return data ? user?.[data] : user;
  },
);
