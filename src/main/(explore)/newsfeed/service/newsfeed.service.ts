import { PrismaService } from "@lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class NewsFeedService {
    constructor(private readonly prisma: PrismaService) {}

    // -----------show post with top level ---
    async generateUserFeed(userId: string) {
        //-----------------  Get user's selected choices/interests-----------------
        const userChoices = await this.prisma.userChoice.findMany({
            where: { userId },
            include: { choice: true },
        });
        const choiceSlugs = userChoices.map((uc) => uc.choice.slug);

        //------------------- Fetch posts with engagement data ------------------
        const posts = await this.prisma.post.findMany({
            where: { visibility: "PUBLIC" },
            include: {
                author: true,
                category: true,
                likes: true,
                shares: true,
                comments: true,
            },
            orderBy: { createdAt: "desc" },
            take: 100,
        });

        //----------------  Score each post based on engagement + interest------------------
        const scoredPosts = posts.map((post) => {
            let score = 0;

            // ------------------ Engagement scoring -------------------
            const likesCount = post.likes.length;
            const sharesCount = post.shares.length;
            const commentsCount = post.comments.length;
            score += likesCount * 0.5 + sharesCount * 1 + commentsCount * 0.3;

            // ------------------------Interest match bonus
            if (post.category && choiceSlugs.includes(post.category.slug)) {
                score += 10;
            }

            // ---------------(last 24h) post here-------------
            const hoursSincePost = (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60);
            if (hoursSincePost < 24) score += 5;

            return { post, score };
        });

        // ----------------Sort posts by score -------------
        scoredPosts.sort((a, b) => b.score - a.score);

        // ----------------Return only posts-----------------------
        return scoredPosts.map((sp) => sp.post);
    }
}
