import { Module } from "@nestjs/common";
import { CallsService } from "./calls.service";
import { CallsGateway } from "./calls.gateway";

@Module({
  imports: [],
  controllers: [],
  providers: [CallsService, CallsGateway],
  exports: [],
})
export class CallsModule {}
