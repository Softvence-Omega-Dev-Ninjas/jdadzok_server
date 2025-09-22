import { Module } from "@nestjs/common";
import { CallsController } from "./calls.controller";
import { CallsService } from "./calls.service";
import { CallsGateway } from "./calls.gateway";

@Module({
    imports: [],
    controllers: [ CallsController ],
    providers: [ CallsService, CallsGateway ],
    exports: [],
})

export class CallsModule {}
