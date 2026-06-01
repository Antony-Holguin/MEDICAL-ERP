import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/services';
import { CreateResourceDto } from '../dto';
import { ResourceEntity } from '../entities/resource.entity';
import { Prisma } from '@generated/prisma/client';
import { getSkip, getTake } from '@core/utils';

@Injectable()
export class ResourceRepository {
  constructor(private readonly _prismaService: PrismaService) {}

  async create(entity: CreateResourceDto): Promise<ResourceEntity> {
    return await this._prismaService.resource.create({
      data: entity,
    });
  }

  async findAll<T>(whereConditions: T, limit: number, page: number) {
    return await this._prismaService.resource.findMany({
      where: whereConditions,
      orderBy: {
        createdAt: Prisma.SortOrder.desc,
      },
      take: getTake(limit, whereConditions),
      skip: getSkip(page, limit, whereConditions),
    });
  }

  async findBy<T>(key: string, value: T): Promise<ResourceEntity | null> {
    return await this._prismaService.resource.findFirst({
      where: {
        [key]: value,
      },
    });
  }

  async update(id: string, data: Partial<ResourceEntity>) {
    return await this._prismaService.resource.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return await this._prismaService.resource.update({
      where: { id },
      data: {
        state: false,
      },
    });
  }

  async getTotalCount(allActive?: boolean): Promise<number> {
    return await this._prismaService.resource.count({
      where: { state: allActive ? true : undefined },
    });
  }
}
