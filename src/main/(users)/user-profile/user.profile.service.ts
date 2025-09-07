import { Injectable } from "@nestjs/common";
import { UserProfileRepository } from "./user.profile.repository";

@Injectable()
export class UserProfileService {
  constructor(private readonly profileRepository: UserProfileRepository) {}

  async get(userId: string) {
    return await this.profileRepository.find(userId);
  }
}
