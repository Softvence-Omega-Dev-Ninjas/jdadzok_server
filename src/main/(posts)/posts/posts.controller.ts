import { GetUser } from "@common/jwt/jwt.decorator";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { TUser } from "@project/@types";
import { successResponse } from "@project/common/utils/response.util";
import { CreatePostDto } from "./dto/post.dto";
import { PostQueryDto } from "./dto/posts.query.dto";
import { PostService } from "./posts.service";

@Controller("posts")
export class PostController {
  constructor(private readonly service: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async store(@GetUser() user: TUser, @Body() body: CreatePostDto) {
    try {
      const post = await this.service.create({
        ...body,
        author_id: user.userId,
      });
      return successResponse(post, "Post created successfully");
    } catch (err) {
      return err;
    }
  }
  @Get()
  async index(@Query() query?: PostQueryDto) {
    try {
      const posts = await this.service.index(query);
      return posts;
    } catch (err) {
      return err;
    }
  }
}
