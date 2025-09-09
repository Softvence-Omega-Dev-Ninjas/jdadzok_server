import { RedisConfig } from "@configs/redis.config";
import { CacheModule } from "@nestjs/cache-manager";
import { Global, Module } from "@nestjs/common";
import { RedisService } from "./redis.service";

@Global()
@Module({
  imports: [CacheModule.registerAsync(RedisConfig)],
  providers: [RedisService],
  exports: [CacheModule, RedisService],
})
export class RedisModule { }
