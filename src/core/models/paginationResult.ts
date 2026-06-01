import { ApiProperty } from '@nestjs/swagger';

export class PaginationResult<T> {
  @ApiProperty({ example: [], description: 'Results' })
  results: T[];
  @ApiProperty({ example: 1, description: 'Total results' })
  total: number;
  @ApiProperty({ example: 1, description: 'Current page' })
  page: number;
  @ApiProperty({ example: 1, description: 'Total pages' })
  limit: number;

  constructor(results: T[], total: number, page: number, limit: number) {
    this.results = results;
    this.total = total;
    this.page = page;
    this.limit = limit;
  }
}
