import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { User } from 'src/generated/prisma/client';

export class UserEntity implements User {
  @ApiProperty({ example: 1, description: 'Identifier', type: 'number' })
  @IsString()
  id: string;
  @ApiProperty({ example: 'Hector', description: 'Student first name' })
  name: string;
  @ApiProperty({
    example: 'Ruiz',
    description: 'Student last name',
    readOnly: true,
  })
  lastName: string;
  @ApiProperty({
    example: 'example@example.com',
    description: 'Email',
    type: 'string',
  })
  email: string;
  @ApiProperty({
    example: 'hashed_email_example',
    description: 'Hashed email for searches',
    type: 'string',
  })
  emailHash: string;
  @ApiProperty({
    example: false,
    description: 'Indicates if the email has been verified',
    type: 'boolean',
  })
  emailVerified: boolean;
  @ApiProperty({
    example: '0987654321',
    description: 'Phone',
    type: 'string',
  })
  phone: string;
  @ApiProperty({ example: '', description: 'Password', type: 'string' })
  password: string;
  @ApiProperty({
    example: '2021-10-10T00:00:00.000Z',
    description: 'Creation date',
    type: 'string',
  })
  createdAt: Date;
  @ApiProperty({
    example: '2021-10-10T00:00:00.000Z',
    description: 'Update date',
    type: 'string',
  })
  updatedAt: Date;
  @ApiProperty({ example: true, description: 'Estado', type: 'boolean' })
  state: boolean;
}
