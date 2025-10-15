import { UserRepository } from "@module/(users)/users/users.repository";
import { BadGatewayException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtServices } from "@service/jwt.service";
import * as cookie from "cookie";
import { Socket } from "socket.io";

@Injectable()
export class AuthValidatorService {
    constructor(
        private readonly jwtService: JwtServices,
        private readonly userRepo: UserRepository,
    ) { }

    async validateSocketToken(socket: Socket) {
        const rawCookie = socket.handshake.headers.cookie;
        if (!rawCookie) {
            throw new BadGatewayException("Unauthorized user - cookie not found");
        }

        const parsed = cookie.parse(rawCookie);
        const token = parsed["access_token"]; // Adjust to your actual cookie name

        if (!token) {
            throw new BadGatewayException("Token not found in cookie");
        }

        const isVerifiedToken = await this.jwtService.verifyAsync(token);

        if (!isVerifiedToken?.sub || !isVerifiedToken?.email) {
            throw new BadGatewayException("Invalid or expired token");
        }

        const user = await this.userRepo.findById(isVerifiedToken.sub);

        if (!user) {
            throw new BadGatewayException("User not found");
        }

        if (!user.isVerified) {
            throw new UnauthorizedException("Please verify your account first");
        }

        return user;
    }
}
