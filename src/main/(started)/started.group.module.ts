import { Module } from "@nestjs/common";
import { RedisService } from "@project/common/redis/redis.service";
import { AuthModule } from "./auth/auth.module";
import { ChoicesModule } from "./choices/choices.module";

@Module({
  imports: [AuthModule, ChoicesModule],
  controllers: [],
  providers: [RedisService],
  exports: [],
})
export class StartedGroupModule { }
