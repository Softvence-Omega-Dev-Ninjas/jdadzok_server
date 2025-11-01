import { GetSocketUser } from "@common/decorators/socket-user.decorator";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { SocketUser } from "../@types";
import { BaseSocketGateway } from "../base/abstract-socket.gateway";
import { SOCKET_EVENTS } from "../constants/socket-events.constant";
import { SocketMiddleware } from "../middleware/socket.middleware";
import { RedisService } from "../services/redis.service";
import { CallsService } from "./calls.service";
import { CreateCallDto } from "./dto/create-calls.dto";

@WebSocketGateway({
    namespace: "/calls",
    cors: { origin: true, credentials: true },
})
export class CallsGateway extends BaseSocketGateway {
    constructor(redisService: RedisService, socketMiddleware: SocketMiddleware, private readonly svc: CallsService) {
        super(redisService, socketMiddleware)
    }

    private readonly CALL_TIMEOUT_MS = 30 * 1000; // 30 secounds timeout for call acceptance

    @SubscribeMessage(SOCKET_EVENTS.CALL.INITIATE)
    async handleCallInitiate(
        @GetSocketUser() user: SocketUser,
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: CreateCallDto,
    ) {
        console.info(user);
        console.info(client.id);
        console.info(payload);
        // try {
        //     // Create call record in database
        //     const call = await this.svc.createCall(user.id, payload);
        //     const callRoom = this.getCallRoom(call.id);
        //     // Check if target usre is online
        //     const targetSocket = this.getUserById(call.toId);
        //     if (!targetSocket) {
        //         await this.svc.endCall(call.id);
        //         client.emit(SOCKET_EVENTS.CALL.STATUS, {
        //             callId: call.id,
        //             status: "FAILED",
        //             reason: "Target User is offline",
        //         });
        //         return;
        //     }
        //     // Join initiator to call room
        //     client.join(callRoom);
        //     // Notify target user about incomming call
        //     this.server.to(targetSocket.id).emit(SOCKET_EVENTS.CALL.INCOMING, {
        //         callId: call.id,
        //         formId: user.id,
        //         offer: payload.offer,
        //     });
        //     // Notify initiator of ringing status
        //     client.emit(SOCKET_EVENTS.CALL.STATUS, {
        //         callId: call.id,
        //         status: "RINGING",
        //     });
        //     // Set timeout for call acceptance
        //     setTimeout(async () => {
        //         const currentCall = await this.svc.getCall(call.id);
        //         if (currentCall && currentCall.status !== "ACTIVE") {
        //             await this.svc.endCall(call.id);
        //             this.server.to(callRoom).emit(SOCKET_EVENTS.CALL.STATUS, {
        //                 callId: call.id,
        //                 status: "TIMEOUT",
        //                 reason: "Call not accepted withing time limit",
        //             });
        //             this.server.socketsLeave(callRoom);
        //         }
        //     }, this.CALL_TIMEOUT_MS);
        // } catch (error: any) {
        //     this.logger.error(`Failed to initiate call: ${error?.message}`, error?.stack);
        //     client.emit(SOCKET_EVENTS.CALL.ERROR, {
        //         message: "Failed to initiate call",
        //     });
        //     throw new BadRequestException("Call initiation failed");
        // }
    }
    // // @SubscribeMessage(SOCKET_EVENTS.CALL.ACCEPT)
    // // @UsePipes(new ValidationPipe({ transform: true }))
    // // async hanndleCallAccept(
    // //     @GetSocketUser() user: SocketUser,
    // //     @ConnectedSocket() client: Socket,
    // //     @MessageBody() payload: { callId: string; answer: any },
    // // ) {
    // //     // try {
    // //     //     // Validate user is part of the call
    // //     //     if (!(await this.validateCallParticipant(payload.callId, user.id))) {
    // //     //         throw new Error("User not authorized for this call");
    // //     //     }
    // //     //     const call = await this.svc.markAsAccepted(payload.callId, user.id);
    // //     //     if (!call) {
    // //     //         throw new Error("Call not found or already ended");
    // //     //     }
    // //     //     const callRoom = this.getCallRoom(payload.callId);
    // //     //     client.join(callRoom);
    // //     //     // Notify call room
    // //     //     this.server.to(callRoom).emit(SOCKET_EVENTS.CALL.STATUS, {
    // //     //         callId: call.id,
    // //     //         status: "ACCEPTED",
    // //     //         answer: payload.answer,
    // //     //         fromId: user.id,
    // //     //     });
    // //     // } catch (error: any) {
    // //     //     this.logger.error(`Failed to accept call: ${error?.message}`, error?.stack);
    // //     //     client.emit(SOCKET_EVENTS.CALL.ERROR, {
    // //     //         callId: payload.callId,
    // //     //         message: "Failed to accept call",
    // //     //     });
    // //     // }
    // // }

