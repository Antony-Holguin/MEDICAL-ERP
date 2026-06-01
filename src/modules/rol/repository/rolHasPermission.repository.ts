import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/services';

@Injectable()
export class RolHasPermissionRepository {
  constructor(private readonly _prismaService: PrismaService) {}

  async upsert(
    rolId: string,
    permissionChange: { permissionId: string; state: boolean }[],
    modifiedBy: string,
  ) {
    return await this._prismaService.$transaction(async (prisma) => {
      for (const change of permissionChange) {
        await prisma.rolHasPermission.upsert({
          where: {
            rolId_permissionId: {
              rolId,
              permissionId: change.permissionId,
            },
          },
          update: {
            state: change.state,
            modifiedBy,
          },
          create: {
            rolId,
            permissionId: change.permissionId,
            state: change.state,
            createdBy: modifiedBy,
          },
        });
      }
    });
  }
}
