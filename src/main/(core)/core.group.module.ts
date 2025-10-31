import { Module } from "@nestjs/common";
// import { VolunteerModule } from "../volunteer/volunteer.module";
import { CapLevelModule } from "./cap-level/cap-leve.module";
import { CommunityModule } from "./community/community.module";
import { FeedModule } from "./feeds/feed.module";
import { RevenueModule } from "./revenue/revenue.module";

@Module({
    imports: [CapLevelModule, RevenueModule, FeedModule, CommunityModule],
    controllers: [],
    providers: [],
    exports: [],
})
export class CoreGroupModule {}
