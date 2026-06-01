import { PaginationOptions } from '@core/models';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class FilterRolDto extends PaginationOptions {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Admin', description: 'Role name', required: false })
  name?: string;
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'ADMIN', description: 'Role code', required: false })
  code?: string;
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true, description: 'Role state', required: false })
  state?: boolean;
}
