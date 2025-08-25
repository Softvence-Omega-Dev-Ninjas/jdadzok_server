import { Module } from "@nestjs/common";
import { PostController } from "./posts.controller";
import { PostRepository } from "./posts.repository";
import { PostService } from "./posts.service";

@Module({
    controllers: [PostController],
    providers: [PostRepository, PostService],
    exports: [PostRepository]
})
export class PostModule { }