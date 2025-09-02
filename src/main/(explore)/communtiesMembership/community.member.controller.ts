import { Controller, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { GetUser } from "@project/common/jwt/jwt.decorator";
import { handleRequest } from "@project/common/utils/handle.request.util";
import { JwtAuthGuard } from "@project/main/(started)/auth/guards/jwt-auth";
import { CommunityMemberService } from "./community.member.service";

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("communities/:communityId/members")
export class CommunityMemberController {
  constructor(private readonly service: CommunityMemberService) {}

  @Post()
  @ApiOperation({ summary: "Fallow this community." })
  async addMember(
    @Param("communityId") communityId: string,
    @GetUser("userId") userId: string,
  ) {
    return handleRequest(
      () => this.service.addMember(communityId, userId),
      "Added New Member/followers",
    );
  }

  // @Delete()
  // async
}
