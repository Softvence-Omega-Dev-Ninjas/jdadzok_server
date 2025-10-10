import { OptService } from "@app/lib/utils/otp.service";
import { UserProfileRepository } from "@app/main/(users)/user-profile/user.profile.repository";
import { UserRepository } from "@app/main/(users)/users/users.repository";
import { UserService } from "@app/main/(users)/users/users.service";
import { JwtServices } from "@app/services/jwt.service";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";
import jwtConfig from "./config/jwt.config";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
    imports: [
        BullModule.registerQueue({ name: "users" }),
        JwtModule.registerAsync(jwtConfig.asProvider()),
        ConfigModule.forFeature(jwtConfig),
        // ...refresh and google i mean rest of the config
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        AuthRepository,
        JwtServices,
        JwtService,
        JwtStrategy,
        UserProfileRepository,
        OptService,
        UserRepository,
        UserService,
    ],
    exports: [AuthRepository, AuthService, JwtModule, JwtStrategy],
})
export class AuthModule {}
