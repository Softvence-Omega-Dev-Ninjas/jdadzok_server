import { UserRepository } from "@module/(users)/users/users.repository";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { TUser } from "@project/@types";
import { MailService } from "@project/lib/mail/mail.service";
import { OptService } from "@project/lib/utils/otp.service";
import { UtilsService } from "@project/lib/utils/utils.service";
import { ResentOtpDto } from "@project/main/(users)/users/dto/resent-otp.dto";
import { JwtServices } from "@project/services/jwt.service";
import { omit } from "@project/utils";
import { ForgetPasswordDto } from "./dto/forget.dto";
import { LoginDto } from "./dto/login.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { VerifyTokenDto } from "./dto/verify-token.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly utilsService: UtilsService,
    private readonly jwtService: JwtServices,
    private readonly mailService: MailService,
    private readonly otpService: OptService,
  ) {}

  async login(input: LoginDto) {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user)
      throw new NotFoundException("User not found, Please sign up first");

    // compoare password if auth provider is email
    if (user.authProvider === "EMAIL" && user.password) {
      const isMatch = await this.utilsService.compare(
        user.password,
        input.password!,
      );
      if (!isMatch) throw new ForbiddenException("Email or Password Invalid!");
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      roles: user.role,
      email: user.email,
    });

    return {
      accessToken,
      user: omit(user, ["password"]),
    };
  }

  async forgetPassword(input: ForgetPasswordDto) {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) throw new NotFoundException("User not found");

    const otp = await this.sendOtpMail({ email: user.email, userId: user.id });
    return otp;
  }

  async verify(input: VerifyTokenDto) {
    await this.otpService.verifyOtp(
      {
        userId: input.userId,
        token: input.token,
        type: "RESET_PASSWORD",
      },
      false,
    );

    return {
      message: "OTP verified, continue to reset password",
    };
  }

  async resnetOtp(input: ResentOtpDto) {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) throw new NotFoundException("User not found with that email");

    // again send their otp
    const otp = await this.sendOtpMail({ userId: user.id, email: user.email });
    return otp;
  }

  async resetPassword(input: ResetPasswordDto) {
    const user = await this.userRepository.findById(input.userId);
    if (!user) throw new NotFoundException("User not found with that ID");

    const otp = await this.otpService.getToken({
      type: "RESET_PASSWORD",
      userId: user.id,
    });
    if (!otp)
      throw new BadRequestException(
        "OTP invalid or expire please verify OTP first",
      );

    const hash = await this.utilsService.hash(input.password);

    // update the user password with that hash password
    const updatedUser = await this.userRepository.update(user.id, {
      password: hash,
    });
    await this.otpService.delete({ type: "RESET_PASSWORD", userId: user.id });
    return updatedUser;
  }

  async logout(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  private async sendOtpMail(user: Omit<TUser, "role">) {
    const otp = await this.otpService.generateOtp({
      userId: user.userId,
      email: user.email,
      type: "RESET_PASSWORD",
    });

    await this.mailService.sendMail(
      user.email,
      "Please verify token to reset password",
      "otp",
      { otp: otp.token },
    );
    return otp;
  }
}
