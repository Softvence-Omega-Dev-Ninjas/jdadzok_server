import { Body, Controller, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { MakePublic } from "@project/common/jwt/jwt.decorator";
import { successResponse } from "@project/common/utils/response.util";
import { CreateUserDto } from "./dto/users.dto";
import { UserService } from "./users.service";

@Controller("users")
export class UserController {
    constructor(private readonly service: UserService) { }

    @MakePublic()
    @Post('register')
    @UsePipes(ValidationPipe)
    async register(@Body() body: CreateUserDto) {
        try {
            const result = await this.service.register(body);
            return successResponse(result, 'Registration successfull!');
        } catch (err) {
            console.log(err)
            return err
        }
    }

}