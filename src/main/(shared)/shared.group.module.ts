import { Module } from "@nestjs/common";
import { NotificaitonsModule } from "./notifications/notifications.module";

@Module({
    imports: [NotificaitonsModule],
    controllers: [],
    providers: [],
    exports: [NotificaitonsModule],
})
export class SharedGroupModule {}
