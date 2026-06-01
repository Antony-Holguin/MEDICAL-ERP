import { ApiProperty } from '@nestjs/swagger';

export class PaginationOptions {
  @ApiProperty({
    type: Number,
    description: 'page number',
    required: true,
  })
  page: number;
  @ApiProperty({
    type: Number,
    description: 'records per page',
    required: true,
  })
  limit: number;
}
