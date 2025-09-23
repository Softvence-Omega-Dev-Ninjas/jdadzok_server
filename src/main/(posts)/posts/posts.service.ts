import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { FollowRepository } from "@project/main/(users)/follow/follow.repository";
import { CreatePostDto, UpdatePostDto } from "./dto/create.post.dto";
import { PostQueryDto } from "./dto/posts.query.dto";
import { PostRepository } from "./posts.repository";

@Injectable()
export class PostService {
  constructor(
    private readonly repository: PostRepository,
    private readonly followRepository: FollowRepository,
  ) {}

  async create(input: CreatePostDto) {
    const post = await this.repository.store(input);
    if (!post) throw new BadRequestException("Fail to creaete post");

    const followers = await this.followRepository.findManyFollowerId(
      post?.authorId,
    );
    console.info(followers);

    return post;
    // send notification to the all followers
    // for (const follower of followers) {
    //   // TODO: have to handle on the gateway not on endpoint
    //   //   this.postGetway.emit("post:new", {
    //   //     data: post,
    //   //     type: "notification",
    //   //     from: post.authorId,
    //   //     to: follower.followerId,
    //   //     meta: {
    //   //       message: `${post.author.profile?.name} add a new post`,
    //   //     },
    //   //   });
    // }
  }

  async index(options?: PostQueryDto) {
    return await this.repository.findAll(options);
  }

  async findOne(id: string) {
    const post = await this.repository.findById(id);
    if (!post) {
      throw new NotFoundException("Post not found");
    }
    return post;
  }

  async update(id: string, updateData: UpdatePostDto, userId: string) {
    this.validateAuthorId(userId);
    const post = await this.findOne(id);

    // Check if user is authorized to update this post
    if (post.authorId !== userId) {
      throw new ForbiddenException(
        "You are not authorized to update this post",
      );
    }

    return await this.repository.update(id, {
      ...updateData,
      authorId: userId,
    });
  }

  async delete(id: string, userId: string) {
    const post = await this.findOne(id);

    // Check if user is authorized to delete this post
    if (post.authorId !== userId) {
      throw new ForbiddenException(
        "You are not authorized to delete this post",
      );
    }

    return await this.repository.delete(id);
  }

  private validateAuthorId(authorId?: string) {
    if (!authorId) throw new BadRequestException("Author ID is required");
  }
}
