import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UtilsService } from "@project/lib/utils/utils.service";
import { JwtServices } from "@project/services/jwt.service";
import { CreateUserDto, UpdateUserDto } from "./dto/users.dto";
import { UserRepository } from "./users.repository";

@Injectable()
export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly utilsService: UtilsService,
    private readonly jwtService: JwtServices,
  ) { }

  async register(body: CreateUserDto) {
    // check if user already exit or not
    const user = await this.repository.findByEmail(body.email);
    if (user)
      throw new ConflictException("User email already exist, please login");

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
}
