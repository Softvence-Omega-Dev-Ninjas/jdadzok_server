import { PrismaService } from "@lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreateCommentDto } from "./dto/create.comment.dto";
import { successResponse } from "@common/utils/response.util";

@Injectable()
export class CommentRepository {
    constructor(private readonly prisma: PrismaService) {}

    // fix comment
    async createComment(data: CreateCommentDto) {
        return await this.prisma.$transaction(async (tx) => {
            const comment = await tx.comment.create({
                data: {
                    ...data,
                    postId: data.postId!,
                    authorId: data.authorId!,
                },
            });

            // Update PostMetrics totalComments
            await tx.postMetrics.upsert({
                where: { postId: data.postId! },
                create: {
                    postId: data.postId!,
                    totalComments: 1,
                },
                update: {
                    totalComments: { increment: 1 },
                    lastUpdated: new Date(),
                },
            });

            // Update UserMetrics (increase total comments for the user)
            await tx.userMetrics.upsert({
                where: { userId: data.authorId! },
                create: {
                    userId: data.authorId!,
                    totalComments: 1,
                },
                update: {
                    totalComments: { increment: 1 },
                    lastUpdated: new Date(),
                },
            });

            return successResponse(comment, "Comment created");
        });
    }

    async getCommentsForPost(postId: string) {
        return await this.prisma.comment.findMany({
            where: {
                postId,
                parentCommentId: null,
            },
            include: {
                author: true,
                replies: {
                    include: { author: true },
                },
                likes: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }

    async deleteComment(commentId: string) {
        return await this.prisma.comment.delete({
            where: { id: commentId },
        });
    }
}
