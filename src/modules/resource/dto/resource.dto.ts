import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsUUID } from 'class-validator';

export class ResourceDto {
  @IsUUID()
  @ApiProperty({
    description: 'Unique identifier for the resource',
    example: 'res_1234567890',
    type: 'string',
    format: 'uuid',
  })
  id: string;
  @IsString()
  @ApiProperty({
    description: 'Name of the resource',
    example: 'User',
  })
  name: string;
  @ApiProperty({
    description: 'Description of the resource',
    example: 'Represents a user in the system',
  })
  description: string;
  @IsString()
  @ApiProperty({
    description: 'Module to which the resource belongs',
    example: 'User Management',
  })
  module: string;
  @IsBoolean()
  @ApiProperty({
    description: 'State of the resource',
    example: true,
    type: 'boolean',
  })
  state: boolean;
}
