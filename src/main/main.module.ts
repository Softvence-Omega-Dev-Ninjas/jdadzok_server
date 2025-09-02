import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ExploreGroupModule } from "./(explore)/explore.group.module";
import { MarketplacesGroupModule } from "./(marketplace)/marketplace.group.module";
import { PostsGroupModule } from "./(posts)/posts.group.module";
import { SharedGroupModule } from "./(shared)/shared.group.module";
import { StartedGroupModule } from "./(started)/started.group.module";
import { UserGroupModule } from "./(users)/users.group.module";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    StartedGroupModule,
    UserGroupModule,
    SharedGroupModule,
    PostsGroupModule,
    MarketplacesGroupModule,
    ExploreGroupModule,
  ],
  controllers: [],
  providers: [],
})
export class MainModule {}
