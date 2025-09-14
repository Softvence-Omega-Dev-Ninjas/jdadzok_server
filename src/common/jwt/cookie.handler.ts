import { CookieOptions, Request, Response } from "express";
import { RequestWithUser } from "./jwt.interface";

export const COOKIE_KEY = "accessToken"
export function cookieHandler(ctx: RequestWithUser, mode: "get"): string | undefined;
export function cookieHandler(ctx: Response, mode: "set" | "clear", options?: CookieOptions): void;

export function cookieHandler(
    ctx: RequestWithUser | Response,
    mode: "set" | "get" | "clear",
    options: CookieOptions = {}
): string | void {
    const defaultOptions: CookieOptions = {
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90days
        httpOnly: true,
        secure: process.env.ENV_MODE === "production",
        sameSite: "lax",
    }
    const margedOptions = { ...defaultOptions, ...options };

    switch (mode) {
        case "set":
            (ctx as Response).cookie(COOKIE_KEY, margedOptions)
            break;
        case "clear":
            (ctx as Response).clearCookie(COOKIE_KEY, margedOptions)
            break;
        case "get":
            (ctx as Request).cookies[COOKIE_KEY];
            break;
        default:
            break;
    }
}