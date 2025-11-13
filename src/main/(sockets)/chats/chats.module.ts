// src/chat/chat.module.ts
import { PrismaService } from '@lib/prisma/prisma.service';
import { AuthModule } from '@module/(started)/auth/auth.module'; // Correct path
import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
    imports: [AuthModule], // This brings in AuthValidatorService
    providers: [
        ChatService,
        ChatGateway,
        PrismaService,
        // DO NOT ADD AuthValidatorService here
    ],
    controllers: [ChatController],
    exports: [ChatService],
})
export class ChatModule { }