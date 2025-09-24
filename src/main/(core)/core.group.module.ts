import { Module } from "@nestjs/common";
import { CapLevelModule } from "./cap-level/cap-leve.module";
import { FeedModule } from "./feeds/feed.module";
import { RevenueModule } from "./revenue/revenue.module";

@Module({
    imports: [CapLevelModule, RevenueModule, FeedModule],
    controllers: [],
    providers: [],
    exports: [],
})
export class CoreGroupModule {}
