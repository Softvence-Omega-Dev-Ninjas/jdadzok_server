import { Module } from "@nestjs/common";

import { CallModule } from "./calling/calling.module";
import { NotificaitonsModule } from "./notifications/notifications.module";

@Module({
    imports: [NotificaitonsModule, CallModule],
    controllers: [],
    providers: [],
    exports: [NotificaitonsModule, CallModule],
})
export class SharedGroupModule {}
