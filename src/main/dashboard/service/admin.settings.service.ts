import { HandleError } from "@common/error/handle-error.decorator";
import { PrismaService } from "@lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

import { MaintenanceSettingsDto } from "../dto/maintenance.dto";
import { PlatformInformationDto } from "../dto/platform-information.dto";
@Injectable()
export class AdminSettingsService {
    constructor(
        private readonly prisma: PrismaService,

    ) { }


    // ---------------admin platform info-----------------------
    @HandleError("Failed to update platform information")
    async updatePlatformInfo(dto: PlatformInformationDto) {
        let platformInfo = await this.prisma.platformInformation.findFirst();

        if (!platformInfo) {
            return this.prisma.platformInformation.create({
                data: {
                    platformName: dto.platformName ?? null,
                    supportEmail: dto.supportEmail ?? null,
                    platformUrl: dto.platformUrl ?? null,
                },
            });
        }

        return this.prisma.platformInformation.update({
            where: { id: platformInfo.id },
            data: {
                platformName: dto.platformName ?? null,
                supportEmail: dto.supportEmail ?? null,
                platformUrl: dto.platformUrl ?? null,
            },
        });
    }



    // --------------------------------update maintenance settings------------------

    @HandleError("Failed to update maintenance settings")
    async updateMaintenanceSettings(dto: MaintenanceSettingsDto) {
        // Ensure table has only one row
        let settings = await this.prisma.maintenanceModel.findFirst();

        if (!settings) {
            settings = await this.prisma.maintenanceModel.create({
                data: {
                    maxEventsPerCommunity: dto.maxEventsPerCommunity ?? null,
                    MaxPostPerDay: dto.MaxPostPerDay ?? null,
                },
            });
            return { message: "Maintenance settings created", settings };
        }

        const updated = await this.prisma.maintenanceModel.update({
            where: { id: settings.id },
            data: {
                maxEventsPerCommunity: dto.maxEventsPerCommunity ?? settings.maxEventsPerCommunity,
                MaxPostPerDay: dto.MaxPostPerDay ?? settings.MaxPostPerDay,
            },
        });

        return {
            message: "Maintenance settings updated successfully",
            settings: updated
        };
    }

}
