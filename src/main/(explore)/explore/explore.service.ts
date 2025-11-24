import { Injectable } from "@nestjs/common";
import { PrismaService } from "@lib/prisma/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class ExploreService {
    constructor(private prisma: PrismaService) {}

    private buildSearchFilter(
        search?: string,
    ): Prisma.NgoProfileWhereInput & Prisma.CommunityProfileWhereInput {
        if (!search || search.trim() === "") return {};

        return {
            OR: [
                { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { username: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
            ],
        };
    }

    async exploreTop(search?: string) {
        const searchFilter = this.buildSearchFilter(search);

        const communities = await this.prisma.community.findMany({
            include: { profile: true },
            where: {
                profile: { is: searchFilter },
            },
        });

        const ngos = await this.prisma.ngo.findMany({
            include: { profile: true },
            where: {
                profile: { is: searchFilter },
            },
        });

        const combined = [
            ...communities
                .filter((c) => c.profile)
                .map((c) => ({
                    id: c.id,
                    type: "community",
                    name: c.profile!.name,
                    username: c.profile!.username,
                    title: c.profile!.title,
                    avatarUrl: c.profile!.avatarUrl,
                    followersCount: c.profile!.followersCount,
                    createdAt: c.createdAt,
                })),
            ...ngos
                .filter((n) => n.profile)
                .map((n) => ({
                    id: n.id,
                    type: "ngo",
                    name: n.profile!.name,
                    username: n.profile!.username,
                    title: n.profile!.title,
                    avatarUrl: n.profile!.avatarUrl,
                    followersCount: n.profile!.followersCount,
                    createdAt: n.createdAt,
                })),
        ];

        combined.sort((a, b) => (b.followersCount ?? 0) - (a.followersCount ?? 0));

        return combined;
    }
}
