import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: '12345678',
    description: 'ID Card/Passport',
    required: false,
    type: 'string',
  })
  @IsString({ message: 'field must be a string', always: false })
  @IsOptional()
  dni?: string;
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
    example: '12345678',
    description: 'Password',
    type: 'string',
  })
  @IsString({ message: 'field must be a string' })
  password: string;
  @IsString({ message: 'field must be a string' })
  @ApiProperty({
    example: 'hashed_password_example',
    description: 'Password hash',
    type: 'string',
  })
  rolId: string;
}
