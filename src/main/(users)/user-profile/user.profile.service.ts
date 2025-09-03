import { ConflictException, Injectable } from "@nestjs/common";
import { UserRepository } from "../users/users.repository";
import { CreateUserProfileDto } from "./dto/user.profile.dto";
import { UserProfileRepository } from "./user.profile.repository";

@Injectable()
export class UserProfileService {
  constructor(
    private readonly profileRepository: UserProfileRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async create(userId: string, input: CreateUserProfileDto) {
    if (!input.name) throw new ConflictException("Profile name is required");
    const isUser = await this.userRepository.findById(userId); // fetch user for getting all info
    // check if user already has profile then update it
    // if not then create new profile with that input
    if (isUser?.profile) {
      return await this.profileRepository.update(userId, input);
    }
    // create new one
    return await this.profileRepository.create(userId, input);
  }

  async get(userId: string) {
    return await this.profileRepository.find(userId);
  }
}
