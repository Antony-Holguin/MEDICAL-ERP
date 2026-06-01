import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/services/prisma.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { getSkip, getTake } from '@core/utils/pagination.utils';
import { Prisma } from 'src/generated/prisma/client';
import { UserEntity } from '../entity/user.entity';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(entity: UserEntity) {
    return await this.prismaService.user.create({
      data: {
        name: entity.name,
        lastName: entity.lastName,
        email: entity.email,
        emailHash: entity.emailHash,
        password: entity.password,
      },
    });
  }

  async findAll<T>(whereConditions: T, limit: number, page: number) {
    return await this.prismaService.user.findMany({
      where: whereConditions,
      orderBy: {
        createdAt: Prisma.SortOrder.desc,
      },
      include: {
        roles: {
          include: {
            rol: true,
          },
        },
      },
      take: getTake(limit, whereConditions),
      skip: getSkip(page, limit, whereConditions),
    });
  }

  async findBy<T>(key: string, value: T) {
    return await this.prismaService.user.findFirst({
      where: {
        [key]: value,
      },
      include: {
        roles: {
          include: {
            rol: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateUserDto) {
    return await this.prismaService.user.update({
      where: {
        id,
      },
      data,
      include: {
        roles: {
          include: {
            rol: true,
          },
        },
      },
    });
  }

  async updatePassword(id: string, password: string) {
    return await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        password,
      },
      include: {
        roles: {
          include: {
            rol: true,
          },
        },
      },
    });
  }

  async softDelete(id: string) {
    return await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        state: false,
      },
    });
  }

  async getTotalCount(allActive?: boolean): Promise<number> {
    return await this.prismaService.user.count({
      where: { state: allActive ? true : undefined },
    });
  }
}
