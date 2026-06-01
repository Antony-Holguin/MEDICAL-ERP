import { ActionType } from '@generated/prisma/enums';
import { ResourceDto } from '@modules/resource/dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class PermissionDto {
  @IsUUID()
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
  @ApiProperty({
    description: 'Resource associated with the permission',
    type: ResourceDto,
  })
  resource: ResourceDto;
  @IsEnum(ActionType)
  @ApiProperty({
    description: 'Action type for the permission',
    example: 'READ',
    enum: ActionType,
  })
  action: ActionType;
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Description of the permission',
    example: 'Allows reading user data',
    required: false,
  })
  description?: string;
}
