import { PrismaService } from "@lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CommunityNgoService {
    constructor(private readonly prisma: PrismaService) {}

    async getOverview() {
        let totalCommunityAndNgo = 0;
        const totalCommunities = await this.prisma.community.count();
        const totalNgo = await this.prisma.ngo.count();
        totalCommunityAndNgo = totalCommunities + totalNgo;

        const verified = await this.prisma.ngoVerification.count({
            where: { status: "APPROVED" },
        });

        const pending = await this.prisma.ngoVerification.count({
            where: { status: "PENDING" },
        });
        const ngo = await this.prisma.ngoProfile.aggregate({
            _sum: { followersCount: true },
        });

        const community = await this.prisma.communityProfile.aggregate({
            _sum: { followersCount: true },
        });
        return {
            totalCommunityAndNgo,
            Verified: verified,
            PendingVerification: pending,
            totalFollowers: (ngo._sum.followersCount || 0) + (community._sum.followersCount || 0),
        };
    }
}
