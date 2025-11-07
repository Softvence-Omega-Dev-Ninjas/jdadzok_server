import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import {
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Request,
    UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthenticatedRequest } from "@type/apiResponse";
import { CallService } from "../service/calling.service";

@Controller("calls")
@ApiTags("calls-audio-video")
@UseGuards(JwtAuthGuard)
export class CallController {
    constructor(private readonly callService: CallService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createCall(@Request() req: AuthenticatedRequest) {
        const userId = req.user.userId;
        return await this.callService.createCall(userId);
    }

    @Get(":id")
    async getCall(@Param("id") id: string) {
        return await this.callService.getCallById(id);
    }

    @Get(":id/room")
    async getCallRoom(@Param("id") id: string) {
        const room = await this.callService.getCallRoom(id);

        if (!room) {
            return {
                callId: id,
                participants: [],
                active: false,
            };
        }

        return {
            callId: room.callId,
            participants: room.participants.map((p) => ({
                socketId: p.socketId,
                userName: p.userName,
                hasVideo: p.hasVideo,
                hasAudio: p.hasAudio,
                joinedAt: p.joinedAt,
            })),
            active: true,
            participantCount: room.participants.length,
        };
    }

    @Get("user/:userId/history")
    async getCallHistory(@Param("userId") userId: string, @Request() req: AuthenticatedRequest) {
        // Ensure user can only access their own history
        if (req.user.userId !== userId) {
            throw new Error("Unauthorized");
        }

        return await this.callService.getCallHistory(userId);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async endCall(@Param("id") id: string) {
        // Add authorization check here
        await this.callService.deleteCall(id);
    }
}
