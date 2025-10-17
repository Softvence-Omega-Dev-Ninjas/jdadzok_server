import { PrismaService } from "@lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class FollowUnfollowRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findManyFollowerId(followingId: string) {
        return await this.prisma.follow.findMany({
            where: { followingId },
            select: { followerId: true },
        });
    }
}
