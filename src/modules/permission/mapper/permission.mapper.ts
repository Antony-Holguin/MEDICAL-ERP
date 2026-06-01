import { Injectable } from '@nestjs/common';
import { PermissionEntity } from '../entities/permission.entity';
import { PermissionDto } from '../dto';
import { ResourceEntity } from '@modules/resource/entities/resource.entity';

@Injectable()
export class PermissionMapper {
  toDto(
    entity: PermissionEntity,
    resourceEntity: ResourceEntity,
  ): PermissionDto | null {
    if (!entity) return null;
    return {
      id: entity.id,
      resourceId: entity.resourceId,
      action: entity.action,
      description: entity.description,
      resource: {
        id: resourceEntity.id,
        name: resourceEntity.name,
        description: resourceEntity.description,
        module: resourceEntity.module,
        state: resourceEntity.state,
      },
    };
  }
}
