import { GetUser } from "@common/jwt/jwt.decorator";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { TUser } from "@project/@types";
import { FeedService } from "./feed.service";

@ApiBearerAuth()
@Controller("feeds")
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getFeed(@GetUser() user: TUser) {
    try {
      const posts = await this.feedService.generateUserFeed(user.userId);
      return posts;
    } catch (err) {
      return err;
    }
  }
}
