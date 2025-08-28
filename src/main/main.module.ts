import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
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
    PostsGroupModule,
    UserGroupModule,
    SharedGroupModule,
    MarketplacesGroupModule,
  ],
  controllers: [],
  providers: [],
})
export class MainModule {}
