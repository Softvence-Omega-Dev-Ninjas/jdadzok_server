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
import { UserManagementController } from "./controller/userManagement.controller";
import { UserManagementService } from "./service/userManagement.service";
import { IncomeAnalyticController } from "./controller/incomeAnalytic.controller";
import { IncomeAnalyticService } from "./service/incomeAnalytic.service";

@Module({
    controllers: [
        DashboardController,
        UserManagementController,
        CommunityNgoController,
        EventController,
        MarketplaceManagementController,
        OrderTransactionController,
        IncomeAnalyticController,
    ],
    providers: [
        DashboardService,
        UserManagementService,
        CommunityNgoService,
        EventService,
        MarketplaceManagementService,
        OrderTransactionService,
        IncomeAnalyticService,
    ],
})
export class DashboardModule {}
