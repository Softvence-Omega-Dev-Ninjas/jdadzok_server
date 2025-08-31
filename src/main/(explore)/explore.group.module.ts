import { Module } from "@nestjs/common";
import { CommunityModule } from "./communities/communities.module";


@Module({
  imports: [CommunityModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class ExploreGroupModule { }
