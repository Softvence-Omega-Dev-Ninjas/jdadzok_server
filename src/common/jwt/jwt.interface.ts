import { Role } from "@constants/enums";
import { Request } from "express";

export interface RequestWithUser extends Request {
    user?: UserTokenPayload;
}

export type JWTPayload = {
    sub: string;
    email: string;
    roles: string;
};

export interface UserTokenPayload {
    roles: Role[];
    email: string;
    userId: string;
    [key: string]: unknown;
}
