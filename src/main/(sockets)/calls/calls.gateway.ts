import { WebSocketGateway, WebSocketServer, OnGatewayInit, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CallsService } from './calls.service';
import { UseGuards, Inject } from '@nestjs/common';
import { CreateCallDto } from './dto/create-calls.dto';
import { SignalDto } from './dto/signal.dto';
import { GetSocketUser } from "@project/main/(sockets)/ecorators/rate-limit.decorator";
import { SocketMiddleware } from "@project/main/(sockets)/middleware/socket.middleware";
import { SocketUser } from "@module/(sockets)/@types";



@WebSocketGateway({ namespace: 'calls', cors: { origin: true, credentials: true } })
export class CallsGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  constructor(
    private readonly svc: CallsService,
    private readonly socketMiddleware: SocketMiddleware,
  ) {}


  afterInit() {
    this.server.use(this.socketMiddleware.authenticate());
  }

  @SubscribeMessage('call.create')
  async socketCreate(@GetSocketUser() user: SocketUser, @ConnectedSocket() client: Socket, @MessageBody() payload: CreateCallDto) {
    // Create call with userId type and call to
    const call = await this.svc.createCall(user.id, payload.type, payload.to);

    // Send notification to target call user
    // TODO(coderboysobuj) verify payload.to socket user exist in redis
    if(call) {
        this.server.to(payload.to).emit("call.calling", { callId: call.id, turn: this.getTurnConfig() });
        // TODO(coderboysobuj) Check if user online send caller to ringing call status 
        // Otherwise notify the user to that user is offline
        // For now let notify user that call is created
        // then handle call created event
        this.server.to(client.id).emit('call.created', { callId: call.id, turn: this.getTurnConfig() });
    }
  }

  @SubscribeMessage('call.accept')
  async socketAccept(@GetSocketUser() user: SocketUser, @ConnectedSocket() client: Socket, @MessageBody() payload: { callId: string }) {
    const call = await this.svc.setAccepted(payload.callId, user.id);
    if(call){
        this.server.to(call.creatorId).emit('call.accepted', { callId: call.id, from: user.id, turn: this.getTurnConfig() })
    }
  }

  @SubscribeMessage('call.reject')
  async socketReject(@GetSocketUser() user: SocketUser, @ConnectedSocket() client: Socket, @MessageBody() payload: { callId: string }) {
    this.server.to(client.id).emit('call.rejected', { callId: payload.callId, from: user.id });
  }

  @SubscribeMessage('call.offer')
  async socketOffer(@GetSocketUser() user: SocketUser, @ConnectedSocket() client: Socket, @MessageBody() payload: SignalDto) {
    this.server.to(payload.targetId).emit('call.offer', { callId: payload.callId, from: user.id, sdp: payload.payload });

  }

  @SubscribeMessage('call.answer')
  async socketAnswer(@GetSocketUser() user: SocketUser, @ConnectedSocket() client: Socket, @MessageBody() payload: SignalDto) {
    this.server.to(payload.targetId).emit('call.answer', { callId: payload.callId, from: user.id, sdp: payload.payload });

  }

  @SubscribeMessage('call.ice')
  async socketIce(@GetSocketUser() user: SocketUser, @ConnectedSocket() client: Socket, @MessageBody() payload: SignalDto) {
    this.server.to(payload.targetId).emit('call.ice', { callId: payload.callId, from: user.id, candidate: payload.payload });

  }

  @SubscribeMessage('call.hangup')
  async socketHangup(@GetSocketUser() user: SocketUser, @ConnectedSocket() client: Socket, @MessageBody() payload: { callId: string }) {
    await this.svc.endCall(payload.callId);
    this.server.emit('call.hangup', { callId: payload.callId, from: user.id });
  }

  private getTurnConfig() {
    return {
      urls: [process.env.TURN_URL],
      username: process.env.TURN_USER,
      credential: process.env.TURN_PASS,
    };
  }
}

