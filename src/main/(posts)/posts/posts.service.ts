import { FollowUnfollowRepository } from "@module/(users)/follow-unfollow/follow-unfollow.repository";
import {
    BadRequestException,
    ForbiddenException,
    HttpException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { CreatePostDto, UpdatePostDto } from "./dto/create.post.dto";
import { PostQueryDto } from "./dto/posts.query.dto";
import { PostRepository } from "./posts.repository";
import { PrismaService } from "@lib/prisma/prisma.service";

@Injectable()
export class PostService {
    constructor(
        private readonly repository: PostRepository,
        private readonly followRepository: FollowUnfollowRepository,
        private prisma: PrismaService,
    ) {}

    async create(input: CreatePostDto) {
        const post = await this.repository.store(input);

        if (!post) throw new BadRequestException("Fail to creaete post");
        const followers = await this.followRepository.findManyFollowerId(post?.authorId);
        // send notification to the all followers
        for (const follower of followers) {
            console.info("notificaiton will get: ", follower);
            //   TODO: have to handle on the gateway not on endpoint
            // this.postGetway.emit("post:new", {
            //   data: post,
            //   type: "notification",
            //   from: post.authorId,
            //   to: follower.followerId,
            //   meta: {
            //     message: `${post.author.profile?.name} add a new post`,
            //   },
            // });
        }
        return post;
    }

    async index(options?: PostQueryDto) {
        return await this.repository.findAll(options, {
            id: true,
            mediaUrls: true,
            text: true,
            metadata: true,
            author: {
                select: {
                    id: true,
                    email: true,
                    profile: {
                        select: {
                            avatarUrl: true,
                        },
                    },
                },
            },
            likes: true,
            shares: true,
        });
    }

    async findOne(id: string) {
        const post = await this.repository.findById(id);
        if (!post) {
            throw new NotFoundException("Post not found");
        }
        return post;
    }

    async generateLink(id: string) {
        const post = await this.repository.findById(id, {
            authorId: true,
            ngoId: true,
            communityId: true,
        });
        // generate shareable post link
        return `${process.env.SERVER}/posts/${post.id}?author=${post.authorId}`;
    }

    async update(id: string, updateData: UpdatePostDto, userId: string) {
        this.validateAuthorId(userId);
        const post = await this.repository.findById(id, { authorId: true }, { id });

        // Check if user is authorized to update this post
        if (post.authorId !== userId) {
            throw new ForbiddenException("You are not authorized to update this post");
        }

        return await this.repository.update(id, {
            ...updateData,
            authorId: userId,
        });
    }

    async delete(id: string, userId: string) {
        const post = await this.repository.findById(id, { authorId: true });
        // Check if user is authorized to delete this post
        if (post.authorId !== userId) {
            throw new ForbiddenException("You are not authorized to delete this post");
        }

        return await this.repository.delete(id);
    }

    private validateAuthorId(authorId?: string) {
        if (!authorId) throw new BadRequestException("Author ID is required");
    }

    async get_all_post_of_user(user_id: string) {
        if (!user_id) {
            throw new HttpException("You are unauthorized", 400);
        }
        const res = await this.prisma.post.findMany({
            where: {
                authorId: user_id,
            },
        });
        return res;
    }
}
