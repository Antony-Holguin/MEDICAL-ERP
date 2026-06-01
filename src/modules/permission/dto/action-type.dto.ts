import { ApiProperty } from '@nestjs/swagger';

export class ActionTypeDto {
  @ApiProperty({
    description: 'Name of the action type',
    example: 'READ',
  })
  name: string;
}
