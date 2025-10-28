import { Module } from "@nestjs/common";
import { FollowUnfollowModule } from "./follow-unfollow/follow-unfollow.module";
import { UserProfileModule } from "./user-profile/user.profile.module";
import { UserModule } from "./users/users.module";
import { PaymentMethodsModule } from "./payment-method/payment-method.module";

@Module({
    imports: [UserModule, UserProfileModule, FollowUnfollowModule, PaymentMethodsModule],
    controllers: [],
    providers: [],
    exports: [],
})
export class UserGroupModule {}
