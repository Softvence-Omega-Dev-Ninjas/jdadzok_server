import { Module } from "@nestjs/common";
import { CallsService } from "./calls.service";
import { CallsGateway } from "./calls.gateway";

@Module({
<<<<<<< HEAD
  imports: [],
  controllers: [],
  providers: [CallsService, CallsGateway],
  exports: [],
=======
    imports: [],
    controllers: [CallsController],
    providers: [CallsService, CallsGateway],
    exports: [],
>>>>>>> sabbir
})
export class CallsModule {}
