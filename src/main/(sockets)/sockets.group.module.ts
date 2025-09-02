import { Global, Module } from "@nestjs/common";
import { RedisService } from "@project/common/redis/redis.service";
import { SharedSocketModule } from "./shared/shared.socket.module";

@Global()
@Module({
  imports: [SharedSocketModule],
  controllers: [],
  providers: [RedisService],
  exports: [],
})
export class SocketsGroupModule {}
