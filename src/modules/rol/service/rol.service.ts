import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateRolDto, RolDto, UpdateRolDto } from '../dto';
import { RolRepository } from '../repository/rol.repository';
import { FilterRolDto } from '../dto/filter-rol.dto';
import { PaginationResult } from '@core/models';
import { buildContainsCondition } from '@core/utils';

@Injectable()
export class RolService {
  private readonly logger = new Logger(RolService.name);

  constructor(private readonly _rolRepository: RolRepository) {}

  async create(createRolDto: CreateRolDto): Promise<RolDto | null> {
    try {
      this.logger.log('Creating role');
      const newRole = await this._rolRepository.create(createRolDto);
      if (!newRole) {
        throw new HttpException(
          'Failed to create role',
          HttpStatus.BAD_REQUEST,
        );
      }
      this.logger.log('Role created');
      return newRole;
    } catch (error) {
      this.logger.error('Error creating role', error);
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(
    options: FilterRolDto,
    allActive?: boolean,
  ): Promise<PaginationResult<RolDto>> {
    try {
      const { page, limit } = options;

      const basicFilter = this.buildWhereConditions(options, allActive);

      const roles = await this._rolRepository.findAll(basicFilter, limit, page);

      if (!roles) {
        throw new HttpException(
          'Failed to find roles',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        results: roles.map((role) => ({
          id: role.id,
          name: role.name,
          code: role.code,
          description: role.description,
          state: role.state,
          isSystem: role.isSystem,
        })),
        total: await this._rolRepository.getTotalCount(allActive),
        page,
        limit,
      };
    } catch (error) {
      this.logger.error('Error finding roles', error);
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  buildWhereConditions(options: FilterRolDto, allActive: boolean) {
    return {
      name: buildContainsCondition(options.name),
      code: buildContainsCondition(options.code),
      state: allActive ? allActive : undefined,
    };
  }

  async findOne(id: string): Promise<RolDto> {
    try {
      this.logger.log(`Finding role by with ID: ${id}`);
      const role = await this._rolRepository.findBy<string>('id', id);
      if (!role) {
        throw new HttpException('Role does not exist', HttpStatus.NOT_FOUND);
      }
      return role;
    } catch (error) {
      this.logger.error(`Failed to find role with ID: ${id}`, error);
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findDefault() {
    try {
      this.logger.log('Finding default role');
      const role = await this._rolRepository.findBy<string>('code', 'client');
      if (!role) {
        throw new HttpException(
          'Default role does not exist',
          HttpStatus.NOT_FOUND,
        );
      }
      this.logger.log('Default role found');
      return role;
    } catch (error) {
      this.logger.error('Failed to find default role', error);
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updateRolDto: UpdateRolDto): Promise<RolDto> {
    try {
      await this.findOne(id);
      this.logger.log(`Updating role with ID: ${id}`);
      const updatedRole = await this._rolRepository.update(id, updateRolDto);
      if (!updatedRole) {
        throw new HttpException(
          'Failed to update role',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      this.logger.log(`Role with ID: ${id} updated successfully`);
      return {
        id: updatedRole.id,
        name: updatedRole.name,
        code: updatedRole.code,
        description: updatedRole.description,
        state: updatedRole.state,
        isSystem: updatedRole.isSystem,
      };
    } catch (error) {
      this.logger.error(`Failed to update role with ID: ${id}`, error);
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string) {
    try {
      this.logger.log(`Removing role with ID: ${id}`);
      await this.findOne(id);
      await this._rolRepository.softDelete(id);
      return new HttpException('Role deleted successfully', HttpStatus.OK);
    } catch (error) {
      this.logger.error(`Failed to remove role with ID: ${id}`, error);
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
