import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RedisService } from "./services/redis.service";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [],
  providers: [RedisService],
  exports: [RedisService],
})
export class SocketsGroupModule { }
