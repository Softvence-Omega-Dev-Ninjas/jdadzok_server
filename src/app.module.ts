import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { PassportModule } from "@nestjs/passport";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import BullConfig from "./configs/bull.config";
import CacheConfig from "./configs/redis.store";
import { LibModule } from "./lib/lib.module";
import { NotificationModule } from "./lib/notification/notification.module";
import { MainModule } from "./main/main.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheConfig,
    BullConfig,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    NotificationModule,
    PassportModule,
    LibModule,
    MainModule,
  ],
  controllers: [AppController],
})
export class AppModule { }
// export class AppModule implements NestModule {
//   // configure(consumer: MiddlewareConsumer) {
//   //   consumer.apply(LoggerMiddleware).forRoutes('*');
//   // }
// }
