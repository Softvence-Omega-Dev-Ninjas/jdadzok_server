import { Injectable } from "@nestjs/common";
import { PrismaService } from "@project/lib/prisma/prisma.service";

@Injectable()
export class FollowService {
  constructor(private readonly prisma: PrismaService) {}

  async followUser(followerId: string, followedId: string) {
    if (followerId === followedId) {
      throw new Error("Cannot follow userself");
    }

    return await this.prisma.$transaction([
      this.prisma.userFollow.create({
        data: {
          followerId,
          followedId,
        },
        select: {
          follower: { select: { id: true } },
          followed: { select: { id: true } },
          createdAt: true,
        },
      }),
    ]);
  }

  async unfollowUser(followerId: string, followedId: string) {
    return this.prisma.userFollow.delete({
      where: {
        followerId_followedId: {
          followerId,
          followedId,
        },
      },
    });
  }

  async followCommunity(userId: string, communityId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        followedCommunities: {
          connect: { id: communityId },
        },
      },
      select: {
        id: true,
        followedCommunities: {
          select: { id: true },
        },
      },
    });
  }
  async unfollowCommunity(userId: string, communityId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        followedCommunities: {
          disconnect: { id: communityId },
        },
      },
      select: {
        id: true,
        followedCommunities: {
          select: { id: true },
        },
      },
    });
  }
}
