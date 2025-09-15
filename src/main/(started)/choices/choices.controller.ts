import {
  GetUser,
  GetVerifiedUser,
  MakePublic,
} from "@common/jwt/jwt.decorator";
import { successResponse } from "@common/utils/response.util";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation } from "@nestjs/swagger";
import { TUser } from "@project/@types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth";
import { ChoicesService } from "./choices.service";
import { CreateChoiceDto } from "./dto/choices.create.dto";
import { choicesBodyOptions } from "./example";

@Controller("choices")
export class ChoicesController {
  constructor(private readonly choicesService: ChoicesService) {}

  @ApiBearerAuth()
  @ApiBody(choicesBodyOptions)
  @Post()
  @UseGuards(JwtAuthGuard)
  async assignChoices(@GetUser() user: TUser, @Body() dtos: CreateChoiceDto[]) {
    try {
      const choice = await this.choicesService.assignChoices(user.userId, dtos);
      return successResponse(choice, "Your choice accepted");
    } catch (err) {
      return err;
    }
  }

  @ApiBearerAuth()
  @Get("/user-choices")
  @UseGuards(JwtAuthGuard)
  async getUserChoices(@GetVerifiedUser() user: TUser) {
    try {
      return this.choicesService.getUserChoices(user.userId);
    } catch (err) {
      return err;
    }
  }

  @ApiBearerAuth()
  @Delete(":slug")
  @UseGuards(JwtAuthGuard)
  async removeChoice(@GetUser() user: TUser, @Param("slug") slug: string) {
    try {
      await this.choicesService.removeChoice(user.userId, slug);
      return "Choice delete success";
    } catch (err) {
      return err;
    }
  }

  @ApiOperation({ summary: "Get all choices for user selection" })
  @MakePublic()
  @Get("all")
  async getAll() {
    try {
      return await this.choicesService.findMany();
    } catch (err) {
      return err;
    }
  }
}
