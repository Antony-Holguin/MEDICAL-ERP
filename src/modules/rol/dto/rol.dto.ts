import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class RolDto {
  @ApiProperty({ example: '1', description: 'Role ID' })
  @IsString()
  id: string;
  @ApiProperty({ example: 'Admin', description: 'Role name' })
  @IsString()
  name: string;
  @IsString()
  @ApiProperty({ example: 'ADMIN', description: 'Role code' })
  code: string;
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Administrator role',
    description: 'Role description',
    required: false,
  })
  description?: string;
  @IsBoolean()
  @ApiProperty({ example: true, description: 'Role state' })
  state: boolean;
  @IsBoolean()
  @ApiProperty({ example: false, description: 'Is system role' })
  isSystem: boolean;
}
