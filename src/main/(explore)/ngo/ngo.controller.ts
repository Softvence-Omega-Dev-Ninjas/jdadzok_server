import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { NgoService } from "./ngo.service";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "@project/main/(started)/auth/guards/jwt-auth";
import { GetUser } from "@project/common/jwt/jwt.decorator";
import { CreateNgoDto, UpdateNgoDto } from "./dto/ngo.dto";
import { handleRequest } from "@project/common/utils/handle.request.util";

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("ngos")
export class NgoController {
  constructor(private readonly service: NgoService) {}
  // create new ngo.....
  @Post("/")
  @ApiOperation({ summary: "Create new ngo" })
  async createCommunity(
    @GetUser("userId") userId: string,
    @Body() dto: CreateNgoDto,
  ) {
    return handleRequest(
      () => this.service.createNgo(userId, dto),
      "Ngo created successfully",
    );
  }

  // find all ngo...
  @Get("")
  @ApiOperation({ summary: "Get All community" })
  async findAll() {
    return handleRequest(() => this.service.findAll(), "Get All Ngo");
  }

  //    delete Ngo...
  @Delete(":ngoId")
  @ApiOperation({ summary: "Delete Ngo" })
  async deleteCommunity(
    @GetUser("userId") userId: string,
    @Param("ngoId") communityId: string,
  ) {
    return handleRequest(
      () => this.service.deleteNgo(userId, communityId),
      "Ngo Delete Successfull",
    );
  }

  // update community...
  @Patch(":ngoId")
  @ApiOperation({ summary: "Edit Ngo" })
  async updateComunity(
    @GetUser("userId") userId: string,
    @Param("ngoId") communityId: string,
    @Body() dto: UpdateNgoDto,
  ) {
    return handleRequest(
      () => this.service.updateNgo(userId, communityId, dto),
      "Ngo Edit Successfull",
    );
  }

  // find one ngo
  @Get(":ngoId")
  @ApiOperation({ summary: "Get Ngo by id" })
  async findOne(@Param("ngoId") ngoId: string) {
    return handleRequest(
      () => this.service.findOne(ngoId),
      "Get Single Ngo Successfull",
    );
  }
}
