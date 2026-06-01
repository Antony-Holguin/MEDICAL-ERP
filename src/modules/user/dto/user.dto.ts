import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: 'id del usuario', example: '1' })
  id: string;
  @ApiProperty({ description: 'nombre del usuario', example: 'ppepep' })
  name: string;
  @ApiProperty({ description: 'apellido del usuario', example: 'pepepe' })
  lastName: string;
  @ApiProperty({ description: 'nombre del usuario', example: 'Carlos Slim' })
  completeName: string;
  @ApiProperty({
    description: 'email del usuario',
    example: 'r@yavirac.edu.ec',
  })
  email: string;
  @ApiProperty({ description: 'estado del usuario', example: true })
  state: boolean;
  @ApiProperty({ description: 'rol del usuario', example: 'ADMIN' })
  rolId: string;
  @ApiProperty({ description: 'nombre del rol', example: 'ADMIN' })
  rol: string;
}
