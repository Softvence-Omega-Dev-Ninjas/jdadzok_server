import { AuthValidatorService } from "@global/auth-validator/auth-validator.service";
import { UserProfileRepository } from "@module/(users)/user-profile/user.profile.repository";
import { UserRepository } from "@module/(users)/users/users.repository";
import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtServices } from "@service/jwt.service";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";

@Module({
    imports: [],
    controllers: [],
    providers: [
        JwtService,
        UserProfileRepository,
        UserRepository,
        JwtServices,
        AuthValidatorService, ChatService, ChatGateway],
    exports: [],
})
export class ChatModule { }
