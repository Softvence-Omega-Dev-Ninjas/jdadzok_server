import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { ENVEnum } from "@project/common/enum/env.enum";
import { JWTPayload } from "@project/common/jwt/jwt.interface";

@Injectable()
export class JwtServices {
    constructor(private readonly service: JwtService, private readonly configService: ConfigService,
    ) { }

    public async signAsync<T extends JWTPayload>(payload: T, options?: JwtSignOptions): Promise<string> {
        return await this.service.signAsync(payload, {
            ...options,
            expiresIn: this.configService.getOrThrow<string>(ENVEnum.JWT_EXPIRES_IN),
            secret: this.configService.getOrThrow<string>(ENVEnum.JWT_SECRET)
        })
    }

    public async verifyAsync(token: string, options?: JwtSignOptions) {
        return await this.service.verifyAsync(token, {
            ...options,
            secret: this.configService.getOrThrow<string>(ENVEnum.JWT_SECRET)
        })
    }
} 