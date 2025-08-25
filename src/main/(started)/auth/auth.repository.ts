import { UserRepository } from "@module/(users)/users/users.repository";
import { Injectable, NotFoundException } from "@nestjs/common";
import { UtilsService } from "@project/lib/utils/utils.service";

@Injectable()
export class AuthRepository {
    constructor(private readonly userRepository: UserRepository, private readonly utilityService: UtilsService) { }

    async validateUserWithPassword(email: string, password: string) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) throw new NotFoundException("User not found with that email");
        const compare = await this.utilityService.compare(user.passwordHash!, password);
        if (!compare) throw new NotFoundException("Invalid credentials");
        return user
    }
}