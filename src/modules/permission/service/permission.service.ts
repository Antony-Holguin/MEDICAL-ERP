import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  CreatePermissionDto,
  FilterPermissionDto,
  PermissionDto,
  UpdatePermissionDto,
} from '../dto';
import { PermissionRepository } from '../repository';
import { PermissionMapper } from '../mapper';
import { PaginationResult } from '@core/models';
import { buildContainsCondition } from '@core/utils';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    private readonly _permissionRepository: PermissionRepository,
    private readonly _permissionMapper: PermissionMapper,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    try {
      this.logger.log('Creating permission');
      const newPermission =
        await this._permissionRepository.create(createPermissionDto);
      this.logger.log('Permission created');
      const permissionDB = this._permissionMapper.toDto(
        newPermission,
        newPermission.resource,
      );
      if (!permissionDB) {
        throw new HttpException(
          'Failed to create permission',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return permissionDB;
    } catch (error) {
      this.logger.error('Failed to create permission', error);
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(
    options: FilterPermissionDto,
  ): Promise<PaginationResult<PermissionDto>> {
    try {
      const { page, limit } = options;

      const basicFilter = this.buildWhereConditions(options);

      const permissions = await this._permissionRepository.findAll(
        basicFilter,
        limit,
        page,
      );

      if (!permissions)
        throw new HttpException(
          'Failed to get permissions',
          HttpStatus.NO_CONTENT,
        );

      return {
        results: permissions.map((permission) =>
          this._permissionMapper.toDto(permission, permission.resource),
        ),
        total: await this._permissionRepository.getTotalCount(),
        page,
        limit,
      };
    } catch (error) {
      this.logger.error('Failed to get permissions', error);
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private buildWhereConditions(options: FilterPermissionDto) {
    return {
      resourceId: buildContainsCondition(options.resourceId),
      action: buildContainsCondition(options.action),
      description: buildContainsCondition(options.description),
    };
  }

  async findOne(id: string) {
    try {
      this.logger.log(`Finding permission with id: ${id}`);
      const permission = await this._permissionRepository.findBy<string>(
        'id',
        id,
      );
      if (!permission) {
        throw new HttpException('Permission not found', HttpStatus.NOT_FOUND);
      }
      return this._permissionMapper.toDto(permission, permission.resource);
    } catch (error) {
      this.logger.error(`Failed to find permission with id: ${id}`, error);
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    try {
      await this._permissionRepository.findBy<string>('id', id);
      const updatedPermission = await this._permissionRepository.update(
        id,
        updatePermissionDto,
      );
      return this._permissionMapper.toDto(
        updatedPermission,
        updatedPermission.resource,
      );
    } catch (error) {
      this.logger.error(`Failed to update permission with id: ${id}`, error);
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string) {
    try {
      await this._permissionRepository.findBy<string>('id', id);
      await this._permissionRepository.hardDelete(id);
      return new HttpException(
        'Permission deleted successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      this.logger.error(`Failed to delete permission with id: ${id}`, error);
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
