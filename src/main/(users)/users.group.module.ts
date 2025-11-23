import { Module } from "@nestjs/common";
import { UserProfileModule } from "./user-profile/user.profile.module";
import { UserModule } from "./users/users.module";
import { PaymentMethodsModule } from "./payment-method/payment-method.module";
import { FollowModule } from "./follow/follow.module";
import { FriendRequestModule } from "./friend-request/friend-request.module";
import { ReportModule } from "./report/report.module";

@Module({
    imports: [
        UserModule,
        UserProfileModule,
        PaymentMethodsModule,
        FollowModule,
        FriendRequestModule,
        ReportModule,
    ],
    controllers: [],
    providers: [],
    exports: [],
})
export class UserGroupModule {}
