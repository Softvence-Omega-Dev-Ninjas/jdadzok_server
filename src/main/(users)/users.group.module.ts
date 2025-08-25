import { Module } from "@nestjs/common";
import { UserModule } from "./users/users.module";

@Module({
    imports: [UserModule],
    controllers: [],
    providers: [],
    exports: []
})
export class UserGroupModule { }