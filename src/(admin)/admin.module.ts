import { Module } from "@nestjs/common";
import { OverviewModule } from './overview/overview.module';
import { SettingsModule } from './settings/settings.module';
import { PromotionsModule } from './promotions/promotions.module';

@Module({
    imports: [OverviewModule, SettingsModule, PromotionsModule],
    providers: [],
})
export class AdminModule { }