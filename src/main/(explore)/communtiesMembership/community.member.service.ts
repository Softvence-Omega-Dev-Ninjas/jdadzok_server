import { PrismaService } from "@lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CommunityMemberService {
    constructor(private readonly prisma: PrismaService) { }

    // async addMember(communityId: string, userId: string) {
    //   const isMemberExist = await this.prisma.communitiesMembership.findFirst({
    //     where: { userId },
    //   });
    //   if (isMemberExist) {
    //     throw new BadRequestException("User Already Member Of This Community.");
    //   }
    //   const membership = await this.prisma.communitiesMembership.create({
    //     data: {
    //       communityId,
    //       userId,
    //       role: "MEMBER",
    //     },
    //   });
    //   const community = await this.prisma.communities.findUnique({
    //     where: { id: communityId },
    //     include: { sharedProfile: true },
    //   });
    //   if (community?.sharedProfileId) {
    //     await this.prisma.sharedProfile.update({
    //       where: { id: community.sharedProfileId },
    //       data: { followersCount: { increment: 1 } },
    //     });
    //   }
    //   return membership;
    // }
}
