import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { successResponse } from "@project/common/utils/response.util";
import { CreatePostDto } from "./dto/post.dto";
import { PostQueryDto } from "./dto/posts.query.dto";
import { PostService } from "./posts.service";

@Controller("posts")
export class PostController {
    constructor(private readonly service: PostService) {
    }

    @Post()
    async store(
        // @GetUser("user_id") userId: string,
        @Body() body: CreatePostDto) {

        const uid = "3543c671-a22e-415d-9a0e-2c1c51a27d32";
        try {
            const post = await this.service.create({ ...body, author_id: uid });
            return successResponse(post, "Post created successfully")
        } catch (err) {
            return err
        }
    }
    @Get()
    async index(@Query() query?: PostQueryDto) {
        console.log("merged query", query);

        try {
            const posts = await this.service.index(query)
            return posts
        } catch (err) {
            console.log('error', err)
            return err
        }
    }
}