import { PaginationOptions } from '@core/models';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class FilterResourceDto extends PaginationOptions {
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Name of the resource',
    required: false,
  })
  name?: string;
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Module to which the resource belongs',
    required: false,
  })
  module?: string;
  @IsBoolean()
  @ApiProperty({
    type: Boolean,
    description: 'State of the resource',
    required: false,
  })
  state?: boolean;
}
