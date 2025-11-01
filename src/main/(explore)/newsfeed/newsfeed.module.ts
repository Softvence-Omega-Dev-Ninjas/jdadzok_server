import { Module } from "@nestjs/common";
import { NewsFeedController } from "./controller/newsfeed.controller";
import { NewsFeedService } from "./service/newsfeed.service";

@Module({
    imports: [],
    controllers: [NewsFeedController],
    providers: [NewsFeedService],
    exports: [],
})
export class NewsFeedModule {}
