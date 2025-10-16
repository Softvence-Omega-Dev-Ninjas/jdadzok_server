import { GetUser } from "@common/jwt/jwt.decorator";
import { successResponse } from "@common/utils/response.util";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import { Body, Controller, Get, Put, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { TUser } from "@type/index";
import { UpdateUserProfileDto } from "./dto/user.profile.dto";
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

    @Put("")
    @UsePipes(ValidationPipe)
    @UseGuards(JwtAuthGuard)
    async updateProfile(@GetUser() user: TUser, @Body() data: UpdateUserProfileDto) {
        try {
            const profile = await this.profileService.updateUserProfile(user.userId, data);
            return successResponse(profile, "Profile update successfully");
        } catch (err) {
            return err;
        }
    }
}
