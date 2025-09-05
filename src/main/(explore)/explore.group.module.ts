import { Module } from "@nestjs/common";
import { CommunityModule } from "./communities/communities.module";
// import { CommunityMemberModule } from "./communtiesMembership/community.member.module";
import { NgoModule } from "./ngo/ngo.module";

@Module({
  imports: [CommunityModule, NgoModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class ExploreGroupModule {}
