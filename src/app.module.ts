import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as ormconfig from 'ormconfig';

import { UsersModule } from './users/users.module';
import { LoggerMiddleware } from './middlewares/logger.middlewares';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ChannelsModule } from './channels/channels.module';
import { DmsModule } from './dms/dms.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './http-exception.filter';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';


 @Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV == 'dev' ? '.env.dev' : '.env.test',
    }), 
    TypeOrmModule.forRoot(ormconfig),
    UsersModule, 
    WorkspacesModule, 
    ChannelsModule, 
    DmsModule,
    AuthModule,
    EventsModule
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any { // Logger 미들웨어 적용, 미들웨어들은 consumer에 연결함
    consumer.apply(LoggerMiddleware).forRoutes('*'); // routs 전체에 Logger 미들웨어 적용
  }
}
