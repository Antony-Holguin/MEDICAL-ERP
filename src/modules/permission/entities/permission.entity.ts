import { Permission } from '@generated/prisma/client';
import { ActionType } from '@generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsString, IsUUID } from 'class-validator';

export class PermissionEntity implements Permission {
  @IsString()
  @ApiProperty({
    description: 'Unique identifier for the permission',
    example: 'perm_1234567890',
  })
  id: string;
  @IsUUID()
  @ApiProperty({
    description: 'Identifier for the resource associated with the permission',
    example: 'res_0987654321',
    type: 'string',
    format: 'uuid',
  })
  resourceId: string;
  @IsEnum(ActionType)
  @ApiProperty({
    description: 'Action type for the permission',
    example: 'READ',
    enum: ActionType,
  })
  action: ActionType;
  @IsString()
  @ApiProperty({
    description: 'Description of the permission',
    example: 'Allows reading user data',
    required: false,
  })
  description: string | null;
  @IsDate()
  @ApiProperty({
    description: 'Timestamp when the permission was created',
    example: '2024-01-01T00:00:00Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @IsDate()
  @ApiProperty({
    description: 'Timestamp when the permission was last updated',
    example: '2024-01-02T00:00:00Z',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}
