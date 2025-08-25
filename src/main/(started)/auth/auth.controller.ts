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
import { GetUser, MakePublic } from "@project/common/jwt/jwt.decorator";
import { successResponse } from "@project/common/utils/response.util";
import { AuthService } from "./auth.service";
import { ForgetPasswordDto } from "./dto/forget.dto";
import { LoginDto } from "./dto/login.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { JwtAuthGuard } from "./guards/jwt-auth";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MakePublic()
  @Post("login")
  @UsePipes(ValidationPipe)
  async login(@Body() loginAuthDto: LoginDto) {
    try {
      const result = await this.authService.login(loginAuthDto);
      return successResponse(result, "Login successfull!");
    } catch (err) {
      return err;
    }
  }

  @Post("logout")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async logout(@GetUser() user: TUser) {
    try {
      await this.authService.logout(user.email);
      return successResponse(null, "Logout successful!");
    } catch (err) {
      return err;
    }
  }

  @MakePublic()
  @Post("forget-password")
  async forgetPassword(@Body() body: ForgetPasswordDto) {
    try {
      const result = await this.authService.forgetPassword(body);
      return successResponse(
        result,
        "Password reset email sent successfully! Please check your mail.",
      );
    } catch (err) {
      return err;
    }
  }

  @MakePublic()
  @Post("resent-code")
  async resentCode(@Body() body: ForgetPasswordDto) {
    try {
      const result = await this.authService.forgetPassword(body);
      return successResponse(
        result,
        "Resend code email sent successfully! Please check your mail.",
      );
    } catch (err) {
      return err;
    }
  }

  @MakePublic()
  @Post("reset-password")
  async resetPassword(@Body() payload: ResetPasswordDto) {
    try {
      const result = await this.authService.resetPassword(payload);
      return successResponse(result, "Password was reset successfully!");
    } catch (err) {
      return err;
    }
  }

  //   @ApiSecurity('accessToken')
  //   @Delete()
  //   async delete(@Req() req: any) {
  //     const result = await this.authService.remove(req.user);
  //     return successResponse(result, 'Account deleted successfully!');
  //   }
}
