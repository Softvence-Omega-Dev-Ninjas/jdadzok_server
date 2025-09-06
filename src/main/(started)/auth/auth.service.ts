import { RedisService } from "@common/redis/redis.service";
import { UserRepository } from "@module/(users)/users/users.repository";
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { TTL } from "@project/constants/ttl.constants";
import { MailService } from "@project/lib/mail/mail.service";
import { UtilsService } from "@project/lib/utils/utils.service";
import { JwtServices } from "@project/services/jwt.service";
import { omit } from "@project/utils";
import { uniqueID } from "dev-unique-id";
import { AuthRedisData } from "../@types";
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
    private readonly redisService: RedisService,
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
  // TODO: need to be create a reuseable function for otp verification
  async forgetPassword(input: ForgetPasswordDto) {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) throw new NotFoundException("User not found");

    const isTokenInRedis = await this.redisService.get<AuthRedisData>(
      "RESET_PASSWORD_TOKEN",
      user.id,
    );
    if (isTokenInRedis && isTokenInRedis.email === user.email)
      throw new ForbiddenException("You can request new token after some time");

    const expireDate = new Date();
    expireDate.setMinutes(expireDate.getMinutes() + TTL["5m"]); // expire time is 1 minutes

    const token = uniqueID({ length: 6, alphabet: true });
    // store token, expireDate, email, and user id to the redis for tracking
    await this.redisService.set(
      "RESET_PASSWORD_TOKEN",
      {
        token,
        expireDate,
        email: user.email,
        attempt: 0,
        userId: user.id,
      },
      "5m",
      user.id,
    );

    const sendMail = await this.mailService.forgetPasswordMail(
      user.email,
      token,
    );
    if (!sendMail)
      throw new ForbiddenException(
        "Error sending email, Please try again later",
      );
    const obj = {
      token,
      expireDate,
      email: user.email,
      attempt: 0,
      userId: user.id,
      message: "Please pass userId to veryfy token",
    };
    return obj;
  }

  async verify(input: VerifyTokenDto) {
    const storage = await this.redisService.get<AuthRedisData>(
      "RESET_PASSWORD_TOKEN",
      input.userId,
    );
    if (!storage)
      throw new ForbiddenException("Token expired please send again");

    if (Number(storage.token) !== input.token) {
      await this.redisService.set("RESET_PASSWORD_TOKEN", {
        ...storage,
        attempt: storage.attempt + 1,
      });
      throw new ForbiddenException("Invalid token, fail to verify");
    }
    if (storage.attempt >= 5)
      throw new ForbiddenException("Too many attempts, please try again later");

    return "Token verify successfully";
  }

  async resetPassword(input: ResetPasswordDto) {
    const user = await this.userRepository.findById(input.userId);
    if (!user) throw new NotFoundException("User not found");

    // check token is already expired or not
    const redisData = await this.redisService.get<AuthRedisData>(
      "RESET_PASSWORD_TOKEN",
      user.id,
    );
    if (!redisData || redisData.expireDate < new Date())
      throw new ForbiddenException("Invalid or expired token");

    // check the generated token and the user input token is same or not
    const hash = await this.utilsService.hash(input.password);

    // update the user password with that hash password
    return await this.userRepository.update(user.id, { password: hash });
  }
  async logout(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new NotFoundException("User not found");
  }
}
