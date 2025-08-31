import { Body, Controller, Post } from "@nestjs/common";
import { GetUser } from "@project/common/jwt/jwt.decorator";
import { handleRequest } from "@project/common/utils/handle.request.util";
import { CommunitiesService } from "./communities.service";
import { CreateCommunityDto } from "./dto/communities.dto";

@Controller("communities")
export class CommunitiesController {
    constructor(private readonly service: CommunitiesService) { }

    @Post()
    async createCommunity(@GetUser("userId") userId: string, @Body() dto: CreateCommunityDto) {
        return handleRequest(
            () => this.service.createCommunity(userId, dto),
            "Community created successfully",
        );
    }

}