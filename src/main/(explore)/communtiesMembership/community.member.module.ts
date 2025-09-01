import { Module } from "@nestjs/common";
import { CommunityMemberController } from "./community.member.controller";
import { CommunityMemberService } from "./community.member.service";

@Module({
  imports: [],
  controllers: [CommunityMemberController],
  providers: [CommunityMemberService],
  exports: [],
})
export class CommunityMemberModule { }