import { RedisService } from "@common/redis/redis.service";
import { RedisKey } from "@constants/redis.key";
import { TTL } from "@constants/ttl.constants";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { uniqueID } from "dev-unique-id";
import {
  OtpOptions,
  OtpPayload,
  OtpRedisData,
  OtpType,
  OtpVerifyPayload,
} from "./otp.types";

@Injectable()
export class OptService {
  constructor(private readonly redisService: RedisService) {}

  private getRedisKeyByType(type: OtpType): RedisKey {
    switch (type) {
      case "RESET_PASSWORD":
        return "RESET_PASSWORD_TOKEN";
      case "EMAIL_VERIFICATION":
        return "EMAIL_VERIFICATION_TOKEN";
      default:
        throw new Error(`Unsupported OTP type: ${type}`);
    }
  }

  async generateOtp(
    payload: OtpPayload,
    options: OtpOptions = { ttl: "5m", length: 6 },
  ): Promise<OtpRedisData> {
    const { userId, email, type } = payload;
    const { ttl = "5m", length = 6 } = options;

    const redisKey = this.getRedisKeyByType(type);
    const existing = await this.redisService.get<OtpRedisData>(
      redisKey,
      userId,
    );

    if (existing)
      throw new ForbiddenException(
        "You can request a new OTP after some time.",
      );

    const token = uniqueID({ length, alphabet: true });
    const expireAt = new Date(
      Date.now() + (typeof ttl === "string" ? TTL[ttl] : ttl),
    ).toISOString();

    const data: OtpRedisData = {
      token: Number(token),
      attempt: 0,
      expireAt,
      userId,
      email,
    };

    await this.redisService.set(redisKey, data, ttl, userId);
    return data;
  }

  async verifyOtp(
    input: OtpVerifyPayload,
    isDelete: boolean = true,
  ): Promise<boolean> {
    const { userId, token, type } = input;

    const redisKey = this.getRedisKeyByType(type);
    const data = await this.redisService.get<OtpRedisData>(redisKey, userId);

    if (!data) {
      throw new ForbiddenException("OTP expired or not found");
    }

    if (data.attempt >= 5) {
      // Do not delete the OTP — just block the attempt
      throw new ForbiddenException(
        "Too many failed attempts, please try again later",
      );
    }

    if (data.token !== token) {
      // Increment attempts
      await this.redisService.set(
        redisKey,
        {
          ...data,
          attempt: data.attempt + 1,
        },
        new Date(data.expireAt).getTime() - Date.now(),
        userId,
      ); // Keep the remaining TTL

      throw new ForbiddenException("Wrong OTP");
    }
    if (isDelete) await this.redisService.delete(redisKey, input.userId);
    return true;
  }

  async getToken(payload: Omit<OtpVerifyPayload, "token">) {
    const redisKey = this.getRedisKeyByType(payload.type);
    const data = await this.redisService.get<OtpRedisData>(
      redisKey,
      payload.userId,
    );
    return data;
  }

  async delete(payload: Omit<OtpVerifyPayload, "token">) {
    const redisKey = this.getRedisKeyByType(payload.type);
    await this.redisService.delete(redisKey, payload.userId);
  }
}
