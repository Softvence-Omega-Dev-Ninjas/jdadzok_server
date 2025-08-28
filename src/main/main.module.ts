import { Module } from "@nestjs/common";
import { MarketplacesGroupModule } from "./(marketplace)/marketplace.group.module";
import { SharedGroupModule } from "./(shared)/shared.group.module";
import { StartedGroupModule } from "./(started)/started.group.module";
import { UserGroupModule } from "./(users)/users.group.module";

@Module({
  imports: [
    StartedGroupModule,
    UserGroupModule,
    SharedGroupModule,
    MarketplacesGroupModule
  ],
  controllers: [],
  providers: [],
})
export class MainModule { }
