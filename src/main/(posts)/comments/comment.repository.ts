import { PrismaService } from "@app/lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreateCommentDto } from "./dto/create.comment.dto";

@Injectable()
export class CommentRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createComment(data: CreateCommentDto) {
        return await this.prisma.comment.create({
            data: {
                ...data,
                postId: data.postId!,
                authorId: data.authorId!,
            },
        });
    }

    async getCommentsForPost(postId: string) {
        return await this.prisma.comment.findMany({
            where: { postId },
            include: { author: true, replies: true, likes: true },
        });
    }

    async deleteComment(commentId: string) {
        return await this.prisma.comment.delete({
            where: { id: commentId },
        });
    }
}
