import { EVENT_TYPES } from "@common/interface/events-name";
import { PostEvent } from "@common/interface/events-payload";
import { PrismaService } from "@lib/prisma/prisma.service";
import { FollowService } from "@module/(users)/follow/follow.service";
import {
    BadRequestException,
    ForbiddenException,
    HttpException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CreatePostDto, UpdatePostDto } from "./dto/create.post.dto";
import { PostRepository } from "./posts.repository";

@Injectable()
export class PostService {
    constructor(
        private readonly repository: PostRepository,
        private readonly followService: FollowService,
        private prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async create(input: CreatePostDto) {
        const post = await this.repository.store(input); // call store (DB transaction)
        if (!post) throw new BadRequestException("Fail to create post");

        const authorId = post.authorId;
        const followersRes = await this.followService.getFollowers(authorId);
        const followers = followersRes.data.map((f) => f.followerId);
        const followingRes = await this.followService.getFollowing(authorId);
        const followings = followingRes.data.map((f) => f.followingId);

        const allRelatedUsers = Array.from(new Set([...followers, ...followings]));
        const recipients = await this.prisma.notificationToggle.findMany({
            where: { userId: { in: allRelatedUsers } },
            select: { user: { select: { id: true, email: true } } },
        });

        const payload: PostEvent = {
            action: "CREATE",
            meta: {
                postId: post.id,
                performedBy: authorId,
                publishedAt: post.createdAt ?? new Date(),
            },
            info: {
                title: `New post by ${post.author.profile?.name ?? "someone"}`,
                message: `CREATE NEW POST ${post.text}`,
                authorId,
                recipients: recipients.map((r) => ({ id: r.user.id, email: r.user.email })),
            },
        };

        // 6️⃣ Emit notification
        this.eventEmitter.emit(EVENT_TYPES.POST_CREATE, payload);

        return post;
    }

    /** Fetch posts with selected fields */
    async index(options?: any) {
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
                            name: true,
                        },
                    },
                },
            },
            likes: true,
            shares: true,
            createdAt: false,
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
