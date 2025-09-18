import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { FollowRepository } from "@project/main/(users)/follow/follow.repository";
import { UserProfileRepository } from "@project/main/(users)/user-profile/user.profile.repository";
import { UserRepository } from "@project/main/(users)/users/users.repository";
import { JwtServices } from "@project/services/jwt.service";
import { GifRepository } from "../gif/gif.repository";
import { LocationRepository } from "../locations/locations.repository";
import { PostMetadataRepository } from "../post-metadata/post.metadata.repository";
import { PostTagsRepository } from "../post-tags/post-tags.repository";
import { PostGateway } from "./getway/posts.gateway";
import { PostController } from "./posts.controller";
import { PostRepository } from "./posts.repository";
import { PostService } from "./posts.service";

@Module({
  imports: [],
  controllers: [PostController],
  providers: [
    JwtServices,
    JwtService,
    PostService,
    PostRepository,
    PostTagsRepository,
    LocationRepository,
    GifRepository,
    PostMetadataRepository,
    UserRepository,
    UserProfileRepository,
    FollowRepository,
    PostGateway
  ],
  exports: [PostRepository],
})
export class PostModule { }
