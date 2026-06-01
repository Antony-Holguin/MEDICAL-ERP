import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserResponseDto {
  @ApiProperty({ example: 'User Updated' })
  message: string;
}
