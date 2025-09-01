import { Module } from "@nestjs/common";
import { NotificationModule } from "@project/lib/notification/notification.module";
import { CategoryModule } from "./categories/category.module";

@Module({
  imports: [CategoryModule, NotificationModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class SharedGroupModule { }
