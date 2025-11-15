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

    async getOrganizations({
        search,
        page,
        limit,
    }: {
        search?: string;
        page: number;
        limit: number;
    }) {
        // ---------------- NGO ----------------
        const ngoWhere: any = {};
        if (search) {
            ngoWhere.profile = {
                title: { contains: search, mode: "insensitive" },
            };
        }

        const communityWhere: any = {};
        if (search) {
            communityWhere.profile = {
                title: { contains: search, mode: "insensitive" },
            };
        }

        const ngos = await this.prisma.ngo.findMany({
            where: ngoWhere,
            include: {
                owner: {
                    include: { profile: true },
                },
                profile: true,
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: "desc" },
        });

        const ngoData = ngos.map((ngo) => ({
            type: "NGO",
            id: ngo.id,
            title: ngo.profile?.title,
            ownerId: ngo.ownerId,
            ownerName: ngo.owner.profile?.name,
            followersCount: ngo.profile?.followersCount ?? 0,
            status: ngo.isVerified ? "verified" : "pending",
        }));

        // ---------------- COMMUNITY ----------------
        const communities = await this.prisma.community.findMany({
            where: communityWhere,
            include: {
                owner: {
                    include: { profile: true }, // <-- include profile
                },
                profile: true,
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: "desc" },
        });

        const communityData = communities.map((c) => ({
            type: "COMMUNITY",
            id: c.id,
            title: c.profile?.title,
            ownerId: c.ownerId,
            ownerName: c.owner.profile?.name,
            followersCount: c.profile?.followersCount ?? 0,
        }));

        // ---------------- MERGE ----------------
        const merged = [...ngoData, ...communityData];

        // Total count
        const total = merged.length;

        return {
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            data: merged,
        };
    }
}
