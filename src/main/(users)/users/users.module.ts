import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { MailService } from "@project/lib/mail/mail.service";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { OptService } from "@project/lib/utils/otp.service";
import { JwtServices } from "@project/services/jwt.service";
import { UserProfileModule } from "../user-profile/user.profile.module";
import { UserProfileRepository } from "../user-profile/user.profile.repository";
import { UserController } from "./users.controller";
import { UsersProcessor } from "./users.processor";
import { UserRepository } from "./users.repository";
import { UserService } from "./users.service";

@Module({
    imports: [BullModule.registerQueue({ name: "users" }), UserProfileModule],
    controllers: [UserController],
    providers: [
        UsersProcessor,
        JwtService,
        UserRepository,
        UserService,
        JwtServices,
        PrismaService,
        UserProfileRepository,
        OptService,
        MailService,
    ],
    exports: [UserRepository, UserService],
})
export class UserModule {}
