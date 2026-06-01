import { Module } from '@nestjs/common';
import { ResourceService } from './service/resource.service';
import { ResourceController } from './controller/resource.controller';
import { PrismaModule } from '@prisma/prisma.module';
import { ResourceRepository } from './repository/resource.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ResourceController],
  providers: [ResourceService, ResourceRepository],
})
export class ResourceModule {}
