import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { CapLevelService } from "./cap-lavel.service";

@ApiBearerAuth()
@Controller("cap-level")
export class CapLevelController {
    constructor(private readonly service: CapLevelService) { }

    @Post()
    async store(
        @Body() body: any,
    ) {
        try {
        } catch (err) {
            return err;
        }
    }

    @Get()
    async index() {
        try {
        } catch (err) {
            return err;
        }
    }
}
