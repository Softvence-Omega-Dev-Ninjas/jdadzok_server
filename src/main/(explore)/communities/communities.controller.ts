import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { GetUser } from "@project/common/jwt/jwt.decorator";
import { handleRequest } from "@project/common/utils/handle.request.util";
import { JwtAuthGuard } from "@project/main/(started)/auth/guards/jwt-auth";
import { CommunitiesService } from "./communities.service";
import { CreateCommunityDto } from "./dto/communities.dto";
import { CommunityQueryDto } from "./dto/community.query";
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("communities")
export class CommunitiesController {
    constructor(private readonly service: CommunitiesService) { }

    @Post('/')
    @ApiOperation({ summary: "Create new community" })
    async createCommunity(@GetUser("userId") userId: string, @Body() dto: CreateCommunityDto) {
        return handleRequest(
            () => this.service.createCommunity(userId, dto),
            "Community created successfully"
        );
    }

    // find all data....
    @Get('')
    @ApiOperation({ summary: "Get All community" })
    async findAll(@Query() query?: CommunityQueryDto) {
        return handleRequest(() => this.service.findAll(query), "Get All Community")
    }


    @Delete(':communityId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Delete Community" })
    async deleteCommunity(@GetUser("userId") userId: string, @Param('communityId') communityId: string) {
        return handleRequest(() => this.service.deleteCommunity(userId, communityId), "Community Delete Successfull")
    }


}