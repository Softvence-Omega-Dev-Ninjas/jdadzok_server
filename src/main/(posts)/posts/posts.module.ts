import { Module } from "@nestjs/common";
import { UserRepository } from "@project/main/(users)/users/users.repository";
import { GifRepository } from "../gif/gif.repository";
import { LocationRepository } from "../locations/locations.repository";
import { PostMetadataRepository } from "../post-metadata/post.metadata.repository";
import { PostTagsRepository } from "../post-tags/post-tags.repository";
import { PostController } from "./posts.controller";
import { PostRepository } from "./posts.repository";
import { PostService } from "./posts.service";

@Module({
  imports: [],
  controllers: [PostController],
  providers: [
    PostRepository,
    PostService,
    PostTagsRepository,
    LocationRepository,
    GifRepository,
    PostMetadataRepository,
    UserRepository
  ],
  exports: [PostRepository],
})
export class PostModule { }
