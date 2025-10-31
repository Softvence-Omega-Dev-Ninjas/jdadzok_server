import { GetUser, ValidateAll, ValidateAuth } from "@common/jwt/jwt.decorator";
import { Controller } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { NewsFeedService } from "../service/newsfeed.service";

@ApiBearerAuth()
@ApiTags("NewsFeeds")
@Controller("feeds")
export class NewsFeedController {
    constructor(private readonly newsFeedService: NewsFeedService) {}
    @ValidateAll()
    @ValidateAuth()
    async generateUserFeed(@GetUser("userId") userId: string) {
        return await this.newsFeedService.generateUserFeed(userId);
    }
}
