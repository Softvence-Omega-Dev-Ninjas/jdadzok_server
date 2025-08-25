import { UserRepository } from '@module/(users)/users/users.repository';
import {
    ForbiddenException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { MAIL_EXPIRE_TIME } from '@project/constants';
import { MailService } from '@project/lib/mail/mail.service';
import { UtilsService } from '@project/lib/utils/utils.service';
import { JwtServices } from '@project/services/jwt.service';
import { uniqueID } from 'dev-unique-id';
import { ForgetPasswordDto } from './dto/forget.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
    constructor(private readonly userRepository: UserRepository, private readonly utilsService: UtilsService, private readonly jwtService: JwtServices, private readonly mailService: MailService) { }


    async login(input: LoginDto) {
        const user = await this.userRepository.findByEmail(input.email)
        if (!user) throw new NotFoundException('User not found, Please sign up first')

        // compoare password if auth provider is email
        if (user.authProvider === "EMAIL" && user.passwordHash) {
            const isMatch = await this.utilsService.compare(user.passwordHash, input.passwordHash!)
            if (!isMatch) throw new ForbiddenException('Email or Password Invalid!')
        }

        const accessToken = await this.jwtService.signAsync({ sub: user.id, roles: user.role, email: user.email });


        return {
            accessToken,
            user: {
                user
            },
        };
    }
    async forgetPassword(input: ForgetPasswordDto) {
        const user = await this.userRepository.findByEmail(input.email);
        if (!user) throw new NotFoundException('User not found');
        const expireDate = new Date();
        // expire time will be only 5 minutes
        expireDate.setMinutes(expireDate.getMinutes() + MAIL_EXPIRE_TIME); // expire time is 5 minutes

        const token = uniqueID({ length: 6, alphabet: true });
        console.log(token)

        //TODO: send token via email
        const sendMail = await this.mailService.forgetPasswordMail(user.email, token);
        if (!sendMail) throw new ForbiddenException('Error sending email, Please try again later');
    }

    async resetPassword(input: ResetPasswordDto) {
        const user = await this.userRepository.findByEmail(input.email);
        if (!user) throw new NotFoundException('User not found');

        const hash = await this.utilsService.hash(input.password);

        // update the user password with that hash password
        return await this.userRepository.update(user.id, { passwordHash: hash });
    }

    async logout(email: string) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) throw new NotFoundException('User not found');
    }

    //   async forgetPassword(payload: ForgetPasswordAuthDto) {
    //     const user = await this.dbService.user.findUnique({
    //       where: {
    //         email: payload.email,
    //       },
    //     });

    //     if (!user) {
    //       throw new NotFoundException('User not exists!');
    //     }

    //     const generatedOtp = this.mailService.generateNumericCode(6);

    //     await this.dbService.user.update({
    //       where: { id: user.id },
    //       data: {
    //         otp: generatedOtp,
    //       },
    //     });

    //     const text = `
    //       You requested to reset your password.

    //       Your OTP (One-Time Password) is: ${generatedOtp}

    //       Please enter this code in the app to complete your password reset.

    //       This code is valid for the next 10 minutes. If you did not request this, please ignore this email.
    //     `;
    //     const html = `
    //       <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
    //         <p>You requested to reset your password.</p>
    //         <p><strong>Your OTP (One-Time Password) is:</strong></p>
    //         <div style="font-size: 20px; font-weight: bold; margin: 10px 0; color: #2c3e50;">${generatedOtp}</div>
    //         <p>Please enter this code in the app to complete your password reset.</p>
    //         <p style="color: #999;">This code is valid for the next 10 minutes.</p>
    //         <p>If you did not request this, please ignore this email.</p>
    //       </div>
    //     `;

    //     await this.mailService.sendMail(
    //       user.email,
    //       'Password Reset OTP',
    //       text,
    //       html,
    //     );

    //     //generate jwt token
    //     const jwtPayload = {
    //       id: user.id,
    //     };

    //     const resetToken = await this.jwtService.signAsync(jwtPayload, {
    //       expiresIn: '10m',
    //     });

    //     return {
    //       resetToken,
    //     };
    //   }

    //   async verifyOtp(payload: VerifyOtpAuthDto) {
    //     const isVerified = await this.jwtService.verifyAsync(payload.resetToken);

    //     if (!isVerified) {
    //       throw new ForbiddenException('Invalid token!');
    //     }

    //     const decode = await this.jwtService.decode(payload.resetToken);
    //     const user = await this.dbService.user.findUnique({
    //       where: {
    //         id: decode.id,
    //       },
    //     });

    //     if (!user) {
    //       throw new ForbiddenException('Something went wrong, try again!');
    //     }

    //     if (user.otp !== payload.otp) {
    //       throw new ForbiddenException('OTP not matched!');
    //     }

    //     await this.dbService.user.update({
    //       where: { id: user.id },
    //       data: {
    //         otp: null,
    //       },
    //     });

    //     const jwtPayload = {
    //       id: user.id,
    //     };

    //     // generate token
    //     const resetToken = await this.jwtService.signAsync(jwtPayload, {
    //       expiresIn: this.config.getOrThrow('RESET_TOKEN_EXPIRES_IN'),
    //     });

    //     return {
    //       resetToken,
    //     };
    //   }

    //   async resetPassword(payload: ResetPasswordAuthDto) {
    //     const isVerified = await this.jwtService.verifyAsync(payload.resetToken);

    //     if (!isVerified) {
    //       throw new ForbiddenException('Invalid token!');
    //     }
    //     // decode token
    //     const decode = await this.jwtService.decode(payload.resetToken);
    //     const user = await this.dbService.user.findUnique({
    //       where: {
    //         id: decode.id,
    //       },
    //     });

    //     if (!user) {
    //       throw new NotFoundException('Something went wrong!');
    //     }

    //     const hashedPassword = await this.libService.hashPassword({
    //       password: payload.password,
    //     });

    //     await this.dbService.user.update({
    //       where: {
    //         email: user.email,
    //       },
    //       data: {
    //         password: hashedPassword,
    //       },
    //     });

    //     return;
    //   }

    //   async changePassword(user, payload: ChangePasswordAuthDto) {
    //     const userData = await this.dbService.user.findUnique({
    //       where: {
    //         id: user.id,
    //       },
    //     });

    //     if (!userData) {
    //       throw new NotFoundException('Something went wrong!');
    //     }

    //     const matched = await this.libService.comparePassword({
    //       hashedPassword: userData.password,
    //       password: payload.oldPassword,
    //     });

    //     if (!matched) {
    //       throw new ForbiddenException('Old password not matched!');
    //     }

    //     const hashedPassword = await this.libService.hashPassword({
    //       password: payload.password,
    //     });

    //     await this.dbService.user.update({
    //       where: { id: user.id },
    //       data: {
    //         password: hashedPassword,
    //       },
    //     });

    //     return;
    //   }

    //   async remove(user) {
    //     const userData = await this.dbService.user.findUnique({
    //       where: { id: user.id },
    //     });

    //     if (!userData) {
    //       throw new NotFoundException('User not found!');
    //     }

    //     await this.dbService.user.delete({
    //       where: { id: user.id },
    //     });

    //     return;
    //   }
}
