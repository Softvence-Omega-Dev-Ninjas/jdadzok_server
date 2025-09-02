import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { GetUser } from "@project/common/jwt/jwt.decorator";
import { handleRequest } from "@project/common/utils/handle.request.util";
import { JwtAuthGuard } from "@project/main/(started)/auth/guards/jwt-auth";
import { CommunitiesService } from "./communities.service";
import { CreateCommunityDto, UpdateCommunityDto } from "./dto/communities.dto";
import { CommunityQueryDto } from "./dto/community.query";
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("communities")
export class CommunitiesController {
  constructor(private readonly service: CommunitiesService) {}

  @Post("/")
  @ApiOperation({ summary: "Create new community" })
  async createCommunity(
    @GetUser("userId") userId: string,
    @Body() dto: CreateCommunityDto,
  ) {
    return handleRequest(
      () => this.service.createCommunity(userId, dto),
      "Community created successfully",
    );
  }

  // find all data...
  @Get("/")
  @ApiOperation({ summary: "Get All community" })
  async findAll(@Query() query?: CommunityQueryDto) {
    return handleRequest(
      () => this.service.findAll(query),
      "Get All Community",
    );
  }
  //get single community by ID

  @Get(":communityId")
  @ApiOperation({ summary: "Get Community by id" })
  async findOne(@Param("communityId") communityId: string) {
    return handleRequest(
      () => this.service.findOne(communityId),
      "Get Single Community Successfull",
    );
  }

  //    delete community...
  @Delete(":communityId")
  @ApiOperation({ summary: "Delete Community" })
  async deleteCommunity(
    @GetUser("userId") userId: string,
    @Param("communityId") communityId: string,
  ) {
    return handleRequest(
      () => this.service.deleteCommunity(userId, communityId),
      "Community Delete Successfull",
    );
  }
  // update community...
  @Patch(":communityId")
  @ApiOperation({ summary: "Edit Commuity" })
  async updateComunity(
    @GetUser("userId") userId: string,
    @Param("communityId") communityId: string,
    @Body() dto: UpdateCommunityDto,
  ) {
    return handleRequest(
      () => this.service.updateCommunity(userId, communityId, dto),
      "Community Edit Successfull",
    );
  }
}
