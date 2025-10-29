import { GetUser, GetVerifiedUser } from "@common/jwt/jwt.decorator";
import { successResponse } from "@common/utils/response.util";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import { Body, Controller, Get, Put, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { TUser, VerifiedUser } from "@type/index";
import { CreateUserProfileDto } from "./dto/user.profile.dto";
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
    async updateProfile(@GetVerifiedUser() user: VerifiedUser, @Body() data: CreateUserProfileDto) {
        try {
            const profile = await this.profileService.updateUserProfile(user.id, data);
            return successResponse(profile, "Profile update successfully");
        } catch (err) {
            return err;
        }
    }
}
