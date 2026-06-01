import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';

import { LoggerModule } from 'pino-nestjs';
import { RequestIdMiddleware } from '@core/middlewares';
import { requestId } from '@core/middlewares/constants';
import { APP_FILTER } from '@nestjs/core';
import {
  AllExceptionsFilter,
  UnauthorizedExceptionFilter,
} from '@core/filters';
import { AuthModule } from '@auth/auth.module';
import { MailModule } from '@modules/mail/mail.module';
import { UserModule } from '@modules/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from '@core/config';
import { BullModule } from '@nestjs/bull';
import { RolModule } from './modules/rol/rol.module';
import { PermissionModule } from './modules/permission/permission.module';
import { ResourceModule } from './modules/resource/resource.module';
import { HealthController } from './health/controller/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    PrismaModule,
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            levelFirst: true,
          },
        },
        customProps(req) {
          return {
            requestId: req[requestId],
          };
        },
        autoLogging: false,
        serializers: {
          req: (req: Request) => ({
            method: req.method,
            url: req.url,
            body: req.body,
          }),
          res: (res: Response) => ({
            statusCode: res.status,
            body: res.body,
          }),
        },
      },
    }),
    AuthModule,
    MailModule,
    UserModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          username: configService.get<string>('REDIS_USERNAME'),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
    }),
    RolModule,
    PermissionModule,
    ResourceModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: UnauthorizedExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('{*path}');
  }
}
