import { NotificationModule } from "@app/lib/notification/notification.module";
import { Module } from "@nestjs/common";

@Module({
    imports: [NotificationModule],
    controllers: [],
    providers: [],
    exports: [],
})
export class SharedGroupModule {}
