import { ValidateAuth, ValidateSuperAdmin } from "@common/jwt/jwt.decorator";
import { Body, Controller, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { MaintenanceSettingsDto } from "../dto/maintenance.dto";
import { PlatformInformationDto } from "../dto/platform-information.dto"; // ⬅️ Correct DTO
import { AdminSettingsService } from "../service/admin.settings.service";

@ApiTags("Dashboard Admin Settings")
@Controller("settings-admin")
export class AdminSettingsController {
    constructor(private readonly adminSettingsService: AdminSettingsService) {}

    // ------------------- Admin Settings general platform settings -------------------
    @ApiBearerAuth()
    @ValidateSuperAdmin()
    @ValidateAuth()
    @Post("platform")
    async updatePlatformInfo(@Body() body: PlatformInformationDto) {
        return this.adminSettingsService.updatePlatformInfo(body);
    }
    // --------- Admin Settings general platform settings -------------------
    @Post("maintenance")
    @ApiBearerAuth()
    @ValidateSuperAdmin()
    @ValidateAuth()
    async updateMaintenanceSettings(@Body() body: MaintenanceSettingsDto) {
        return this.adminSettingsService.updateMaintenanceSettings(body);
    }
}
