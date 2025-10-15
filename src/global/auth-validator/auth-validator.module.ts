import { UserRepository } from "@module/(users)/users/users.repository";
import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtServices } from "@service/jwt.service";
import { AuthValidatorService } from "./auth-validator.service";

@Module({
    imports: [],
    providers: [AuthValidatorService, JwtService, JwtServices, UserRepository],
    exports: [AuthValidatorService],
})
export class AuthValidatorModule { }
