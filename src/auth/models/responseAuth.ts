import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from 'src/modules/user/dto/user.dto';

export class ResponseAuthModel {
  @ApiProperty({
    description: 'Access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  })
  accessToken: string;
  @ApiProperty({
    description: 'User data',
    type: UserDto,
  })
  user: UserDto;
}
