import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignInDto {
  @IsEmail({}, { message: 'Email must be text' })
  @ApiProperty({
    description: 'User email',
    example: 'r@r.com',
  })
  email: string;
  @IsString({ message: 'Password must be text' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @ApiProperty({
    description: 'User password',
    example: '12345678',
  })
  password: string;
}
