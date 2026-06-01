import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@auth/guards/auth/auth.guard';
import { PermissionsGuard } from '@auth/guards/permissions/permissions.guard';
import { RolesGuard } from '@auth/guards/roles/roles.guard';
import {
  RequirePermission,
  Roles,
  CurrentUser,
  Public,
} from '@auth/decorators';
import { ActionType } from '@generated/prisma/enums';
import { PayloadModel } from '@auth/models/payloadModel';

/**
 * EXAMPLE OF USING GUARDS AND RBAC DECORATORS
 *
 * This file shows different ways to protect endpoints
 * using the RBAC authorization system.
 */
@Controller('example')
export class ExampleGuardsController {
  /**
   * ✅ EXAMPLE 1: Public Endpoint (no authentication)
   */
  @Public()
  @Get('public')
  publicEndpoint() {
    return {
      message: 'This endpoint is public, no authentication required',
    };
  }

  /**
   * ✅ EXAMPLE 2: Authentication Only (no permission check)
   * Any authenticated user can access
   */
  @UseGuards(JwtAuthGuard)
  @Get('authenticated')
  authenticatedEndpoint(@CurrentUser() user: PayloadModel) {
    return {
      message: 'Authenticated user',
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  /**
   * ✅ EXAMPLE 3: Verify simple ROLE
   * Only users with 'admin' or 'accountant' role can access
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'accountant')
  @Get('by-role')
  byRoleEndpoint(@CurrentUser() user: PayloadModel) {
    return {
      message: 'Access by role',
      userRoles: user.roles,
      requiredRoles: ['admin', 'accountant'],
    };
  }

  /**
   * ✅ EXAMPLE 4: Verify granular PERMISSION (Resource + Action)
   * User must have permission: users:READ
   *
   * This verifies that the user has a role that contains the
   * "users:READ" permission active in the database.
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('users', ActionType.READ)
  @Get('users')
  listUsers(@CurrentUser() user: PayloadModel) {
    return {
      message: 'Listing users',
      requiredPermission: { resource: 'users', action: 'READ' },
      currentUser: user.email,
    };
  }

  /**
   * ✅ EXAMPLE 5: Create with CREATE permission
   * User must have permission: users:CREATE
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('users', ActionType.CREATE)
  @Post('users')
  createUser(@CurrentUser('id') userId: string, @Body() data: any) {
    return {
      message: 'User created',
      createdBy: userId,
      data,
    };
  }

  /**
   * ✅ EXAMPLE 6: Multiple required permissions
   * User must have BOTH permissions:
   * - invoices:APPROVE
   * - invoices:UPDATE
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('invoices', ActionType.APPROVE, ActionType.UPDATE)
  @Post('invoices/:id/approve')
  approveInvoice(@Param('id') id: string, @CurrentUser() user: PayloadModel) {
    return {
      message: 'Invoice approved',
      invoiceId: id,
      approvedBy: user.email,
      requiredPermissions: [
        { resource: 'invoices', action: 'APPROVE' },
        { resource: 'invoices', action: 'UPDATE' },
      ],
    };
  }

  /**
   * ✅ EXAMPLE 7: Get only the user ID
   * Using @CurrentUser('id') to extract only the ID
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('invoices', ActionType.LIST)
  @Get('my-invoices')
  getMyInvoices(@CurrentUser('id') userId: string) {
    return {
      message: 'My invoices',
      userId,
      // Here would go the logic to get user invoices
    };
  }

  /**
   * ✅ EXAMPLE 8: Admin only endpoint
   * Only the admin role can access
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('users/:id')
  deleteUser(@Param('id') id: string, @CurrentUser() user: PayloadModel) {
    return {
      message: 'User deleted',
      deletedUserId: id,
      deletedBy: user.email,
      isAdmin: user.roles?.includes('admin'),
    };
  }

  /**
   * ✅ EXAMPLE 9: Combining multiple guards (controller level)
   * All endpoints of this controller would require authentication
   * and permission verification.
   *
   * It can be done like this:
   *
   * @Controller('protected')
   * @UseGuards(JwtAuthGuard, PermissionsGuard)
   * export class ProtectedController {
   *   @RequirePermission('resource', ActionType.READ)
   *   @Get()
   *   findAll() { ... }
   * }
   */

  /**
   * ✅ EXAMPLE 10: Complete management permission
   * User must have permission: users:MANAGE
   * (MANAGE is a super-permission that includes all actions)
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('users', ActionType.MANAGE)
  @Patch('users/:id/toggle-state')
  toggleUserState(@Param('id') id: string) {
    return {
      message: 'Estado de usuario cambiado',
      userId: id,
      requiredPermission: { resource: 'users', action: 'MANAGE' },
    };
  }
}
