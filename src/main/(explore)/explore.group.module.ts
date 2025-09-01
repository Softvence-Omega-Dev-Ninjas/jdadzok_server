import { Module } from "@nestjs/common";
import { CommunityModule } from "./communities/communities.module";
import { CommunityMemberModule } from "./communtiesMembership/community.member.module";


@Module({
  imports: [CommunityModule, CommunityMemberModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class ExploreGroupModule { }
