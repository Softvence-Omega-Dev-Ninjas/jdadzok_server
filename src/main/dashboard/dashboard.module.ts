import { Module } from "@nestjs/common";
import { DashboardController } from "./controller/dashboard.controller";
import { DashboardService } from "./service/dashboard.service";
import { CommunityNgoController } from "./controller/communityNgo.controller";
import { CommunityNgoService } from "./service/communityNgo.service";
import { EventController } from "./controller/event.controller";
import { EventService } from "./service/event.service";
import { MarketplaceManagementController } from "./controller/marketplaceManagement.controller";
import { MarketplaceManagementService } from "./service/marketplaceManagement.service";

@Module({
    controllers: [
        DashboardController,
        CommunityNgoController,
        EventController,
        MarketplaceManagementController,
    ],
    providers: [DashboardService, CommunityNgoService, EventService, MarketplaceManagementService],
})
export class DashboardModule {}
