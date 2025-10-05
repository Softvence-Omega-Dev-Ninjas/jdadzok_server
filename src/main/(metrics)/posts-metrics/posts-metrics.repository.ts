import { PrismaService } from "@lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreatePostsMetricsDto } from "./dto/posts-metrics.dto";

@Injectable()
export class PostsMetricsRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(input: CreatePostsMetricsDto) {
        return await this.prisma.$transaction(async (tx) => {
            const createdPostMetrics = await tx.postMetrics.create({ data: input });
            return createdPostMetrics;
        });
    }

    async get(userId: string) {
        return await this.prisma.postMetrics.findMany({
            where: {
                post: {
                    authorId: userId,
                },
            },
            include: {
                post: true,
            },
        });
    }
}
