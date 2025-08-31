import { GetUser } from "@common/jwt/jwt.decorator";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import { TUser } from "@project/@types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth";
import { ChoicesService } from "./choices.service";
import { CreateChoiceDto } from "./dto/choices.create.dto";
import { choicesBodyOptions } from "./example";

@ApiBearerAuth()
@Controller("choices")
export class ChoicesController {
  constructor(private readonly choicesService: ChoicesService) {}

  @ApiBody(choicesBodyOptions)
  @Post()
  @UseGuards(JwtAuthGuard)
  async assignChoices(@GetUser() user: TUser, @Body() dtos: CreateChoiceDto[]) {
    try {
      return this.choicesService.assignChoices(user.userId, dtos);
    } catch (err) {
      return err;
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserChoices(@GetUser() user: TUser) {
    try {
      return this.choicesService.getUserChoices(user.userId);
    } catch (err) {
      return err;
    }
  }

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
}
