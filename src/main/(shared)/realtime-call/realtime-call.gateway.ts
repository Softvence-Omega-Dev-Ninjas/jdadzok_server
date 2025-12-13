import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { RealTimeCallService } from "./realtime-call.service";
import * as jwt from "jsonwebtoken";

@WebSocketGateway({
    cors: { origin: "*" },
    namespace: "/realtime-call",
})
export class RealTimeCallGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private users = new Map<string, string>(); 

    constructor(private readonly callService: RealTimeCallService) {}

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.headers.authorization?.split(" ")[1];
            if (!token) throw new Error("No token provided");

            const secret = process.env.JWT_SECRET;
            if (!secret) throw new Error("JWT_SECRET not found");

            const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
            const userId = decoded.sub as string;

            this.users.set(userId, client.id);
            console.log(`User connected: ${userId}`);
        } catch (err) {
            console.log("Invalid token, disconnecting socket", err);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        for (const [userId, socketId] of this.users.entries()) {
            if (socketId === client.id) {
                this.users.delete(userId);
                console.log(`User disconnected: ${userId}`);
                break;
            }
        }
    }

    // Call event

    @SubscribeMessage("start-call")
    async startCall(
        @MessageBody()
        data: {
            hostUserId: string;
            recipientUserId: string;
            title?: string;
        },
    ) {
        const call = await this.callService.createCall(
            data.hostUserId,
            data.recipientUserId,
            data.title,
        );

       const receiverSocket = this.users.get(data.recipientUserId);
       console.log("Attempting to get recipient socket:", data.recipientUserId, receiverSocket);


        if (receiverSocket) {
            await this.callService.markRinging(call.id);
            this.server.to(receiverSocket).emit("incoming-call", {
                callId: call.id,
                from: data.hostUserId,
                title: data.title,
            });
        } else {
            await this.callService.markMissed(call.id);
        }

        return call;
    }

    @SubscribeMessage("accept-call")
    async acceptCall(@MessageBody() data: { callId: string }) {
        await this.callService.markActive(data.callId);
        this.server.emit("call-active", { callId: data.callId });
    }

    @SubscribeMessage("decline-call")
    async declineCall(@MessageBody() data: { callId: string }) {
        await this.callService.markDeclined(data.callId);
        this.server.emit("call-declined", { callId: data.callId });
    }

    @SubscribeMessage("end-call")
    async endCall(@MessageBody() data: { callId: string }) {
        await this.callService.endCall(data.callId);
        this.server.emit("call-ended", { callId: data.callId });
    }

    //  WebRTC Signaling

    @SubscribeMessage("webrtc-offer")
    handleOffer(@MessageBody() data: { roomId: string; offer: any; receiverId: string }) {
        const receiverSocket = this.users.get(data.receiverId);
        if (receiverSocket) {
            this.server.to(receiverSocket).emit("webrtc-offer", {
                roomId: data.roomId,
                offer: data.offer,
            });
        }
    }

    @SubscribeMessage("webrtc-answer")
    handleAnswer(@MessageBody() data: { roomId: string; answer: any; callerId: string }) {
        const callerSocket = this.users.get(data.callerId);
        if (callerSocket) {
            this.server.to(callerSocket).emit("webrtc-answer", {
                roomId: data.roomId,
                answer: data.answer,
            });
        }
    }

    @SubscribeMessage("ice-candidate")
    handleIceCandidate(
        @MessageBody() data: { roomId: string; candidate: any; targetUserId: string },
    ) {
        const targetSocket = this.users.get(data.targetUserId);
        if (targetSocket) {
            this.server.to(targetSocket).emit("ice-candidate", {
                roomId: data.roomId,
                candidate: data.candidate,
            });
        }
    }
}
