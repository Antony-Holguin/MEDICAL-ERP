import { ApiProperty } from '@nestjs/swagger';

export class CreateRolDto {
  @ApiProperty({ example: 'Admin', description: 'Role name' })
  name: string;
  @ApiProperty({
    example: 'Administrator role',
    description: 'Role description',
    required: false,
  })
  description?: string;
}
