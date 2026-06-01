import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/services';
import { PermissionEntity } from '../entities/permission.entity';
import { Prisma } from '@generated/prisma/client';
import { getSkip, getTake } from '@core/utils';
import { CreatePermissionDto } from '../dto';

@Injectable()
export class PermissionRepository {
  constructor(private readonly _prismaService: PrismaService) {}

  async create(entity: CreatePermissionDto) {
    return await this._prismaService.permission.create({
      data: entity,
      include: {
        resource: true,
      },
    });
  }

  async findAll<T>(whereConditions: T, limit: number, page: number) {
    return await this._prismaService.permission.findMany({
      where: whereConditions,
      orderBy: {
        createdAt: Prisma.SortOrder.desc,
      },
      include: {
        resource: true,
      },
      take: getTake(limit, whereConditions),
      skip: getSkip(page, limit, whereConditions),
    });
  }

  async findBy<T>(key: string, value: T) {
    return await this._prismaService.permission.findFirst({
      where: {
        [key]: value,
      },
      include: {
        resource: true,
      },
    });
  }

  async update(id: string, data: Partial<PermissionEntity>) {
    return await this._prismaService.permission.update({
      where: { id },
      data,
      include: {
        resource: true,
      },
    });
  }

  async hardDelete(id: string) {
    return await this._prismaService.permission.delete({
      where: { id },
    });
  }

  async getTotalCount(): Promise<number> {
    return await this._prismaService.permission.count();
  }
}
