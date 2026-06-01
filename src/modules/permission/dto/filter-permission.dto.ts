import { PaginationOptions } from '@core/models/paginationOptions';
import { ActionType } from '@generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';

export class FilterPermissionDto extends PaginationOptions {
  @ApiProperty({
    type: String,
    description: 'Resource ID associated with the permission',
    required: false,
  })
  resourceId?: string;

  @ApiProperty({
    description: 'Action type for the permission',
    required: false,
    enum: ActionType,
  })
  action?: ActionType;

  @ApiProperty({
    type: String,
    description: 'Description of the permission',
    required: false,
  })
  description?: string;
}
