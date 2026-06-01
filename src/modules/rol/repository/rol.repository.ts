import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/services';
import { RolEntity } from '../entities/rol.entity';
import { Prisma } from 'src/generated/prisma/client';
import { getSkip, getTake } from '@core/utils';
import { CreateRolDto } from '../dto';

@Injectable()
export class RolRepository {
  constructor(private readonly _prismaService: PrismaService) {}

  async create(rol: CreateRolDto): Promise<RolEntity> {
    return await this._prismaService.rol.create({
      data: {
        code: rol.name.toLowerCase().replace(/\s+/g, '_'),
        name: rol.name,
        description: rol.description,
      },
    });
  }

  async findAll<T>(
    whereConditions: T,
    limit: number,
    page: number,
  ): Promise<RolEntity[]> {
    return await this._prismaService.rol.findMany({
      where: whereConditions,
      orderBy: {
        createdAt: Prisma.SortOrder.desc,
      },
      take: getTake(limit, whereConditions),
      skip: getSkip(page, limit, whereConditions),
    });
  }

  async findBy<T>(key: string, value: T): Promise<RolEntity | null> {
    return await this._prismaService.rol.findFirst({
      where: {
        [key]: value,
      },
    });
  }

  async update(id: string, data: Partial<RolEntity>): Promise<RolEntity> {
    return await this._prismaService.rol.update({
      where: {
        id,
      },
      data,
    });
  }

  async softDelete(id: string): Promise<RolEntity> {
    return await this._prismaService.rol.update({
      where: {
        id,
      },
      data: {
        state: false,
      },
    });
  }

  async getTotalCount(allActive?: boolean): Promise<number> {
    return await this._prismaService.rol.count({
      where: { state: allActive ? true : undefined },
    });
  }
}
