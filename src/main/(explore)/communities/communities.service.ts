import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { CreateCommunityDto } from "./dto/communities.dto";
import { CommunityQueryDto } from "./dto/community.query";

@Injectable()
export class CommunitiesService {
  constructor(private readonly prisma: PrismaService) {}

    // create new community......
    async createCommunity(userId: string, dto: CreateCommunityDto) {
        const communitity = await this.prisma.communities.findFirst({
            where: {
                ownerId: userId,
                sharedProfile: {
                    is: {
                        title: dto.sharedProfile.title
                    }
                }
            }
        })
        if (communitity) {
            throw new BadRequestException("Community Already Exist.")
        }

        return await this.prisma.communities.create({
            data: {
                owner: {
                    connect: { id: userId }
                },
                communityType: dto.communityType,
                foundationDate: dto.foundationDate,
                sharedProfile: {
                    create: {
                        title: dto.sharedProfile.title,
                        bio: dto.sharedProfile.bio,
                        avatarUrl: dto.sharedProfile.avatarUrl,
                        coverUrl: dto.sharedProfile.coverUrl,
                        location: dto.sharedProfile.location,
                        followersCount: dto.sharedProfile.followersCount,
                        followingCount: dto.sharedProfile.followingCount,
                        fieldOfWork: dto.sharedProfile.fieldOfWork,
                        About: dto.sharedProfile.About
                    }
                }
            }
        })
    }

    // find All data....
    async findAll(query?: CommunityQueryDto) {
        const community = await this.prisma.communities.findMany({
            where: {
                sharedProfile: {
                    is: {
                        title: query?.title
                            ? { contains: query.title, mode: "insensitive" }
                            : undefined,
                        bio: query?.bio
                            ? { contains: query.bio, mode: "insensitive" }
                            : undefined,
                        location: query?.location
                            ? { contains: query.location, mode: "insensitive" }
                            : undefined,
                    },

                },

            },
            orderBy: { createdAt: "desc" },
            include: {
                sharedProfile: true
            }
        })
        return community
    }

    // Delete community
    async deleteCommunity(userId: string, communityId: string) {
        const isExistCommunity = await this.prisma.communities.findFirst({
            where: {
                id: communityId,
                ownerId: userId,
            }
        })
        if (!isExistCommunity) {
            throw new NotFoundException("Community is not found.")
        }

        return this.prisma.communities.delete({
            where: { id: communityId }
        })
    }

    // update community 
    // async updateCommunity(userId: string, dto: UpdateCommunityDto) {

    // }

}


