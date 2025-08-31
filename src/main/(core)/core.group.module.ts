import { Module } from "@nestjs/common";
import { CapLevelModule } from "./cap-level/cap-leve.module";
import { FeedModule } from "./feeds/feed.module";

@Module({
  imports: [CapLevelModule, FeedModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class CoreGroupModule {}
