// src/newsfeed/newsfeed.controller.ts
import { GetUser, ValidateAuth } from "@common/jwt/jwt.decorator";
import { Controller, Get, Query, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FeedQueryDto } from "../dto/feed.dto";
import { NewsFeedService } from "../service/newsfeed.service";
@ApiTags("NewsFeeds-feed")
@Controller("feeds")
export class NewsFeedController {
    constructor(private readonly newsFeedService: NewsFeedService) {}

    @ApiOperation({
        summary: "Infinite-scroll user News-feed",
        description:
            "Returns a page of posts ordered by engagement + interest. Use `cursor` from `meta.nextCursor` for the next page.",
    })
    @ApiBearerAuth()
    @ValidateAuth()
    @Get("user-feeds")
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async getFeed(@GetUser("userId") userId: string, @Query() query: FeedQueryDto) {
        return this.newsFeedService.getUserFeed(userId, query.cursor ?? null, query.take);
    }
}
