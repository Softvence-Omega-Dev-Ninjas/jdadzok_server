import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RedisModule } from "@project/common/redis/redis.module";
import { CoreGroupModule } from "./(core)/core.group.module";
import { ExploreGroupModule } from "./(explore)/explore.group.module";
import { MarketplacesGroupModule } from "./(marketplace)/marketplace.group.module";
import { PayGroupModule } from "./(pay)/pay.group.module";
import { PostsGroupModule } from "./(posts)/posts.group.module";
import { SharedGroupModule } from "./(shared)/shared.group.module";
import { SocketsGroupModule } from "./(sockets)/sockets.group.module";
import { StartedGroupModule } from "./(started)/started.group.module";
import { UserGroupModule } from "./(users)/users.group.module";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    CoreGroupModule,
    SocketsGroupModule,
    StartedGroupModule,
    UserGroupModule,
    SharedGroupModule,
    PostsGroupModule,
    MarketplacesGroupModule,
    ExploreGroupModule,
    PayGroupModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class MainModule {}
