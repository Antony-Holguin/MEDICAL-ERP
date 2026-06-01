import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key to mark public endpoints
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark an endpoint as public (without authentication)
 *
 * @example
 * ```typescript
 * @Public()
 * @Post('login')
 * async login() { ... }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
