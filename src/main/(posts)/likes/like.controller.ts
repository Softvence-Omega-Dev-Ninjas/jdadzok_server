import { TUser } from "@app/@types";
import { GetUser } from "@app/common/jwt/jwt.decorator";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { CreateLikeDto } from "./dto/creaete.like.dto";
import { LikeService } from "./like.service";

@ApiBearerAuth()
@Controller("likes")
export class LikeController {
    constructor(private readonly likeService: LikeService) {}

    @ApiOperation({ summary: "Like / dislike a post or comment" })
    @Post()
    @UseGuards(JwtAuthGuard)
    async like(@GetUser() user: TUser, @Body() dto: CreateLikeDto) {
        try {
            return await this.likeService.likePost(user.userId, dto);
        } catch (err) {
            return err;
        }
    }

    @ApiOperation({ summary: "Get likes for a post" })
    @Get("post/:id")
    @UseGuards(JwtAuthGuard)
    async getPostLikes(@Param() id: string) {
        return await this.likeService.getPostLikes(id);
    }
}
