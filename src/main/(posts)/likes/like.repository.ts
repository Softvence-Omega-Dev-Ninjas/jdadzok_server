import { successResponse } from "@app/common/utils/response.util";
import { PrismaService } from "@app/lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreateLikeDto } from "./dto/creaete.like.dto";

@Injectable()
export class LikeRepository {
    constructor(private readonly prisma: PrismaService) {}

    async alreadyLiked(userId: string, postId?: string, commentId?: string) {
        return await this.prisma.like.findFirst({
            where: {
                userId,
                postId,
                commentId,
            },
        });
    }
    async like(data: CreateLikeDto) {
        const like = await this.prisma.like.create({
            data: {
                ...data,
                userId: data.userId!,
            },
        });

        return successResponse(like, data.commentId ? "Comment liked" : "Post liked");
    }

    async removeLike(userId: string, postId: string, commentId?: string) {
        const like = await this.prisma.like.deleteMany({
            where: {
                userId,
                postId,
                commentId,
            },
        });
        return successResponse(like, commentId ? "Comment dislikes" : "Post dislike");
    }

    async getLikesForPost(postId: string) {
        return this.prisma.like.findMany({
            where: { postId },
        });
    }
}
