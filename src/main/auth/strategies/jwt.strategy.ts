import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ENVEnum } from '@project/common/enum/env.enum';
import { JWTPayload } from '@project/common/jwt/jwt.interface';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(config: ConfigService) {
        const jwtSecret = config.getOrThrow<string>(ENVEnum.JWT_SECRET);
        console.log('JWT Secret from ConfigService:', jwtSecret);
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtSecret,
            ignoreExpiration: false,
        });
    }

    validate(payload: JWTPayload) {
        console.log('Token is valid. Payload:', payload);

        // send user from the db
        return { userId: payload.sub, email: payload.email, roles: payload.roles };
    }
}
