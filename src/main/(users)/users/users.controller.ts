import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import {
  Body,
  Controller,
  Delete,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { TUser } from "@project/@types";
import { GetUser, GetVerifiedUser, MakePublic } from "@project/common/jwt/jwt.decorator";
import { successResponse } from "@project/common/utils/response.util";
import { VerifyTokenDto } from "@project/main/(started)/auth/dto/verify-token.dto";
import { ResentOtpDto } from "./dto/resent-otp.dto";
import { CreateUserDto, UpdateUserDto } from "./dto/users.dto";
import { UserService } from "./users.service";

@Controller("users")
export class UserController {
  constructor(private readonly service: UserService) { }

  @MakePublic()
  @Post("register")
  @UsePipes(ValidationPipe)
  async register(@Body() body: CreateUserDto) {
    try {
      const result = await this.service.register(body);
      if (result["verificaiton"])
        return successResponse(result, "Please check your mail to verify OTP");
      return successResponse(result, "Registration successfull!");
    } catch (err) {
      return err;
    }
  }

  @Post("verify-account")
  @UsePipes(ValidationPipe)
  async verifyAccount(@Body() body: VerifyTokenDto) {
    try {
      const result = await this.service.verifyOpt(body);
      return successResponse(result, "User account verify successfully");
    } catch (err) {
      return err;
    }
  }

  @Post("resent-otp")
  async resentOtp(@Body() body: ResentOtpDto) {
    try {
      const result = await this.service.resnetOtp(body);
      return successResponse(
        result,
        "OTP resented please check your email and verify it",
      );
    } catch (err) {
      return err;
    }
  }

  @ApiBearerAuth()
  @Post("update")
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  async update(@GetUser() user: TUser, @Body() body: UpdateUserDto) {
    try {
      const result = await this.service.updateUser(user.userId, body);
      return successResponse(result, "User update successfully");
    } catch (err) {
      return err;
    }
  }

  // @ApiBearerAuth()
  // @Get("me")
  // @UsePipes(ValidationPipe)
  // @UseGuards(JwtAuthGuard)
  // async GetMe(@GetUser() user: TUser) {
  //   try {
  //     const result = await this.service.getMe(user.userId);
  //     return successResponse(result, "User profile retrive success");
  //   } catch (err) {
  //     return err;
  //   }
  // }

  @ApiBearerAuth()
  @Delete("delete")
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  async delete(@GetVerifiedUser() user: TUser) {
    try {
      const result = await this.service.deleteAcount(user.userId);
      return successResponse(result, "User account deleted success");
    } catch (err) {
      return err;
    }
  }
}
