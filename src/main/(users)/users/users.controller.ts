import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
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
import { CreateUserDto, UpdateUserDto } from "./dto/users.dto";
import { UserService } from "./users.service";

@Controller("users")
export class UserController {
  constructor(private readonly service: UserService) {}

  @MakePublic()
  @Post("register")
  @UsePipes(ValidationPipe)
  async register(@Body() body: CreateUserDto) {
    try {
      const result = await this.service.register(body);
      return successResponse(result, "Registration successfull!");
    } catch (err) {
      console.log(err)
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
  @ApiBearerAuth()
  @Post("me")
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  async GetMe(@GetUser() user: TUser) {
    try {
      const result = await this.service.getMe(user.userId);
      return successResponse(result, "Registration successfull!");
    } catch (err) {
      return err;
    }
  }
}
