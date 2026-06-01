import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SignUpPublicDto {
  @ApiProperty({
    example: 'hector.ruiz',
    description: 'Username',
    type: 'string',
  })
  @IsString({ message: 'username must be a string' })
  name: string;
  @ApiProperty({
    example: 'ruiz',
    description: 'User lastname',
    type: 'string',
  })
  @IsString({ message: 'lastname must be a string' })
  lastName: string;
  @ApiProperty({
    example: 'example@yavirac.edu.ec',
    description: 'Email',
    type: 'string',
  })
  @IsEmail()
  email: string;
  @ApiProperty({
    example: '04',
    description: 'Identification type',
  })
  @ApiProperty({
    example: '12345678',
    description: 'Password',
    type: 'string',
  })
  @IsString({ message: 'field must be a string' })
  password: string;
}
