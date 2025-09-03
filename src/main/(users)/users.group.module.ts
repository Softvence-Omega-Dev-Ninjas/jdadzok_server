import { Module } from "@nestjs/common";
import { UserProfileModule } from "./user-profile/user.profile.module";
import { UserModule } from "./users/users.module";

@Module({
  imports: [UserModule, UserProfileModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class UserGroupModule {}
