import { Module } from "@nestjs/common";
import { PostMetadataModule } from "./post-metadata/post.metadata.module";
import { PostModule } from "./posts/posts.module";

@Module({
    imports: [PostModule, PostMetadataModule],
    controllers: [],
    providers: [],
    exports: []
})
export class PostsGroupModule { }