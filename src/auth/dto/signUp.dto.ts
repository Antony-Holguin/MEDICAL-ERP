import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { SignUpPublicDto } from './signUpPublic.dto';

export class SignUpDto extends SignUpPublicDto {
  @IsUUID('4', { message: 'field must be a valid UUID' })
  @ApiProperty({
    example: '21e7c9b8-3f1a-4d2b-9c5e-123456789abc',
    description: 'ID del rol',
    type: 'string',
  })
  rolId: string;
}
