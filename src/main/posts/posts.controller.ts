import { Body, Controller, Get, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "@project/common/pipes/zod-validation.pipe";
import { CreatePostDto, createPostSchema } from './dto/post.create';

@Controller("posts")
export class PostController {
    constructor() {
    }

    @Post()
    @UsePipes(new ZodValidationPipe(createPostSchema))
    async store(@Body() body: CreatePostDto) {
        return body
    }

    @Get()
    async index() { }
}