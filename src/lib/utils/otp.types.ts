import { TTLKey } from "@constants/ttl.constants";

export type OtpType = 'RESET_PASSWORD' | 'EMAIL_VERIFICATION'; // we can add more type here...

export type OtpPayload = {
    userId: string;
    email?: string;
    type: OtpType;
}

export type OtpOptions = {
    ttl?: TTLKey;
    length?: number;
}

export type OtpRedisData = {
    token: number;
    attempt: number;
    expireAt: string;
    userId: string;
    email?: string;
}

export type OtpVerifyPayload = {
    userId: string;
    type: OtpType;
    token: number;
}