import { Module } from "@nestjs/common";
import { ChoicesController } from "./choices.controller";
import { ChoicesRepository } from "./choices.repository";
import { ChoicesService } from "./choices.service";

@Module({
    controllers: [ChoicesController],
    providers: [ChoicesRepository, ChoicesService],
    exports: [ChoicesRepository]
})
export class ChoicesModule { }