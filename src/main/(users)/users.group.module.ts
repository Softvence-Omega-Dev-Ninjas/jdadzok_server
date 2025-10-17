import { Module } from "@nestjs/common";
import { FollowModule } from "./follow-unfollow/follow-unfollow.module";
import { UserProfileModule } from "./user-profile/user.profile.module";
import { UserModule } from "./users/users.module";

@Module({
    imports: [UserModule, UserProfileModule, FollowModule],
    controllers: [],
    providers: [],
    exports: [],
})
export class UserGroupModule { }
