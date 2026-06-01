import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { Rol } from 'src/generated/prisma/client';

export class RolEntity implements Rol {
  @ApiProperty({ example: 1, description: 'Identifier', type: 'number' })
  @IsUUID()
  id: string;
  @ApiProperty({ example: 'Admin', description: 'Role name' })
  @IsString()
  name: string;
  @ApiProperty({
    example: 'Administrator role',
    description: 'Role description',
  })
  @IsString()
  code: string;
  @ApiProperty({
    example: 'Administrator role',
    description: 'Role description',
  })
  @IsOptional()
  description: string;
  @ApiProperty({ example: true, description: 'State', type: 'boolean' })
  @IsBoolean()
  state: boolean;
  @ApiProperty({
    example: true,
    description: 'Indicates if the role is a system role',
    type: 'boolean',
  })
  @IsBoolean()
  isSystem: boolean;
  @ApiProperty({
    example: '2021-10-10T00:00:00.000Z',
    description: 'Creation date',
    type: 'string',
  })
  createdAt: Date;
  @ApiProperty({
    example: '2021-10-10T00:00:00.000Z',
    description: 'Update date',
    type: 'string',
  })
  updatedAt: Date;
}
