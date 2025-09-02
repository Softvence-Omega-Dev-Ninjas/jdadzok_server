import { Module } from "@nestjs/common";
import { NotificationModule } from "@project/lib/notification/notification.module";

@Module({
  imports: [NotificationModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class SharedGroupModule {}
