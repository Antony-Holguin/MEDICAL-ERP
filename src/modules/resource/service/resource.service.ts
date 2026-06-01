import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateResourceDto, ResourceDto, UpdateResourceDto } from '../dto';
import { ResourceRepository } from '../repository/resource.repository';
import { PaginationResult } from '@core/models';
import { FilterResourceDto } from '../dto/filter-resource.dto';
import { buildContainsCondition } from '@core/utils';

@Injectable()
export class ResourceService {
  private readonly logger = new Logger(ResourceService.name);

  constructor(private readonly _resourceRepository: ResourceRepository) {}

  async create(createResourceDto: CreateResourceDto): Promise<ResourceDto> {
    try {
      this.logger.log('Creating resource');
      const newResource =
        await this._resourceRepository.create(createResourceDto);
      this.logger.log('Resource created');
      if (!newResource) {
        throw new HttpException(
          'Failed to create resource',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return {
        id: newResource.id,
        name: newResource.name,
        module: newResource.module,
        description: newResource.description,
        state: newResource.state,
      };
    } catch (error) {
      this.logger.error('Failed to create resource', error);
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(
    options: FilterResourceDto,
    allActive?: boolean,
  ): Promise<PaginationResult<ResourceDto>> {
    try {
      const { page, limit } = options;

      const basicFilter = this.buildWhereConditions(options, allActive);

      const resources = await this._resourceRepository.findAll(
        basicFilter,
        limit,
        page,
      );

      if (!resources) {
        throw new HttpException(
          'Failed to find resources',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        results: resources.map((resource) => ({
          id: resource.id,
          name: resource.name,
          module: resource.module,
          description: resource.description,
          state: resource.state,
        })),
        total: await this._resourceRepository.getTotalCount(allActive),
        page,
        limit,
      };
    } catch (error) {
      this.logger.error('Failed to find resources', error);
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  buildWhereConditions(options: FilterResourceDto, allActive?: boolean) {
    return {
      name: buildContainsCondition(options.name),
      module: buildContainsCondition(options.module),
      state: allActive ? allActive : undefined,
    };
  }

  async findOne(id: string): Promise<ResourceDto> {
    try {
      this.logger.log(`Finding resource with id: ${id}`);
      const resource = await this._resourceRepository.findBy<string>('id', id);
      if (!resource) {
        throw new HttpException('Resource not found', HttpStatus.NOT_FOUND);
      }
      return {
        id: resource.id,
        name: resource.name,
        module: resource.module,
        description: resource.description,
        state: resource.state,
      };
    } catch (error) {
      this.logger.error('Failed to find resource', error);
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updateResourceDto: UpdateResourceDto) {
    try {
      await this.findOne(id);
      this.logger.log(`Updating resource with id: ${id}`);
      const updatedResource = await this._resourceRepository.update(
        id,
        updateResourceDto,
      );
      this.logger.log(`Resource with id: ${id} updated`);
      return {
        id: updatedResource.id,
        name: updatedResource.name,
        module: updatedResource.module,
        description: updatedResource.description,
        state: updatedResource.state,
      };
    } catch (error) {
      this.logger.error(`Failed to update resource with id: ${id}`, error);
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string) {
    try {
      this.logger.log(`Removing resource with id: ${id}`);
      await this.findOne(id);
      this.logger.log(`Resource with id: ${id} found, proceeding to remove`);
      await this._resourceRepository.softDelete(id);
      return new HttpException('Resource deleted successfully', HttpStatus.OK);
    } catch (error) {
      this.logger.error(`Failed to remove resource with id: ${id}`, error);
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
