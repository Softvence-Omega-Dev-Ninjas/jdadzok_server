import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { RedisService } from "@project/common/redis/redis.service";
import { OptService } from "@project/lib/utils/otp.service";
import { UserProfileRepository } from "@project/main/(users)/user-profile/user.profile.repository";
import { UserRepository } from "@project/main/(users)/users/users.repository";
import { UserService } from "@project/main/(users)/users/users.service";
import { JwtServices } from "@project/services/jwt.service";
import { AuthController } from "./auth.controller";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";
import jwtConfig from "./config/jwt.config";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    // ...refresh and google i mean rest of the config
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    RedisService,
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
