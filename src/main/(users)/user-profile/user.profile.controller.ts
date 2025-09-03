import { GetUser } from "@common/jwt/jwt.decorator";
import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { TUser } from "@project/@types";
import { successResponse } from "@project/common/utils/response.util";
import { JwtAuthGuard } from "@project/main/(started)/auth/guards/jwt-auth";
import { CreateUserProfileDto } from "./dto/user.profile.dto";
import { UserProfileService } from "./user.profile.service";

@ApiBearerAuth()
@Controller("user-profile")
export class UserProfileController {
  constructor(private readonly profileService: UserProfileService) {}

  @Post()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  async createOrUpdateUserProfile(
    @GetUser() user: TUser,
    @Body() body: CreateUserProfileDto,
  ) {
    try {
      const profile = await this.profileService.create(user.userId, body);
      return successResponse(profile, "Profile update successfully");
    } catch (err) {
      return err;
    }
  }

  async getProfile(@GetUser() user: TUser) {
    try {
      const profile = await this.profileService.get(user.userId);
      return successResponse(profile, "Profile retrive successfully");
    } catch (err) {
      return err;
    }
  }
}
