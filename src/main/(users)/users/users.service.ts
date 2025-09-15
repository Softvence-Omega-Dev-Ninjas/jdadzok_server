import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { TUser } from "@project/@types";
import { MailService } from "@project/lib/mail/mail.service";
import { OptService } from "@project/lib/utils/otp.service";
import { UtilsService } from "@project/lib/utils/utils.service";
import { VerifyTokenDto } from "@project/main/(started)/auth/dto/verify-token.dto";
import { JwtServices } from "@project/services/jwt.service";
import { omit } from "@utils/index";
import { ResentOtpDto } from "./dto/resent-otp.dto";
import { CreateUserDto, UpdateUserDto } from "./dto/users.dto";
import { UserRepository } from "./users.repository";

@Injectable()
export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly utilsService: UtilsService,
    private readonly jwtService: JwtServices,
    private readonly otpService: OptService,
    private readonly mailService: MailService,
  ) {}

  async register(body: CreateUserDto) {
    // has password if provider is email
    if (body.authProvider === "EMAIL") {
      if (!body.password)
        throw new ConflictException(
          "Password is required for email registration",
        );

      body.password = await this.utilsService.hash(body.password);
    }
    // if they select any other provider, we will not store password
    if (body.authProvider !== "EMAIL") delete body.password;
    // skip creating account now.
    const createdUser = await this.repository.store(body);
    if (!createdUser.isVerified) {
      // send otp again
      const otp = await this.sendOtpMail({
        email: body.email,
        userId: createdUser.id,
      });
      return {
        verificaiton: otp,
      };
    }

    const otp = await this.sendOtpMail({
      email: createdUser.email,
      userId: createdUser.id,
    });
    const accessToken = await this.jwtService.signAsync({
      email: createdUser.email,
      sub: createdUser.id,
      roles: createdUser.role,
    });
    return {
      accessToken,
      user: createdUser,
      verificaiton: otp,
    };
  }

  async verifyOpt(input: VerifyTokenDto) {
    const user = await this.repository.findById(input.userId);
    if (!user) throw new NotFoundException("User not found with that ID");

    if (user.isVerified)
      throw new ConflictException("Account already verified!");
    await this.otpService.verifyOtp({
      userId: user.id,
      token: input.token,
      type: "EMAIL_VERIFICATION",
    });

    // Update DB
    const updatedUser = await this.repository.update(input.userId, {
      isVerified: true,
    });
    // when user account verified then we will have to send create a token and send it to as response
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      roles: user.role,
      email: user.email,
    });
    return { user: omit(updatedUser, ["password"]), accessToken };
  }

  async resnetOtp(input: ResentOtpDto) {
    const user = await this.repository.findByEmail(input.email);
    if (!user) throw new NotFoundException("User not found with that email");

    // again send their otp
    const otp = await this.sendOtpMail({ userId: user.id, email: user.email });
    return otp;
  }

  async updateUser(userId: string, input: UpdateUserDto) {
    const user = await this.repository.findById(userId);
    if (!user) throw new NotFoundException("User not found!"); // not required for all the time
    // if update input has password then hash it
    if (input.password)
      input.password = await this.utilsService.hash(input.password!);

    return await this.repository.update(userId, input);
  }

  async deleteAcount(userId: string) {
    const user = await this.repository.findById(userId);
    if (!user) throw new NotFoundException("User not found!");

    await this.repository.delete(userId);
  }

  async getMe(userId: string) {
    return await this.repository.findById(userId);
  }

  private async sendOtpMail(user: Omit<TUser, "role">) {
    // make same innital email validation for send email
    if (!user.email.endsWith("@gmail.com"))
      throw new BadRequestException("Email must end with @gmail.com");
    const otp = await this.otpService.generateOtp({
      userId: user.userId,
      email: user.email,
      type: "EMAIL_VERIFICATION",
    });

    await this.mailService.sendMail(
      user.email,
      "Please verify your email with that otp",
      "otp",
      { otp: otp.token },
    );

    return otp;
  }
}
