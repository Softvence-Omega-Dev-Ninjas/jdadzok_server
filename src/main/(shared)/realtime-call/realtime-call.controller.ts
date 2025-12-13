import { Controller, Get, Param } from "@nestjs/common";
import { RealTimeCallService } from "./realtime-call.service";

@Controller("realtime-call")
export class RealTimeCallController {
    constructor(private readonly callService: RealTimeCallService) {}

    // ✅ Check from Postman
    @Get(":callId/status")
    async getCallStatus(@Param("callId") callId: string) {
        return this.callService.getCallStatus(callId);
    }
}
