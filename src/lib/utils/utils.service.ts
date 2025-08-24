import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ENVEnum } from '@project/common/enum/env.enum';
import { JWTPayload } from '@project/common/jwt/jwt.interface';
import * as bcrypt from 'argon2';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UtilsService {

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  sanitizedResponse(sto: any, data: any) {
    return plainToInstance(sto, data, { excludeExtraneousValues: true });
  }

  removeDuplicateIds(ids: string[]) {
    return Array.from(new Set(ids));
  }

  // * AUTH UTILS
  async hash(value: string): Promise<string> {
    return bcrypt.hash(value);
  }

  async compare(hash: string, value: string,): Promise<boolean> {
    return bcrypt.verify(hash, value);
  }

  generateToken(payload: JWTPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>(ENVEnum.JWT_SECRET),
      expiresIn: this.configService.get<string>(ENVEnum.JWT_EXPIRES_IN),
    });
  }

  generateOtpAndExpiry(): { otp: number; expiryTime: Date } {
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit code
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10); // valid for 10 minutes
    return { otp, expiryTime };
  }
}
