import { Module } from "@nestjs/common";
import { GifModule } from "./gif/gif.module";
import { LocationModule } from "./locations/locations.module";
import { PostMetadataModule } from "./post-metadata/post.metadata.module";
import { PostModule } from "./posts/posts.module";

@Module({
  imports: [PostModule, PostMetadataModule, GifModule, LocationModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class PostsGroupModule {}
