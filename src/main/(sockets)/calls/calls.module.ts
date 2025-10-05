import { Module } from "@nestjs/common";
import { CallsGateway } from "./calls.gateway";
import { CallsService } from "./calls.service";

@Module({
    imports: [],
    controllers: [],
    providers: [CallsService, CallsGateway],
    exports: [],
})
export class CallsModule { }
