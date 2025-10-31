// src/newsfeed/newsfeed.service.ts
import { PrismaService } from "@lib/prisma/prisma.service";
import { BadRequestException, Injectable } from "@nestjs/common";

export type FeedResponse = {
    data: any[];
    meta: {
        hasNextPage: boolean;
        nextCursor: string | null;
    };
};

@Injectable()
export class NewsFeedService {
    private readonly PAGE_SIZE = 20;

    constructor(private readonly prisma: PrismaService) {}

    async getUserFeed(
        userId: string,
        cursor?: string | null,
        take?: number,
    ): Promise<FeedResponse> {
        const pageSize = take ?? this.PAGE_SIZE;

        // ------------------ Get user interests-------------------
        const userChoices = await this.prisma.userChoice.findMany({
            where: { userId },
            select: { choice: { select: { slug: true } } },
        });
        const interestSlugs = userChoices.map((uc) => uc.choice.slug);

        // ------- Parse cursor--------------
        let cursorDate: Date | undefined;
        if (cursor) {
            cursorDate = new Date(cursor);
            if (isNaN(cursorDate.getTime())) {
                throw new BadRequestException("Invalid cursor");
            }
        }

        // ----------- Fetch PAGE_SIZE + 1 posts----------
        const rawPosts = await this.prisma.post.findMany({
            where: {
                visibility: "PUBLIC",
                ...(cursorDate && {
                    createdAt: { lt: cursorDate },
                }),
            },
            select: {
                id: true,
                createdAt: true,
                text: true,
                mediaUrls: true,
                mediaType: true,
                author: true,
                category: true,
                metrics: true,
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                        shares: true,
                    },
                },
            },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            take: pageSize + 1,
        });

        // ------------------------ Score----------------------
        const scored = rawPosts.map((post) => {
            const likes = post.metrics?.totalLikes ?? post._count.likes;
            const comments = post.metrics?.totalComments ?? post._count.comments;
            const shares = post.metrics?.totalShares ?? post._count.shares;

            let score = likes * 0.5 + shares * 1 + comments * 0.3;

            if (post.category?.slug && interestSlugs.includes(post.category.slug)) {
                score += 10;
            }

            const hoursOld = (Date.now() - post.createdAt.getTime()) / 36e5;
            if (hoursOld < 24) score += 5;

            return { post, score };
        });

        // ------------------  Sort in memory---------------
        scored.sort(
            (a, b) => b.score - a.score || b.post.createdAt.getTime() - a.post.createdAt.getTime(),
        );

        // -----------------Slice----------------
        const hasMore = scored.length > pageSize;
        const page = hasMore ? scored.slice(0, pageSize) : scored;

        // -------------- Next cursor-----------------------
        const lastPost = page[page.length - 1]?.post;
        const nextCursor = lastPost ? lastPost.createdAt.toISOString() : null;

        return {
            data: page.map((p) => p.post),
            meta: {
                hasNextPage: hasMore,
                nextCursor,
            },
        };
    }
}
