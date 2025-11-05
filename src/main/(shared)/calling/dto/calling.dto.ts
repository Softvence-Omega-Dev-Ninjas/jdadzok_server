// src/call/dto/call.dto.ts
import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class JoinCallDto {
    @IsString()
    @IsNotEmpty()
    callId: string;

    @IsString()
    @IsNotEmpty()
    userName: string;

    @IsBoolean()
    hasVideo: boolean;

    @IsBoolean()
    hasAudio: boolean;
}

export class StartMediaDto {
    @IsString()
    @IsNotEmpty()
    callId: string;
}

export class WebRTCSignalDto {
    @IsString()
    @IsNotEmpty()
    targetSocketId: string;

    @IsObject()
    signal: any; // RTCSessionDescriptionInit
}

export class IceCandidateDto {
    @IsString()
    @IsNotEmpty()
    targetSocketId: string;

    @IsObject()
    candidate: any; // RTCIceCandidateInit
}

export class CreateCallDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsBoolean()
    @IsOptional()
    isPrivate?: boolean;
}

export class UpdateCallDto {
    @IsString()
    @IsOptional()
    status?: 'CALLING' | 'ACTIVE' | 'ENDED' | 'CANCELLED' | 'MISSED' | 'DECLINED';
}