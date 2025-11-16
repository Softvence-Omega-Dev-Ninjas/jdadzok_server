import { Module } from "@nestjs/common";
import { DashboardController } from "./controller/dashboard.controller";
import { DashboardService } from "./service/dashboard.service";
import { CommunityNgoController } from "./controller/communityNgo.controller";
import { CommunityNgoService } from "./service/communityNgo.service";
import { EventController } from "./controller/event.controller";
import { EventService } from "./service/event.service";

@Module({
    controllers: [DashboardController, CommunityNgoController, EventController],
    providers: [DashboardService, CommunityNgoService, EventService],
})
export class DashboardModule {}
