import { Module } from "@nestjs/common";
import { CommentController } from "@project/main/(posts)/comments/comment.controller";
import { CommunitiesService } from "./communities.service";

@Module({
  imports: [],
  controllers: [CommentController],
  providers: [CommunitiesService],
  exports: [],
})
export class CommunityModule { }
