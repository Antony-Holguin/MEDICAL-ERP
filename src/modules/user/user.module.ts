import { Module } from '@nestjs/common';
import { UserService, UserRolService } from './service';
import { UserController } from './controller/user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserMapper } from './mapper/user.mapper';
import { CoreModule } from '@core/core.module';
import { UserRepository, UserRolRepository } from './repository';
import { RolModule } from '@modules/rol/rol.module';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    UserMapper,
    UserRolRepository,
    UserRolService,
  ],
  imports: [PrismaModule, CoreModule, RolModule],
  exports: [UserService, UserRolService],
})
export class UserModule {}
