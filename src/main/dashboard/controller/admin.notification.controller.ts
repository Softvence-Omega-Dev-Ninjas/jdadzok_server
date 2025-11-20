import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CustomNotificationDto } from "../dto/custom-notification.dto";
import { AdminNotificationService } from "../service/admin.notification.service";

@ApiTags("Notification & Announcement Management")
@Controller("notification-admin")
export class AdminNotificationController {
    constructor(private readonly adminNotificationService: AdminNotificationService) {}
    @ApiOperation({ summary: "Super Admin: create custom notification" })
    // @ApiBearerAuth()
    // @ValidateSuperAdmin()
    // @ValidateAuth()
    @Post("custom-notification")
    async sendCustomNotification(@Body() dto: CustomNotificationDto) {
        return this.adminNotificationService.sendCustomNotification(dto);
    }

    @ApiOperation({ summary: "Get notification stats: total, read, rate, last month" })
    @Get("stats")
    async getStats() {
        return this.adminNotificationService.getNotificationStats();
    }
}
