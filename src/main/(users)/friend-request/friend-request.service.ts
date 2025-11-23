import { PrismaService } from "@lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { FriendRequestAction } from "./dto/friend-request.dto";

@Injectable()
export class FriendRequestService {
    constructor(private prisma: PrismaService) {}

    async sendRequest(senderId: string, receiverId: string) {
        if (senderId === receiverId) throw new Error("You cannot send request to yourself");

        return this.prisma.friendRequest.create({
            data: { senderId, receiverId },
        });
    }

    async respondRequest(requestId: string, userId: string, action: FriendRequestAction) {
        // check if request exists and belongs to the receiver
        const request = await this.prisma.friendRequest.findUnique({
            where: { id: requestId },
        });

        if (!request) throw new Error("Friend request not found");
        if (request.receiverId !== userId)
            throw new Error("You are not allowed to respond to this request");

        const status = action === FriendRequestAction.ACCEPT ? "ACCEPTED" : "REJECTED";

        return this.prisma.friendRequest.update({
            where: { id: requestId },
            data: { status },
        });
    }

    async getPendingRequests(userId: string) {
        return this.prisma.friendRequest.findMany({
            where: { receiverId: userId, status: "PENDING" },
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                name: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        });
    }
}
