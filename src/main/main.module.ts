import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PostsGroupModule } from "./(posts)/posts.group.module";
import { SharedGroupModule } from "./(shared)/shared.group.module";
import { StartedGroupModule } from "./(started)/started.group.module";
import { UserGroupModule } from "./(users)/users.group.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    StartedGroupModule,
    UserGroupModule,
    SharedGroupModule,
    PostsGroupModule,
  ],
  controllers: [],
  providers: [],
})
export class MainModule { }