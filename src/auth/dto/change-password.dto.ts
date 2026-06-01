import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsEmail({}, { message: 'Field must be a valid email' })
  @ApiProperty({
    description: 'User email',
    example: 'r@yavirac.edu.ec',
  })
  @IsEmail({}, { message: 'Field must be a valid email' })
  email: string;
  @IsString({ message: 'Field must be a string' })
  @ApiProperty({
    description: 'Current user password',
    example: '12345678',
  })
  currentPassword: string;
  @IsString({ message: 'Field must be a string' })
  @ApiProperty({
    description: 'New user password',
    example: '12345678',
  })
  newPassword: string;
}

export class RequestResetPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
