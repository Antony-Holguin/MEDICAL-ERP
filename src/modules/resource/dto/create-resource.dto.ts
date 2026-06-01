import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateResourceDto {
  @IsString()
  @ApiProperty({
    description: 'Name of the resource',
    example: 'User',
  })
  name: string;
  @IsString()
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
  @IsString()
  @ApiProperty({
    description: 'State of the resource',
    example: true,
    type: 'boolean',
  })
  state: boolean;
}
