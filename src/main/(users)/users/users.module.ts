import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtServices } from "@project/services/jwt.service";
import { UserProfileRepository } from "../user-profile/user.profile.repository";
import { UserController } from "./users.controller";
import { UserRepository } from "./users.repository";
import { UserService } from "./users.service";

@Module({
  controllers: [UserController],
  providers: [
    JwtService,
    UserRepository,
    UserService,
    JwtServices,
    UserProfileRepository,
  ],
  exports: [UserRepository, UserService],
})
export class UserModule {}
