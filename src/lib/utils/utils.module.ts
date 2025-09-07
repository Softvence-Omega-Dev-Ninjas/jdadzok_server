import { Global, Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { RedisService } from "@project/common/redis/redis.service";
import { OptService } from "./otp.service";
import { UtilsService } from "./utils.service";

@Global()
@Module({
  providers: [UtilsService, OptService, JwtService, RedisService],
  exports: [UtilsService, OptService],
})
export class UtilsModule { }
