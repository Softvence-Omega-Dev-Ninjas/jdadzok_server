import { Module } from "@nestjs/common";
import { CommentModule } from "./comments/comment.module";
import { GifModule } from "./gif/gif.module";
import { LikeModule } from "./likes/likes.module";
import { LocationModule } from "./locations/locations.module";
import { CategoryModule } from "./post-category/category.module";
import { PostMetadataModule } from "./post-metadata/post.metadata.module";
import { PostModule } from "./posts/posts.module";

@Module({
    imports: [
        PostModule,
        CategoryModule,
        PostMetadataModule,
        GifModule,
        LocationModule,
        LikeModule,
        CommentModule,
    ],
    controllers: [],
    providers: [],
    exports: [],
})
export class PostsGroupModule {}
