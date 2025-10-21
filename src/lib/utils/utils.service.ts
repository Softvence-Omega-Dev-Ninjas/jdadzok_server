import { ENVEnum } from "@common/enum/env.enum";
import { JWTPayload } from "@common/jwt/jwt.interface";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "argon2";
import { plainToInstance } from "class-transformer";

@Injectable()
export class UtilsService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

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

    async compare(hash: string, value: string): Promise<boolean> {
        return bcrypt.verify(hash, value);
    }

    generateToken(payload: JWTPayload): string {
        return this.jwtService.sign(payload, {
            secret: this.configService.getOrThrow(ENVEnum.JWT_SECRET),
            expiresIn: this.configService.getOrThrow(ENVEnum.JWT_EXPIRES_IN),
        });
    }
}
