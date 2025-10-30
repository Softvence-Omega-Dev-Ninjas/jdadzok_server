import { Module } from "@nestjs/common";
import { UserProfileModule } from "./user-profile/user.profile.module";
import { UserModule } from "./users/users.module";
import { PaymentMethodsModule } from "./payment-method/payment-method.module";
import { FollowModule } from "./follow/follow.module";

@Module({
    imports: [UserModule, UserProfileModule, PaymentMethodsModule, FollowModule],
    controllers: [],
    providers: [],
    exports: [],
})
export class UserGroupModule {}
