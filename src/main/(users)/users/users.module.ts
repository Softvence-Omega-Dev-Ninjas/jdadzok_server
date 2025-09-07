import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { RedisService } from "@project/common/redis/redis.service";
import { MailService } from "@project/lib/mail/mail.service";
import { OptService } from "@project/lib/utils/otp.service";
import { JwtServices } from "@project/services/jwt.service";
import { UserProfileRepository } from "../user-profile/user.profile.repository";
import { UserController } from "./users.controller";
import { UserRepository } from "./users.repository";
import { UserService } from "./users.service";

@Module({
  controllers: [UserController],
  providers: [
    RedisService,
    JwtService,
    UserRepository,
    UserService,
    JwtServices,
    UserProfileRepository,
    OptService,
    MailService
  ],
  exports: [UserRepository, UserService],
})
export class UserModule { }
