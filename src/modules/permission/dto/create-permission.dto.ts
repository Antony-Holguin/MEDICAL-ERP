import { ActionType } from '@generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePermissionDto {
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
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Description of the permission',
    example: 'Allows reading user data',
    required: false,
  })
  description?: string;
}
