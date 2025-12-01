// src/call/controller/call.controller.ts

import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    NotFoundException,
    Param,
    Post,
    UnauthorizedException,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { GetUser, ValidateAuth } from "@common/jwt/jwt.decorator";
import { CallGateway } from "../calling.gateway";
import { StartCallToUserDto } from "../dto/calling.dto";
import { CallService } from "../service/calling.service";

@Controller("calls")
@ApiTags("calls-audio-video")
export class CallController {
    constructor(
        private readonly callService: CallService,
        private readonly callGateway: CallGateway,
    ) {}

    /**
     * Create a new call
     */
    @ValidateAuth()
    @ApiBearerAuth()
    @Post()
    @ApiOperation({ summary: "Create a new call" })
    async createCall(@GetUser("userId") userId: string) {
        if (!userId) {
            throw new UnauthorizedException("User ID is required");
        }

        return await this.callService.createCall(userId);
    }

    @Post("start")
    @ValidateAuth()
    @ApiBearerAuth()
    @ApiOperation({ summary: "Start a 1-on-1 call to another user" })
    async startCallToUser(@GetUser("userId") callerId: string, @Body() dto: StartCallToUserDto) {
        return this.callService.startCallToUser(callerId, dto.recipientUserId, this.callGateway);
    }
    /**
     * Get call details by ID
     */
    @ValidateAuth()
    @ApiBearerAuth()
    @Get(":id")
    @ApiOperation({ summary: "Get call details" })
    async getCall(@Param("id") id: string) {
        const call = await this.callService.getCallById(id);

        if (!call) {
            throw new NotFoundException("Call not found");
        }

        return call;
    }

    /**
     * Get active participants in a call room
     */
    @ValidateAuth()
    @ApiBearerAuth()
    @Get(":id/room")
    @ApiOperation({ summary: "Get active participants in call room" })
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

    /**
     * Get call history for the authenticated user
     */
    @ValidateAuth()
    @ApiBearerAuth()
    @Get("user/history")
    @ApiOperation({ summary: "Get call history" })
    async getCallHistory(@GetUser("userId") userId: string) {
        if (!userId) {
            throw new UnauthorizedException("User ID is required");
        }

        return await this.callService.getCallHistory(userId);
    }

    /**
     * End a call (only host can do this)
     */
    @ValidateAuth()
    @ApiBearerAuth()
    @Delete(":id")
    @ApiOperation({ summary: "End a call" })
    async endCall(@Param("id") id: string, @GetUser("userId") userId: string) {
        if (!userId) {
            throw new UnauthorizedException("User ID is required");
        }

        // Check if call exists and user is authorized
        const call = await this.callService.getCallById(id);

        if (!call) {
            throw new NotFoundException("Call not found");
        }

        if (call.hostUserId !== userId) {
            throw new ForbiddenException("Only the host can end the call");
        }

        await this.callService.deleteCall(id);
    }
}
