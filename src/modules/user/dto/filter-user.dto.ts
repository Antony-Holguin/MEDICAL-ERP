import { PaginationOptions } from '@core/models/paginationOptions';
import { ApiProperty } from '@nestjs/swagger';

export class FilterUserDto extends PaginationOptions {
  @ApiProperty({
    type: String,
    description: 'identificacion',
    required: false,
  })
  identification?: string;
  @ApiProperty({
    type: String,
    description: 'nombre',
    required: false,
  })
  name?: string;
  @ApiProperty({
    type: String,
    description: 'email',
    required: false,
  })
  email?: string;
}
