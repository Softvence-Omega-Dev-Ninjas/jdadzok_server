import { Injectable } from "@nestjs/common";
import { PrismaService } from "@project/lib/prisma/prisma.service";

@Injectable()
export class FollowRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findManyFollowerId(followingId: string) {
        return await this.prisma.follow.findMany({
            where: { followingId },
            select: { followerId: true },
        });
    }
}
