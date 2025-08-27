import { GetUser } from "@common/jwt/jwt.decorator";
import { successResponse } from "@common/utils/response.util";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import { Body, Controller, Delete, Get, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { TUser } from "@project/@types";
import { CreatePostDto } from "./dto/create.post.dto";
import { PostQueryDto } from "./dto/posts.query.dto";
import { PostService } from "./posts.service";

@ApiBearerAuth()
@Controller("posts")
export class PostController {
  constructor(private readonly service: PostService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  async store(@GetUser() user: TUser, @Body() body: CreatePostDto) {
    console.log(user)
    console.log(body)

    try {
      const post = await this.service.create({
        ...body,
        authorId: user.userId,
      });
      return successResponse(post, "Post created successfully");
    } catch (err) {
      console.log(err)
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

  @Put()
  async update() { }

  @Delete()
  async delete() { }
}
