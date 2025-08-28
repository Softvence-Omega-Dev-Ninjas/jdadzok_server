import { Injectable } from "@nestjs/common";
import { CreateLikeDto } from "./dto/creaete.like.dto";
import { LikeRepository } from "./like.repository";

@Injectable()
export class LikeService {
  constructor(private readonly likeRepository: LikeRepository) {}

  async likePost(dto: CreateLikeDto) {
    return await this.likeRepository.createLike(dto);
  }

  async unlikePost(userId: string, postId?: string, commentId?: string) {
    return await this.likeRepository.removeLike(userId, postId, commentId);
  }

  async getPostLikes(postId: string) {
    return await this.likeRepository.getLikesForPost(postId);
  }
}
