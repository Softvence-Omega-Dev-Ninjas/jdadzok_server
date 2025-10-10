// import { Controller, UseGuards } from "@nestjs/common";
// import { ApiBearerAuth, } from "@nestjs/swagger";
// import { JwtAuthGuard } from "@app/main/(started)/auth/guards/jwt-auth";
// import { CommunityMemberService } from "./community.member.service";

// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
// @Controller("communities/:communityId/members")
// export class CommunityMemberController {
//   constructor(private readonly service: CommunityMemberService) {}

//   // @Post()
//   // @ApiOperation({ summary: "Fallow this community." })
//   // async addMember(
//   //   @Param("communityId") communityId: string,
//   //   @GetUser("userId") userId: string,
//   // ) {
//   //   return handleRequest(
//   //     () => this.service.addMember(communityId, userId),
//   //     "Added New Member/followers",
//   //   );
//   // }

//   // @Delete()
//   // async
// }
