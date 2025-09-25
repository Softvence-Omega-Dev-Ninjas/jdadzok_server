import { GetUser } from "@common/jwt/jwt.decorator";
import { Controller, Get, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { TUser } from "@project/@types";
import { successResponse } from "@project/common/utils/response.util";
import { JwtAuthGuard } from "@project/main/(started)/auth/guards/jwt-auth";
import { UserProfileService } from "./user.profile.service";

@ApiBearerAuth()
@Controller("user-profile")
export class UserProfileController {
    constructor(private readonly profileService: UserProfileService) {}

    @Get()
    @UsePipes(ValidationPipe)
    @UseGuards(JwtAuthGuard)
    async getProfile(@GetUser() user: TUser) {
        try {
            const profile = await this.profileService.get(user.userId);
            return successResponse(profile, "Profile retrive successfully");
        } catch (err) {
            return err;
        }
    }
}
