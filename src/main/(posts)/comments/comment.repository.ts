import { PrismaService } from "@lib/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateCommentDto } from "./dto/create.comment.dto";

@Injectable()
export class CommentRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createComment(data: CreateCommentDto) {

        // find post for get post owner
        const post=await this.prisma.post.findUnique({
            where:{id:data.postId}
        })

        const adminScore=await this.prisma.activityScore.findFirst()
        const res= await this.prisma.comment.create({
            data: {
                ...data,
                postId: data.postId!,
                authorId: data.authorId!,
            },
        });

        const userMatrix=await this.prisma.userMetrics.findFirst({
            where:{
                userId:post?.authorId
            }
        })

        if(userMatrix){
            await this.prisma.userMetrics.update({
                where:{
                    userId:post?.authorId
                },
                data:{
                    activityScore:{increment:adminScore?.comment}
                }
            })
        }
        return res
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
