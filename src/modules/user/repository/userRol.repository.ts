import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/services';

@Injectable()
export class UserRolRepository {
  constructor(private readonly _prismaService: PrismaService) {}

  async create(userId: string, rolsIds: string[], assignedBy?: string) {
    const userRols = rolsIds.map((rolId) => ({
      userId,
      rolId,
      assignedBy,
    }));
    return await this._prismaService.userRol.createMany({
      data: userRols,
      skipDuplicates: true,
    });
  }

  async findAllByUserId(userId: string) {
    return await this._prismaService.userRol.findMany({
      where: { userId },
      include: {
        rol: true,
      },
    });
  }

  async findUsersByRol(rolId: string) {
    return await this._prismaService.userRol.findMany({
      where: { rolId },
      include: {
        user: true,
        rol: true,
      },
    });
  }

  async update(userId: string, rolIds: string[], assignedBy?: string) {
    return await this._prismaService.$transaction(async (prisma) => {
      await prisma.userRol.deleteMany({
        where: { userId },
      });
      const userRols = rolIds.map((rolId) => ({
        userId,
        rolId,
        assignedBy,
      }));
      return prisma.userRol.createMany({
        data: userRols,
        skipDuplicates: true,
      });
    });
  }

  async deleteByUserId(userId: string) {
    return await this._prismaService.userRol.deleteMany({
      where: { userId },
    });
  }

  async checkUserPermissionsByRole(userId: string) {
    return await this._prismaService.userRol.findMany({
      where: {
        userId,
        rol: { state: true },
      },
      include: {
        rol: {
          include: {
            permisos: {
              where: { state: true },
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
  }

  async checkUserRoles(userId: string, roles: string[]) {
    return await this._prismaService.userRol.findMany({
      where: {
        userId,
        rol: {
          code: { in: roles },
          state: true,
        },
      },
    });
  }
}
