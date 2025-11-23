import { Controller, Post, Body, Get, Patch, UseGuards } from "@nestjs/common";
import { FriendRequestService } from "./friend-request.service";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { handleRequest } from "@common/utils/handle.request.util";
import { FriendRequestAction, RespondRequestDto, SendRequestDto } from "./dto/friend-request.dto";
import { GetVerifiedUser } from "@common/jwt/jwt.decorator";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import { VerifiedUser } from "@type/shared.types";

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags("Friend Request")
@Controller("friend-request")
export class FriendRequestController {
    constructor(private service: FriendRequestService) {}

    // ➤ Send friend request
    @Post("/")
    @ApiOperation({ summary: "Send friend request" })
    async send(@Body() dto: SendRequestDto, @GetVerifiedUser() user: VerifiedUser) {
        return handleRequest(
            () => this.service.sendRequest(user.id, dto.receiverId),
            "Friend request sent successfully",
        );
    }

    @Patch("/")
    @ApiOperation({ summary: "Accept or reject friend request" })
    async respond(@Body() dto: RespondRequestDto, @GetVerifiedUser() user: VerifiedUser) {
        return handleRequest(
            () => this.service.respondRequest(dto.requestId, user.id, dto.action),
            dto.action === FriendRequestAction.ACCEPT
                ? "Friend request accepted"
                : "Friend request rejected",
        );
    }

    @Get("/pending")
    @ApiOperation({ summary: "Get pending friend requests" })
    async pending(@GetVerifiedUser() user: VerifiedUser) {
        return handleRequest(
            () => this.service.getPendingRequests(user.id),
            "Pending friend requests loaded",
        );
    }
}
