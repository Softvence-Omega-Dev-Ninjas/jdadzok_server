import { TUser } from "@app/@types";
import { GetUser } from "@common/jwt/jwt.decorator";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import { Controller, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { FeedService } from "./feed.service";

@ApiBearerAuth()
@Controller("feeds")
export class FeedController {
    constructor(private readonly feedService: FeedService) {}

    @UseGuards(JwtAuthGuard)
    async getFeed(@GetUser() user: TUser) {
        console.info(user.userId);
        try {
            const posts = await this.feedService.generateUserFeed();
            return posts;
        } catch (err) {
            return err;
        }
    }
}
