// src/call/dto/call.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

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
    signal: any;
}

export class IceCandidateDto {
    @IsString()
    @IsNotEmpty()
    targetSocketId: string;

    @IsObject()
    candidate: any;
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
    status?: "CALLING" | "ACTIVE" | "ENDED" | "CANCELLED" | "MISSED" | "DECLINED";
}

// src/call/dto/start-call.dto.ts

export class StartCallToUserDto {
    @ApiProperty({
        description: "ID of the user to call",
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    @IsString()
    @IsNotEmpty()
    recipientUserId: string;
}
