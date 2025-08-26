import { Module } from "@nestjs/common";
import { CategoryModule } from "./categories/category.module";

@Module({
  imports: [CategoryModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class SharedGroupModule {}