    // @SubscribeMessage(SOCKET_EVENTS.CALL.DECLINE)
    // @UsePipes(new ValidationPipe({ transform: true }))
    // async handleCallDecline(
    //     @GetSocketUser() user: SocketUser,
    //     @ConnectedSocket() client: Socket,
    //     @MessageBody() payload: { callId: string },
    // ) {
    //     // try {
    //     //     if (!(await this.validateCallParticipant(payload.callId, user.id))) {
    //     //         throw new Error("User not authorized for this call");
    //     //     }
    //     //     const call = await this.svc.markAsDeclined(payload.callId, user.id);
    //     //     if (!call) {
    //     //         throw new Error("Call not found or already ended");
    //     //     }
    //     //     const callRoom = this.getCallRoom(payload.callId);
    //     //     this.server.to(callRoom).emit(SOCKET_EVENTS.CALL.STATUS, {
    //     //         callId: payload.callId,
    //     //         status: "DECLINED",
    //     //         fromId: user.id,
    //     //     });
    //     //     // Clean up room
    //     //     this.server.socketsLeave(callRoom);
    //     // } catch (error: any) {
    //     //     this.logger.error(`Failed to decline call: ${error?.message}`, error?.stack);
    //     //     client.emit(SOCKET_EVENTS.CALL.ERROR, {
    //     //         callId: payload.callId,
    //     //         message: "Failed to decline call",
    //     //     });
    //     // }
    // }

    // @SubscribeMessage(SOCKET_EVENTS.CALL.OFFER)
    // @UsePipes(new ValidationPipe({ transform: true }))
    // async handleOffer(
    //     @GetSocketUser() user: SocketUser,
    //     @ConnectedSocket() client: Socket,
    //     @MessageBody() payload: SignalDto,
    // ) {
    //     // try {
    //     //     if (!(await this.validateCallParticipant(payload.callId, user.id))) {
    //     //         throw new Error("User not authorized for this call");
    //     //     }
    //     //     this.server.to(this.getCallRoom(payload.callId)).emit(SOCKET_EVENTS.CALL.OFFER, {
    //     //         callId: payload.callId,
    //     //         fromId: user.id,
    //     //         sdp: payload.payload,
    //     //     });
    //     // } catch (error: any) {
    //     //     this.logger.error(`Failed to handle offer: ${error?.message}`, error?.stack);
    //     //     client.emit(SOCKET_EVENTS.CALL.ERROR, {
    //     //         callId: payload.callId,
    //     //         message: "Failed to send offer",
    //     //     });
    //     // }
    // }

    // @SubscribeMessage(SOCKET_EVENTS.CALL.ANSWER)
    // @UsePipes(new ValidationPipe({ transform: true }))
    // async handleAnswer(
    //     @GetSocketUser() user: SocketUser,
    //     @ConnectedSocket() client: Socket,
    //     @MessageBody() payload: SignalDto,
    // ) {
    //     // try {
    //     //     if (!(await this.validateCallParticipant(payload.callId, user.id))) {
    //     //         throw new Error("User not authorized for this call");
    //     //     }
    //     //     this.server.to(this.getCallRoom(payload.callId)).emit(SOCKET_EVENTS.CALL.ANSWER, {
    //     //         callId: payload.callId,
    //     //         fromId: user.id,
    //     //         sdp: payload.payload,
    //     //     });
    //     // } catch (error: any) {
    //     //     this.logger.error(`Failed to handle answer: ${error?.message}`, error?.stack);
    //     //     client.emit(SOCKET_EVENTS.CALL.ERROR, {
    //     //         callId: payload.callId,
    //     //         message: "Failed to send answer",
    //     //     });
    //     // }
    // }

