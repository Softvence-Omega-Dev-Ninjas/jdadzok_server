// src/call/call.gateway.ts
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { PrismaService } from '@lib/prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IceCandidateDto, JoinCallDto, StartMediaDto, WebRTCSignalDto } from './dto/calling.dto';
import { CallService } from './service/calling.service';


@WebSocketGateway({
    cors: { origin: '*' },
    namespace: '/calling',
    transports: ['websocket'],
    pingInterval: 10000,
    pingTimeout: 5000,
    connectTimeout: 10000
})
export class CallGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(CallGateway.name);
    private readonly clients = new Map<string, Set<Socket>>();
    private userSockets = new Map<string, string>();
    // Add to constructor
    constructor(private readonly callService: CallService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        this.server?.on('connect_error', (error) => {
            this.logger.error('Connection error:', error);
        });

        this.server?.on('connect_timeout', () => {
            this.logger.error('Connection timeout');
        });
    }


    afterInit(server: Server) {
        this.logger.log(
            "Socket.IO server initialized for calling Gateway",
            server.adapter.name,
        );
    }
    async handleConnection(@ConnectedSocket() socket: Socket) {
        try {
            this.logger.log(`Client attempting to connect: ${socket.id}`);

            // Check if socket is connected
            if (!socket.connected) {
                this.logger.error(`Socket ${socket.id} failed to connect`);
                socket.disconnect();
                return;
            }

            // Extract user info from handshake (auth token, etc.)
            const userId = socket.handshake.query.userId as string;

            if (!userId) {
                this.logger.error(`No userId provided for socket ${socket.id}`);
                socket.disconnect();
                return;
            }

            this.logger.log(`User ${userId} connected with socket ID: ${socket.id}`);
            await this.callService.addActiveUser(socket.id, userId);
            this.emitActiveUsers();

            // Emit connection success to client
            socket.emit('connectionEstablished', { socketId: socket.id });
        } catch (error) {
            this.logger.error(`Connection error for socket ${socket.id}:`, error);
            socket.disconnect();
        }
    }

    async handleDisconnect(@ConnectedSocket() socket: Socket) {
        this.logger.log(`Client disconnected: ${socket.id}`);

        const roomId = await this.callService.getUserRoom(socket.id);

        if (roomId) {
            await this.handleUserLeavingCall(socket, roomId);
        }

        await this.callService.removeActiveUser(socket.id);
        this.emitActiveUsers();
    }

    @SubscribeMessage('joinCall')
    async handleJoinCall(
        @ConnectedSocket() socket: Socket,
        @MessageBody() data: JoinCallDto,
    ) {
        const { callId, userName, hasVideo, hasAudio } = data;

        this.logger.log(`User ${socket.id} joining call: ${callId}`);

        // Leave previous room if exists
        const previousRoomId = await this.callService.getUserRoom(socket.id);
        this.logger.log(`User ${socket.id} previous room: ${previousRoomId}`);
        if (previousRoomId) {
            await this.handleUserLeavingCall(socket, previousRoomId);
        }

        // Join new room
        socket.join(callId);

        // Get or create call room
        const room = await this.callService.joinCall(
            callId,
            socket.id,
            userName,
            hasVideo,
            hasAudio,
        );
        console.log('the room id', room)
        // Notify existing participants about new user
        const existingParticipants = room.participants.filter(
            (p) => p.socketId !== socket.id,
        );

        // Send existing participants to the new user
        socket.emit('existingParticipants', {
            participants: existingParticipants.map((p) => ({
                socketId: p.socketId,
                userName: p.userName,
                hasVideo: p.hasVideo,
                hasAudio: p.hasAudio,
            })),
        });

        // Notify others about the new participant
        socket.to(callId).emit('participantJoined', {
            socketId: socket.id,
            userName,
            hasVideo,
            hasAudio,
        });

        this.logger.log(
            `Call ${callId} now has ${room.participants.length} participants`,
        );
    }

    @SubscribeMessage('startVideo')
    async handleStartVideo(
        @ConnectedSocket() socket: Socket,
        @MessageBody() data: StartMediaDto,
    ) {
        const { callId } = data;

        await this.callService.updateMediaState(socket.id, callId, 'video', true);

        socket.to(callId).emit('participantVideoStarted', {
            socketId: socket.id,
        });

        this.logger.log(`User ${socket.id} started video in call ${callId}`);
    }

    @SubscribeMessage('stopVideo')
    async handleStopVideo(
        @ConnectedSocket() socket: Socket,
        @MessageBody() data: StartMediaDto,
    ) {
        const { callId } = data;

        await this.callService.updateMediaState(socket.id, callId, 'video', false);

        socket.to(callId).emit('participantVideoStopped', {
            socketId: socket.id,
        });

        this.logger.log(`User ${socket.id} stopped video in call ${callId}`);
    }

    @SubscribeMessage('startAudio')
    async handleStartAudio(
        @ConnectedSocket() socket: Socket,
        @MessageBody() data: StartMediaDto,
    ) {
        const { callId } = data;

        await this.callService.updateMediaState(socket.id, callId, 'audio', true);

        socket.to(callId).emit('participantAudioStarted', {
            socketId: socket.id,
        });

        this.logger.log(`User ${socket.id} started audio in call ${callId}`);
    }

    @SubscribeMessage('stopAudio')
    async handleStopAudio(
        @ConnectedSocket() socket: Socket,
        @MessageBody() data: StartMediaDto,
    ) {
        const { callId } = data;

        await this.callService.updateMediaState(socket.id, callId, 'audio', false);

        socket.to(callId).emit('participantAudioStopped', {
            socketId: socket.id,
        });

        this.logger.log(`User ${socket.id} stopped audio in call ${callId}`);
    }

    @SubscribeMessage('offer')
    handleOffer(
        @ConnectedSocket() socket: Socket,
        @MessageBody() data: WebRTCSignalDto,
    ) {
        this.logger.debug(
            `Relaying offer from ${socket.id} to ${data.targetSocketId}`,
        );

        this.server.to(data.targetSocketId).emit('offer', {
            offer: data.signal,
            senderId: socket.id,
        });
    }

    @SubscribeMessage('answer')
    handleAnswer(
        @ConnectedSocket() socket: Socket,
        @MessageBody() data: WebRTCSignalDto,
    ) {
        this.logger.debug(
            `Relaying answer from ${socket.id} to ${data.targetSocketId}`,
        );

        this.server.to(data.targetSocketId).emit('answer', {
            answer: data.signal,
            senderId: socket.id,
        });
    }

    @SubscribeMessage('iceCandidate')
    handleIceCandidate(
        @ConnectedSocket() socket: Socket,
        @MessageBody() data: IceCandidateDto,
    ) {
        this.logger.debug(
            `Relaying ICE candidate from ${socket.id} to ${data.targetSocketId}`,
        );

        this.server.to(data.targetSocketId).emit('iceCandidate', {
            candidate: data.candidate,
            senderId: socket.id,
        });
    }

    @SubscribeMessage('leaveCall')
    async handleLeaveCall(
        @ConnectedSocket() socket: Socket,
        @MessageBody() data: { callId: string },
    ) {
        await this.handleUserLeavingCall(socket, data.callId);
    }

    private async handleUserLeavingCall(socket: Socket, callId: string) {
        this.logger.log(`User ${socket.id} leaving call ${callId}`);

        socket.leave(callId);

        const room = await this.callService.leaveCall(socket.id, callId);

        // Notify others
        socket.to(callId).emit('participantLeft', {
            socketId: socket.id,
        });

        // Clean up empty rooms
        if (room && room.participants.length === 0) {
            await this.callService.deleteCall(callId);
            this.logger.log(`Call ${callId} deleted (no participants)`);
        }
    }

    private emitActiveUsers() {
        const activeUsers = this.callService.getActiveUsersCount();
        this.server.emit('activeUsers', { count: activeUsers });
    }
}