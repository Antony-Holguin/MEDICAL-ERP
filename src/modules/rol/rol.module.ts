import { Module } from '@nestjs/common';
import { RolService } from './service';
import { RolController } from './controller/rol.controller';
import { PrismaModule } from '@prisma/prisma.module';
import { RolRepository } from './repository';

@Module({
  imports: [PrismaModule],
  controllers: [RolController],
  providers: [RolService, RolRepository],
  exports: [RolService],
})
export class RolModule {}
