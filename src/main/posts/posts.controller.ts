import { Body, Controller, Get, Post, Query, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "@project/common/pipes/zod-validation.pipe";
import { successResponse } from "@project/common/utils/response.util";
import { CreatePostDto, createPostSchema } from "./dto/post.dto";
import { PostQueryDataTransferObject } from "./dto/query.dto";
import { PostService } from "./posts.service";

@Controller("posts")
export class PostController {
    constructor(private readonly service: PostService) {
    }

    @Post()
    @UsePipes(new ZodValidationPipe(createPostSchema))
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
    // @UsePipes(new ValidationPipe({ transform: true }))
    async index(@Query() query?: PostQueryDataTransferObject) {
        console.log('row data', query)

        try {
            // const posts = await this.service.index(obj);
            return "hello"
        } catch (err) {
            console.log('error', err)
            return err
        }
    }
}