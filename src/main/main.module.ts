import { RedisConfig } from "@configs/redis.config";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RedisService } from "@project/common/redis/redis.service";
import { PostsGroupModule } from "./(posts)/posts.group.module";
import { SharedGroupModule } from "./(shared)/shared.group.module";
import { StartedGroupModule } from "./(started)/started.group.module";
import { UserGroupModule } from "./(users)/users.group.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync(RedisConfig),
    StartedGroupModule,
    UserGroupModule,
    SharedGroupModule,
    PostsGroupModule,
  ],
  controllers: [],
  providers: [RedisService],
  exports: [RedisService, CacheModule]
})
export class MainModule { }
