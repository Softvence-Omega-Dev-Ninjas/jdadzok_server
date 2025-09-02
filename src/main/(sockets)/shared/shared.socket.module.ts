import { Global, Module } from "@nestjs/common";
import { RedisService } from "@project/common/redis/redis.service";
import { SocketExplorer } from "../explorer";
import { SharedSocketService } from "./shared.socket.service";

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [RedisService, SharedSocketService, SocketExplorer],
  exports: [SharedSocketService],
})
export class SharedSocketModule {}
