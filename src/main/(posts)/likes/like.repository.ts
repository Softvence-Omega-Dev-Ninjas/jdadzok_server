import { Injectable } from "@nestjs/common";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { CreateLikeDto } from "./dto/creaete.like.dto";

@Injectable()
export class LikeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createLike(data: CreateLikeDto) {
    return this.prisma.like.create({
      data: {
        ...data,
        userId: data.userId!,
      },
    });
  }

  async removeLike(userId: string, postId?: string, commentId?: string) {
    return await this.prisma.like.deleteMany({
      where: {
        userId,
        postId,
        commentId,
      },
    });
  }

  async getLikesForPost(postId: string) {
    return this.prisma.like.findMany({
      where: { postId },
    });
  }
}
