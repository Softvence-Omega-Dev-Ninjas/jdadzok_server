import {
    Body,
    Controller,
    Post,
    Req,
    UseGuards,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { MakePublic } from '@project/common/jwt/jwt.decorator';
import { RequestWithUser } from '@project/common/jwt/jwt.interface';
import { successResponse } from '@project/common/utils/response.util';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @MakePublic()
    @Post('login')
    @UsePipes(ValidationPipe)
    async login(@Body() loginAuthDto: LoginDto) {
        try {
            const result = await this.authService.login(loginAuthDto);
            return successResponse(result, 'Login successfull!');
        } catch (err) {
            return err
        }
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    logout(@Req() req: RequestWithUser) {

        console.log(req.user)
        try {
            return successResponse(null, 'Logout successful!');
        } catch (err) {
            return err
        }
    }

    //   @MakePublic()
    //   @Post('forget-password')
    //   async forgetPassword(@Body() payload: any) {
    //     const result = await this.authService.forgetPassword(payload);
    //     return successResponse(result, 'Email sent successfully!');
    //   }

    //   @MakePublic()
    //   @Post('reset-password')
    //   async resetPassword(@Body() payload: any) {
    //     const result = await this.authService.resetPassword(payload);
    //     return successResponse(result, 'Password was reset successfully!');
    //   }

    //   @ApiSecurity('accessToken')
    //   @Patch('change-password')
    //   async changePassword(@Req() req: any, @Body() payload: any) {
    //     const result = await this.authService.changePassword(req.user, payload);
    //     return successResponse(result, 'Password updated successfully!');
    //   }

    //   @MakePublic()
    //   @Post('verify-otp')
    //   async verifyOtp(@Body() payload: any) {
    //     const result = await this.authService.verifyOtp(payload);
    //     return successResponse(result, 'OTP verified successfully!');
    //   }

    //   @ApiSecurity('accessToken')
    //   @Delete()
    //   async delete(@Req() req: any) {
    //     const result = await this.authService.remove(req.user);
    //     return successResponse(result, 'Account deleted successfully!');
    //   }
}
