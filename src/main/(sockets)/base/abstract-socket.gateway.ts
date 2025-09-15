
import { Logger } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export abstract class AbstractSocketGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    protected readonly logger = new Logger(AbstractSocketGateway.name);

    @WebSocketServer() protected io: Server;

    afterInit() {
        this.logger.log('[Socket] Gateway initialized');
    }

    handleConnection(client: Socket) {
        this.logger.log(`[Socket] Client connected: ${client.id}`);
        client.broadcast.emit('client-joined', {
            message: `Client joined: ${client.id}`,
        });
    }

    handleDisconnect(client: Socket) {
        this.logger.debug(`[Socket] Client disconnected: ${client.id}`);
        this.io.emit('client-left', {
            message: `client left: ${client.id}`,
        });
    }

    protected emitToClient<T = any>(client: Socket, event: string, data: T) {
        client.emit(event, data);
    }

    protected broadcast<T = any>(client: Socket, event: string, data: T) {
        client.broadcast.emit(event, data);
    }

    protected emitToAll<T = any>(event: string, data: T) {
        this.io.emit(event, data);
    }
}
