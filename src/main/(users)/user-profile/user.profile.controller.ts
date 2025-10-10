import { TUser } from "@app/@types";
import { successResponse } from "@app/common/utils/response.util";
import { JwtAuthGuard } from "@app/main/(started)/auth/guards/jwt-auth";
import { GetUser } from "@common/jwt/jwt.decorator";
import { Controller, Get, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
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
