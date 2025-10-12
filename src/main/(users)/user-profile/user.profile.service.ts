import { Injectable } from "@nestjs/common";
import { UpdateUserProfileDto } from "./dto/user.profile.dto";
import { UserProfileRepository } from "./user.profile.repository";

@Injectable()
export class UserProfileService {
    constructor(private readonly profileRepository: UserProfileRepository) { }

    async get(userId: string) {
        return await this.profileRepository.find(userId);
    }

    async updateUserProfile(userId: string, data: UpdateUserProfileDto) {
        return await this.profileRepository.updateUserProfile(userId, data)
    }
}
