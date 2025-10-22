import { GetUser, Roles } from "@common/jwt/jwt.decorator";
import { TResponse } from "@common/utils/response.util";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import { Body, Controller, Get, Patch, Put, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { TUser } from "@type/index";
import { NotificationToggleDto } from "./dto/notification-toggle";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
export class NotificaitonsController {
    constructor(private readonly NotificationsService: NotificationsService) { }

    @UseGuards(JwtAuthGuard)
    async fetchSystemAdminNotificaiton(@GetUser() user: TUser) {
        try {
            console.info(user);
            return "system admin notificaiton";
        } catch (err) {
            return err;
        }
    }

    @Put("mark-as-read")
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    async markAsRead(@GetUser() user: TUser) {
        try {
            console.info(user);
            return "make as reads";
        } catch (err) {
            return err;
        }
    }


    @ApiBearerAuth()
    @UsePipes(ValidationPipe)
    @UseGuards(JwtAuthGuard)
    @Get()
    async getNotificationSetting(
        @GetUser('userId') userId: string,
    ): Promise<TResponse<any>> {
        return await this.NotificationsService.getNotificationSetting(userId);
    }
    //  user change notification setting ON

    @ApiOperation({
        summary: 'Toggle notification setting on',
        description: 'Toggle notification setting on',
    })
    @ApiBearerAuth()
    @UsePipes(ValidationPipe)
    @UseGuards(JwtAuthGuard)
    @Patch('change-setting')
    async updateNotificationSetting(
        @GetUser('userId') userId: string,
    ): Promise<TResponse<any>> {
        return await this.NotificationsService.updateNotificationSetting(userId);
    }

    // update notification change toggle turn of----

    @ApiOperation({
        summary: 'Toggle notification setting off',
        description: 'Toggle notification setting off',
    })
    @ApiBearerAuth()
    @UsePipes(ValidationPipe)
    @UseGuards(JwtAuthGuard)
    @Patch('change-toggle-setting')
    async ToogleNotificationSettingOff(
        @GetUser('userId') userId: string,

    ): Promise<TResponse<any>> {
        return await this.NotificationsService.ToogleNotificationSettingOff(
            userId,

        );
    }

    // ------------- All connected clients will receive it.---
    // @Post("broadcast")
    // async broadcast() {
    //   await this.NotificationsService.notifyAllUsers("new-notification", {
    //     title: "Broadcast",
    //     message: "Hello all connected users!",
    //     type: "SYSTEM",
    //   } as any);
    //   return { success: true };
    // }

    // ------------- All connected clients will receive it.---
    @ApiBearerAuth()
    @UsePipes(ValidationPipe)
    @UseGuards(JwtAuthGuard)
    @Patch('setting')
    async TestupdateNotificationSetting(
        @GetUser('userId') userId: string,
        @Body() dto: NotificationToggleDto,
    ): Promise<TResponse<any>> {
        return await this.NotificationsService.TestupdateNotificationSetting(
            userId,
            dto,
        );
    }

}
