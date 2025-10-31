import { PrismaService } from "@lib/prisma/prisma.service";

import { EVENT_TYPES } from "@common/interface/events-name";
import { Community } from "@common/interface/events-payload";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CreateCommunityDto, UpdateCommunityDto } from "./dto/communities.dto";

@Injectable()
export class CommunitiesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    // create new community......
    //     async createCommunity(userId: string, dto: CreateCommunityDto) {
    //         const communitity = await this.prisma.community.findFirst({
    //             where: {
    //                 ownerId: userId,
    //                 profile: {
    //                     is: {
    //                         title: dto.profile?.title,
    //                     },
    //                 },
    //             },
    //         });
    //         if (communitity) {
    //             throw new BadRequestException("Community Already Exist.");
    //         }

    //         return await this.prisma.community.create({
    //             data: {
    //                 owner: {
    //                     connect: { id: userId },
    //                 },
    //                 communityType: dto.communityType,
    //                 foundationDate: dto.foundationDate,
    //                 about: {
    //                     create: {
    //                         ...dto.about,
    //                     },
    //                 },
    //                 profile: {
    //                     create: dto.profile,
    //                 },
    //             },
    //             include: {
    //                 about: true,
    //                 profile: true,
    //             },

    //         });

    //   }

    async createCommunity(userId: string, dto: CreateCommunityDto) {
        const communitity = await this.prisma.community.findFirst({
            where: {
                ownerId: userId,
                profile: {
                    is: {
                        title: dto.profile?.title,
                    },
                },
            },
        });
        if (communitity) {
            throw new BadRequestException("Community Already Exist.");
        }

        const newCommunity = await this.prisma.community.create({
            data: {
                owner: {
                    connect: { id: userId },
                },
                communityType: dto.communityType,
                foundationDate: dto.foundationDate,
                about: {
                    create: {
                        ...dto.about,
                    },
                },
                profile: {
                    create: dto.profile,
                },
            },
            include: {
                about: true,
                profile: true,
            },
        });

        //---------------- Event payload with recipients---------------

        // ---------------- Fetch all recipients ----------------
        const allUsers = await this.prisma.user.findMany({
            select: { id: true, email: true },
        });

        // -------------------- Build payload --------------------
        const payload: Community = {
            action: "CREATE",
            meta: {
                communityId: newCommunity.id,
                performedBy: userId,
                foundationDate: newCommunity.foundationDate,
            },
            info: {
                title: newCommunity.profile?.title ?? "New Community Created",
                message:
                    newCommunity.about?.mission ??
                    `A new community "${newCommunity.profile?.title}" has been created.`,
                recipients: allUsers,
            },
        };

        // ---------------- Emit event ----------------
        this.eventEmitter.emit(EVENT_TYPES.COMMUNITY_CREATE, payload);

<<<<<<< HEAD
        console.info(
            "✅ EVENT EMITTED:",
            EVENT_TYPES.COMMUNITY_CREATE,
            JSON.stringify(payload, null, 2),
        );
=======
        // console.log(
        //     "✅ EVENT EMITTED:",
        //     EVENT_TYPES.COMMUNITY_CREATE,
        //     JSON.stringify(payload, null, 2),
        // );
>>>>>>> c8846f9f9b9c0e4e07143f52c64a6e1f550f9932

        return newCommunity;
    }

    // find one community
    async findOne(communityId: string) {
        const community = await this.prisma.community.findUnique({
            where: { id: communityId },
            include: { profile: true, about: true, memberships: true },
        });
        if (!community) {
            throw new NotFoundException("Community Not Found");
        }
        return community;
    }
    // Delete community
    async deleteCommunity(userId: string, communityId: string) {
        const isExistCommunity = await this.prisma.community.findFirst({
            where: {
                id: communityId,
                ownerId: userId,
            },
        });
        if (!isExistCommunity) {
            throw new NotFoundException("Community is not found.");
        }

        return this.prisma.community.delete({
            where: { id: communityId },
        });
    }

    // update community
    async updateCommunity(userId: string, communityid: string, dto: UpdateCommunityDto) {
        const isExistCommunity = await this.prisma.community.findUnique({
            where: { id: communityid },
        });
        if (!isExistCommunity) {
            throw new NotFoundException("Community is Not Found.");
        }
        const user = await this.prisma.community.findFirst({
            where: { ownerId: userId },
        });
        if (!user) {
            throw new NotFoundException("Unauthorized Access.");
        }

        return this.prisma.community.update({
            where: { id: communityid },
            data: {
                communityType: dto.communityType,
                about: {
                    update: {
                        ...dto.about,
                    },
                },
                profile: {
                    update: {
                        ...dto.profile,
                    },
                },
            },
            include: {
                about: true,
                profile: true,
            },
        });
    }

    // user----community followers.

    async userFollowCommunity(userId: string, communityId: string) {
        // 1️⃣ Check if the user exists
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException(`User with id ${userId} not found`);

        // 2️⃣ Check if the community exists
        const community = await this.prisma.community.findUnique({
            where: { id: communityId },
        });
        if (!community) throw new NotFoundException(`Community with id ${communityId} not found`);

        // 3️⃣ Check if already following
        const exists = await this.prisma.communityFollower.findUnique({
            where: { userId_communityId: { userId, communityId } },
        });
        if (exists) throw new BadRequestException("Already following");

        // 4️⃣ Create follow and increment followers count
        await this.prisma.$transaction([
            this.prisma.communityFollower.create({
                data: { userId, communityId },
            }),
            this.prisma.communityProfile.update({
                where: { communityId },
                data: { followersCount: { increment: 1 } },
            }),
        ]);

        return { message: "User followed community" };
    }

    async userUnfollowCommunity(userId: string, communityId: string) {
        const follow = await this.prisma.communityFollower.findUnique({
            where: { userId_communityId: { userId, communityId } },
        });
        if (!follow) throw new BadRequestException("Not following");

        await this.prisma.$transaction([
            this.prisma.communityFollower.delete({ where: { id: follow.id } }),

            this.prisma.communityProfile.update({
                where: { communityId },
                data: { followersCount: { decrement: 1 } },
            }),
        ]);

        return { message: "User unfollowed community" };
    }

    // community follow another community..

    // async communityFollowCommunity(followerId: string, followingId: string) {
    //   if (followerId === followingId) {
    //     throw new BadRequestException("A community cannot follow itself");
    //   }

    //   const exists = await this.prisma.communityFollow.findUnique({
    //     where: {
    //       followerId_followingId: {
    //         followerId,
    //         followingId,
    //       },
    //     },
    //   });
    //   if (exists) throw new BadRequestException("Already following");

    //   await this.prisma.$transaction([
    //     this.prisma.communityFollow.create({
    //       data: { followerId, followingId },
    //     }),
    //     this.prisma.communityProfile.update({
    //       where: { communityId: followingId },
    //       data: { followersCount: { increment: 1 } },
    //     }),
    //     this.prisma.communityProfile.update({
    //       where: { communityId: followerId },
    //       data: { followingCount: { increment: 1 } },
    //     }),
    //   ]);

    //   return { message: "Community followed another community" };
    // }

    // ----------LIKE ----------
    async likeCommunity(userId: string, communityId: string) {
        await this.prisma.community.update({
            where: { id: communityId },
            data: { likers: { connect: { id: userId } } },
        });

        const likes = await this.prisma.community.count({
            where: { id: communityId, likers: { some: {} } },
        });

        await this.prisma.community.update({
            where: { id: communityId },
            data: { likes },
        });

        return { success: true, likes };
    }

    // ------UNLIKE--------
    async unlikeCommunity(userId: string, communityId: string) {
        await this.prisma.community.update({
            where: { id: communityId },
            data: { likers: { disconnect: { id: userId } } },
        });

        const likes = await this.prisma.community.count({
            where: { id: communityId, likers: { some: {} } },
        });

        await this.prisma.community.update({
            where: { id: communityId },
            data: { likes },
        });

        return { success: true, likes };
    }

    // -------Count Likes and Followers----
    async getCommunityCounts(communityId: string) {
        const profile = await this.prisma.communityProfile.findUnique({
            where: { communityId },
            select: { followersCount: true },
        });

        const community = await this.prisma.community.findUnique({
            where: { id: communityId },
            select: { likes: true },
        });

        return {
            followersCount: profile?.followersCount ?? 0,
            likes: community?.likes ?? 0,
        };
    }
    // ---------find all community here---
    async findAll() {
        return await this.prisma.community.findMany({
            include: { profile: true, about: true, memberships: true },
        });
    }
}
