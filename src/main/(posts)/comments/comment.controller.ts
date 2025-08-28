import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { TUser } from "@project/@types";
import { GetUser } from "@project/common/jwt/jwt.decorator";
import { CommentService } from "./comment.service";
import { CreateCommentDto } from "./dto/create.comment.dto";

@ApiBearerAuth()
@ApiTags("comments")
@Controller("comments")
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiOperation({ summary: "Create a comment" })
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@GetUser() user: TUser, @Body() dto: CreateCommentDto) {
    try {
      return await this.commentService.createComment({
        ...dto,
        authorId: user.userId,
      });
    } catch (err) {
      return err;
    }
  }

  @ApiOperation({ summary: "Get comments for a post" })
  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async getComments(@Param("id", ParseUUIDPipe) id: string) {
    try {
      return this.commentService.getCommentsForPost(id);
    } catch (err) {
      return err;
    }
  }

  @ApiOperation({ summary: "Delete a comment" })
  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async delete(@Param("id", ParseUUIDPipe) id: string) {
    try {
      return this.commentService.deleteComment(id);
    } catch (err) {
      return err;
    }
  }
}