    // @SubscribeMessage(SOCKET_EVENTS.CALL.ICE_CANDIDATE)
    // @UsePipes(new ValidationPipe({ transform: true }))
    // async handleIceCandidate(
    //     @GetSocketUser() user: SocketUser,
    //     @ConnectedSocket() client: Socket,
    //     @MessageBody() payload: SignalDto,
    // ) {
    //     // try {
    //     //     if (!(await this.validateCallParticipant(payload.callId, user.id))) {
    //     //         throw new Error("User not authorized for this call");
    //     //     }
    //     //     this.server
    //     //         .to(this.getCallRoom(payload.callId))
    //     //         .emit(SOCKET_EVENTS.CALL.ICE_CANDIDATE, {
    //     //             callId: payload.callId,
    //     //             fromId: user.id,
    //     //             candidate: payload.payload,
    //     //         });
    //     // } catch (error: any) {
    //     //     this.logger.error(`Failed to handle ICE candidate: ${error?.message}`, error?.stack);
    //     //     client.emit(SOCKET_EVENTS.CALL.ERROR, {
    //     //         callId: payload.callId,
    //     //         message: "Failed to send ICE candidate",
    //     //     });
    //     // }
    // }

    // @SubscribeMessage(SOCKET_EVENTS.CALL.END)
    // @UsePipes(new ValidationPipe({ transform: true }))
    // async handleCallEnd(
    //     @GetSocketUser() user: SocketUser,
    //     @ConnectedSocket() client: Socket,
    //     @MessageBody() payload: { callId: string },
    // ) {
    //     // try {
    //     //     if (!(await this.validateCallParticipant(payload.callId, user.id))) {
    //     //         throw new Error("User not authorized for this call");
    //     //     }
    //     //     await this.svc.endCall(payload.callId);
    //     //     const callRoom = this.getCallRoom(payload.callId);
    //     //     this.server.to(callRoom).emit(SOCKET_EVENTS.CALL.STATUS, {
    //     //         callId: payload.callId,
    //     //         status: "ENDED",
    //     //         fromId: user.id,
    //     //     });
    //     //     // Clean up room
    //     //     this.server.socketsLeave(callRoom);
    //     // } catch (error: any) {
    //     //     this.logger.error(`Failed to end call: ${error?.message}`, error?.stack);
    //     //     client.emit(SOCKET_EVENTS.CALL.ERROR, {
    //     //         callId: payload.callId,
    //     //         message: "Failed to end call",
    //     //     });
    //     // }
    // }

    // @SubscribeMessage(SOCKET_EVENTS.CALL.REJOIN)
    // @UsePipes(new ValidationPipe({ transform: true }))
    // async handleCallRejoin(
    //     @GetSocketUser() user: SocketUser,
    //     @ConnectedSocket() client: Socket,
    //     @MessageBody() payload: { callId: string },
    // ) {
    //     // try {
    //     //     const call = await this.svc.getCall(payload.callId);
    //     //     if (
    //     //         !call ||
    //     //         call.status !== "ACTIVE" ||
    //     //         !(await this.validateCallParticipant(payload.callId, user.id))
    //     //     ) {
    //     //         throw new Error("Cannot rejoin: Invalid or inactive call");
    //     //     }
    //     //     const callRoom = this.getCallRoom(payload.callId);
    //     //     client.join(callRoom);
    //     //     // Notify others in the room about rejoined user
    //     //     this.server.to(callRoom).emit(SOCKET_EVENTS.CALL.STATUS, {
    //     //         callId: payload.callId,
    //     //         status: "REJOINED",
    //     //         fromId: user.id,
    //     //     });
    //     // } catch (error: any) {
    //     //     this.logger.error(`Failed to rejoin call: ${error?.message}`, error?.stack);
    //     //     client.emit(SOCKET_EVENTS.CALL.ERROR, {
    //     //         callId: payload.callId,
    //     //         message: "Failed to rejoin call",
    //     //     });
    //     // }
    // }
}
