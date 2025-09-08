import { Global, Module } from "@nestjs/common";
import { RedisService } from "@project/common/redis/redis.service";

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [RedisService],
})
export class SharedSocketModule {}
