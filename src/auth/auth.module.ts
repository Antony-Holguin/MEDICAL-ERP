import { Module } from '@nestjs/common';
import { AuthService } from './services/auth/auth.service';
import { AuthController } from './controller/auth.controller';
import { MailModule } from 'src/modules/mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JWTstrategy } from './strategy/jwt.strategy';
import { UserModule } from 'src/modules/user/user.module';
import { HashPasswordService } from './services/hash-password/hash-password.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from '@nestjs/config';
import { PermissionsGuard } from './guards/permissions/permissions.guard';
import { RolesGuard } from './guards/roles/roles.guard';
import { RolModule } from '@modules/rol/rol.module';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    UserModule,
    RolModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JWTstrategy,
    HashPasswordService,
    PermissionsGuard,
    RolesGuard,
  ],
  exports: [
    PassportModule,
    JWTstrategy,
    AuthService,
    PermissionsGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
