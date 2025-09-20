import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { SocketAuthGuard } from "./guards/socket-auth.guard";
import { RedisService } from "./services/redis.service";

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [],
  providers: [
    RedisService,
    {
      provide: APP_GUARD,
      useClass: SocketAuthGuard,
    },
  ],
  exports: [RedisService],
})
export class SocketsGroupModule {}
