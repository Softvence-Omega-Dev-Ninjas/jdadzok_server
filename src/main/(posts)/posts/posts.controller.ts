import { GetUser, GetVerifiedUser } from "@common/jwt/jwt.decorator";
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
  UsePipes,
  ValidationPipe,
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
  @ApiOperation({ summary: "Create a new post" })
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  async store(@GetVerifiedUser() user: TUser, @Body() body: CreatePostDto) {
    try {
      const post = await this.service.create({
        ...body,
        authorId: user.userId,
      });
      return successResponse(post, "Post created successfully");
    } catch (err) {
      return err;
    }
  }

  @Get()
  @ApiOperation({ summary: "Get all posts" })
  @UsePipes(PostQueryDto)
  async index(@Query() query: PostQueryDto) {
    const posts = await this.service.index(query);
    return posts;
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Update a post" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @GetUser() user: TUser,
    @Body() body: UpdatePostDto,
  ) {
    try {
      const updatedPost = await this.service.update(id, body, user.userId);
      return successResponse(updatedPost, "Post updated successfully");
    } catch (err) {
      return err;
    }
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
