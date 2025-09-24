import { Body, Controller, Post, Req } from "@nestjs/common";
import { CallsService } from "./calls.service";
import { CreateCallDto } from "./dto/create-calls.dto";

@Controller("calls")
export class CallsController {
    constructor(private serv: CallsService) {}

    @Post()
    async create(@Req() req: any, @Body() dto: CreateCallDto) {
        return this.serv.createCall(req.user.id, dto.type, dto.to);
    }
}
