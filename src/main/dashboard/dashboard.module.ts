import { Module } from "@nestjs/common";
import { DashboardController } from "./controller/dashboard.controller";
import { DashboardService } from "./service/dashboard.service";
import { CommunityNgoController } from "./controller/communityNgo.controller";
import { CommunityNgoService } from "./service/communityNgo.service";

@Module({
    controllers: [DashboardController, CommunityNgoController],
    providers: [DashboardService, CommunityNgoService],
})
export class DashboardModule {}
