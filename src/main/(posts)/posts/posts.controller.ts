import { GetUser } from "@common/jwt/jwt.decorator";
import { successResponse } from "@common/utils/response.util";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { TUser } from "@project/@types";
import { CreatePostDto, UpdatePostDto } from "./dto/create.post.dto";
import { PostQueryDto } from "./dto/posts.query.dto";
import { PostService } from "./posts.service";

@ApiBearerAuth()
@Controller("posts")
export class PostController {
  constructor(private readonly service: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Create a new post" })
  async store(@GetUser() user: TUser, @Body() body: CreatePostDto) {
    const post = await this.service.create({
      ...body,
      authorId: user.userId,
    });
    return successResponse(post, "Post created successfully");
  }

  @Get()
  @ApiOperation({ summary: "Get all posts" })
  async index(@Query() query?: PostQueryDto) {
    const posts = await this.service.index(query);
    return successResponse(posts, "Posts retrieved successfully");
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Update a post" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @GetUser() user: TUser,
    @Body() body: UpdatePostDto,
  ) {
    const updatedPost = await this.service.update(id, body, user.userId);
    return successResponse(updatedPost, "Post updated successfully");
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Delete a post" })
  async delete(@Param("id", ParseUUIDPipe) id: string, @GetUser() user: TUser) {
    await this.service.delete(id, user.userId);
    return successResponse(null, "Post deleted successfully");
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single post by ID" })
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    const post = await this.service.findOne(id);
    return successResponse(post, "Post retrieved successfully");
  }
}
