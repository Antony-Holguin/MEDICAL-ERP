import { IsString } from 'class-validator';

export class CreateUserRolDto {
  @IsString()
  userId: string;
  @IsString({ each: true })
  rolId: string[];
}
