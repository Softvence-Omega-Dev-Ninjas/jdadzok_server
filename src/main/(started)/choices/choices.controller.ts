import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import { TUser } from "@project/@types";
import { GetUser } from "@project/common/jwt/jwt.decorator";
import { successResponse } from "@project/common/utils/response.util";
import { JwtAuthGuard } from "../auth/guards/jwt-auth";
import { ChoicesService } from "./choices.service";
import { CreateChoiceDto } from "./dto/choices.create.dto";
import { choicesBodyOptions } from "./example";


@ApiBearerAuth()
@Controller("choices")
export class ChoicesController {
    constructor(private readonly service: ChoicesService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiBody(choicesBodyOptions)
    async store(@GetUser() user: TUser, @Body() body: CreateChoiceDto[]) {
        try {
            const choices = await this.service.create(user.userId, body);
            return successResponse(choices, "User choices accepted")
        } catch (err) {
            return err
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async index() { }
}