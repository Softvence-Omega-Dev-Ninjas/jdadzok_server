import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { MailService } from "@project/lib/mail/mail.service";
import { OptService } from "@project/lib/utils/otp.service";
import { JwtServices } from "@project/services/jwt.service";
import { UserProfileRepository } from "../user-profile/user.profile.repository";
import { UserController } from "./users.controller";
import { UsersProcessor } from "./users.processor";
import { UserRepository } from "./users.repository";
import { UserService } from "./users.service";

@Module({
    imports: [BullModule.registerQueue({ name: "users" })],
    controllers: [UserController],
    providers: [
        UsersProcessor,
        JwtService,
        UserRepository,
        UserService,
        JwtServices,
        UserProfileRepository,
        OptService,
        MailService,
    ],
    exports: [UserRepository, UserService],
})
export class UserModule { }
