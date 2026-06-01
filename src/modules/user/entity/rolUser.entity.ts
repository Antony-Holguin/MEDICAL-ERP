import { UserRol } from '@generated/prisma/client';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class UserRolEntity implements UserRol {
  @IsString()
  id: string;
  @IsString()
  rolId: string;
  @IsString()
  userId: string;
  @IsString()
  @IsOptional()
  assignedBy: string | null;
  @IsDate()
  createdAt: Date;
  @IsDate()
  updatedAt: Date;
}
