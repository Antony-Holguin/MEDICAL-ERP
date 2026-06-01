import { Module } from '@nestjs/common';
import { PermissionService } from './service/permission.service';
import { PermissionController } from './controller/permission.controller';
import { PrismaModule } from '@prisma/prisma.module';
import { PermissionRepository } from './repository';
import { PermissionMapper } from './mapper';

@Module({
  imports: [PrismaModule],
  controllers: [PermissionController],
  providers: [PermissionService, PermissionRepository, PermissionMapper],
})
export class PermissionModule {}
