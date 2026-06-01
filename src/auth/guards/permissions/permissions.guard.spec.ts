import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { RolesGuard } from '../roles/roles.guard';
import { PrismaService } from '../../../prisma/services/prisma.service';
import { ActionType } from '@generated/prisma/enums';
import { PERMISSIONS_KEY } from '../../decorators/require-permission.decorator';
import { ROLES_KEY } from '../../decorators/roles.decorator';

describe('Guards Tests', () => {
  let permissionsGuard: PermissionsGuard;
  let rolesGuard: RolesGuard;
  let reflector: Reflector;
  let prismaService: PrismaService;

  const mockPrismaService = {
    userRol: {
      findMany: jest.fn(),
    },
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        RolesGuard,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    permissionsGuard = module.get<PermissionsGuard>(PermissionsGuard);
    rolesGuard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PermissionsGuard', () => {
    const mockExecutionContext = (user?: any) => {
      return {
        switchToHttp: () => ({
          getRequest: () => ({
            user: user || {
              id: 'user-id',
              email: 'test@test.com',
              roles: ['admin'],
            },
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;
    };

    it('should allow access when no permissions are required', async () => {
      mockReflector.getAllAndOverride
        .mockReturnValueOnce(false) // isPublic
        .mockReturnValueOnce(undefined); // permissions

      const context = mockExecutionContext();
      const result = await permissionsGuard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access to public endpoints', async () => {
      mockReflector.getAllAndOverride.mockReturnValueOnce(true); // isPublic = true

      const context = mockExecutionContext();
      const result = await permissionsGuard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access when user has no permissions', async () => {
      const requiredPermissions = [
        { resource: 'users', action: ActionType.CREATE },
      ];

      mockReflector.getAllAndOverride
        .mockReturnValueOnce(false) // isPublic
        .mockReturnValueOnce(requiredPermissions);

      mockPrismaService.userRol.findMany.mockResolvedValue([]);

      const context = mockExecutionContext();

      await expect(permissionsGuard.canActivate(context)).rejects.toThrow(
        'No tienes permisos suficientes',
      );
    });

    it('should allow access when user has required permissions', async () => {
      const requiredPermissions = [
        { resource: 'users', action: ActionType.READ },
      ];

      mockReflector.getAllAndOverride
        .mockReturnValueOnce(false) // isPublic
        .mockReturnValueOnce(requiredPermissions);

      mockPrismaService.userRol.findMany.mockResolvedValue([
        {
          rol: {
            permisos: [
              {
                permission: {
                  resource: { name: 'users' },
                  action: ActionType.READ,
                },
              },
            ],
          },
        },
      ]);

      const context = mockExecutionContext();
      const result = await permissionsGuard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should require ALL permissions when multiple are specified', async () => {
      const requiredPermissions = [
        { resource: 'invoices', action: ActionType.APPROVE },
        { resource: 'invoices', action: ActionType.UPDATE },
      ];

      mockReflector.getAllAndOverride
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(requiredPermissions);

      // Usuario solo tiene permiso APPROVE, falta UPDATE
      mockPrismaService.userRol.findMany.mockResolvedValue([
        {
          rol: {
            permisos: [
              {
                permission: {
                  resource: { name: 'invoices' },
                  action: ActionType.APPROVE,
                },
              },
            ],
          },
        },
      ]);

      const context = mockExecutionContext();

      await expect(permissionsGuard.canActivate(context)).rejects.toThrow();
    });
  });

  describe('RolesGuard', () => {
    const mockExecutionContext = (user?: any) => {
      return {
        switchToHttp: () => ({
          getRequest: () => ({
            user: user || { id: 'user-id', email: 'test@test.com' },
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;
    };

    it('should allow access when no roles are required', async () => {
      mockReflector.getAllAndOverride
        .mockReturnValueOnce(false) // isPublic
        .mockReturnValueOnce(undefined); // roles

      const context = mockExecutionContext();
      const result = await rolesGuard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has required role', async () => {
      const requiredRoles = ['admin', 'accountant'];

      mockReflector.getAllAndOverride
        .mockReturnValueOnce(false) // isPublic
        .mockReturnValueOnce(requiredRoles);

      mockPrismaService.userRol.findMany.mockResolvedValue([
        { rolId: 'role-id' },
      ]);

      const context = mockExecutionContext();
      const result = await rolesGuard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access when user does not have required role', async () => {
      const requiredRoles = ['admin'];

      mockReflector.getAllAndOverride
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(requiredRoles);

      mockPrismaService.userRol.findMany.mockResolvedValue([]);

      const context = mockExecutionContext();

      await expect(rolesGuard.canActivate(context)).rejects.toThrow(
        'No tienes el rol necesario',
      );
    });
  });
});
