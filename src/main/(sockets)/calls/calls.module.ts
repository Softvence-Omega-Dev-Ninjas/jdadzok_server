import { Module } from "@nestjs/common";
import { CallsController } from "./calls.controller";
import { CallsGateway } from "./calls.gateway";
import { CallsService } from "./calls.service";

@Module({
    imports: [],
    controllers: [CallsController],
    providers: [CallsService, CallsGateway],
    exports: [],
})
export class CallsModule {}
