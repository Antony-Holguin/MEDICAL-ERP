import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsString({ message: 'Field must be a password' })
  @ApiProperty({
    description: 'New user password',
    example: '12345678',
  })
  newPassword: string;
  @IsString({ message: 'Field must be a password' })
  @ApiProperty({
    description: 'Password reset token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp',
  })
  token: string;
}
