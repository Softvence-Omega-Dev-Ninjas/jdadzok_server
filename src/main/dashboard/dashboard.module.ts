import { Module } from "@nestjs/common";
import { DashboardController } from "./controller/dashboard.controller";
import { DashboardService } from "./service/dashboard.service";
import { CommunityNgoController } from "./controller/communityNgo.controller";
import { CommunityNgoService } from "./service/communityNgo.service";
import { EventController } from "./controller/event.controller";
import { EventService } from "./service/event.service";
import { MarketplaceManagementController } from "./controller/marketplaceManagement.controller";
import { MarketplaceManagementService } from "./service/marketplaceManagement.service";
import { OrderTransactionController } from "./controller/orderTransaction.controller";
import { OrderTransactionService } from "./service/orderTransation.service";

@Module({
    controllers: [
        DashboardController,
        CommunityNgoController,
        EventController,
        MarketplaceManagementController,
        OrderTransactionController,
    ],
    providers: [
        DashboardService,
        CommunityNgoService,
        EventService,
        MarketplaceManagementService,
        OrderTransactionService,
    ],
})
export class DashboardModule {}
