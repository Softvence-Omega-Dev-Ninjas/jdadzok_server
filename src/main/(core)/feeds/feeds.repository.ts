import { PrismaService } from "@lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class FeedRepository {
    constructor(private readonly prisma: PrismaService) {}
    /**
     * Get user's feed posts
     */
    async getUserFeed(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        // Get posts from followed users and own posts
        const posts = await this.prisma.post.findMany({
            where: {
                OR: [
                    { authorId: userId },
                    {
                        author: {
                            followers: {
                                some: { followerId: userId },
                            },
                        },
                    },
                ],
                visibility: "PUBLIC",
            },
            include: {
                author: {
                    include: { profile: true },
                },
                community: {
                    include: { profile: true },
                },
                likes: {
                    where: { userId },
                    take: 1,
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                        shares: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        });

        return posts.map((post) => ({
            ...post,
            isLiked: post.likes.length > 0,
            likes: undefined, // Remove the likes array, keep the count
        }));
    }
}
