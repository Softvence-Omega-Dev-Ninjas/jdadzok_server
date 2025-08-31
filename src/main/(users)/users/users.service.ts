import { Body, ConflictException, Injectable } from "@nestjs/common";
import { UtilsService } from "@project/lib/utils/utils.service";
import { JwtServices } from "@project/services/jwt.service";
import { CreateUserDto } from "./dto/users.dto";
import { UserRepository } from "./users.repository";

@Injectable()
export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly utilsService: UtilsService,
    private readonly jwtService: JwtServices,
  ) {}

  async register(@Body() body: CreateUserDto) {
    // check if user already exit or not
    const user = await this.repository.findByEmail(body.email);
    if (user)
      throw new ConflictException("User email already exist, please login");

    // has password if provider is email
    if (body.authProvider === "EMAIL") {
      if (!body.passwordHash)
        throw new ConflictException(
          "Password is required for email registration",
        );

      body.passwordHash = await this.utilsService.hash(body.passwordHash);
    }
    // if they select any other provider, we will not store password
    if (body.authProvider !== "EMAIL") delete body.passwordHash;
    const createdUser = await this.repository.store(body);

    const accessToken = await this.jwtService.signAsync({
      email: createdUser.email,
      sub: createdUser.id,
      roles: createdUser.role,
    });

    return {
      accessToken,
      user: createdUser,
    };
  }
}
