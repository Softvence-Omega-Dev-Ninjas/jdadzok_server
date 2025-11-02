import { Roles } from "@common/decorators/roles.decorator";
import { RoleGuard } from "@common/guards/role.guard";
import { GetUser, GetVerifiedUser, ValidateAuth } from "@common/jwt/jwt.decorator";
import { TResponse } from "@common/utils/response.util";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import {
    Body,
    Controller,
    Get,
    Patch,
    Put,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { TUser, VerifiedUser } from "@type/index";
import { NotificationToggleDto } from "./dto/notification-toggle";
import { NotificationsService } from "./notifications.service";
@ApiTags("Notification Setting")
@ValidateAuth()
@ApiBearerAuth()
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
    @Roles("SUPER_ADMIN", "ADMIN")
    @UseGuards(RoleGuard)
    async markAsRead(@GetVerifiedUser() user: VerifiedUser) {
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
    async getNotificationSetting(@GetUser("userId") userId: string): Promise<TResponse<any>> {
        return await this.NotificationsService.getNotificationSetting(userId);
    }

    // ---------update notification push settings
    @Patch("push-settings")
    @ApiOperation({ summary: "Push notification: update notification push settings" })
    async updateNotificationSetting(
        @GetUser("userId") userId: string,
        @Body() dto: NotificationToggleDto,
    ): Promise<TResponse<any>> {
        return await this.NotificationsService.updateNotificationSetting(userId, dto);
    }

    // --------------  profile change notification setting ON -----------------

    @ApiOperation({
        summary: "Toggle notification setting on",
        description: "Toggle notification setting on",
    })
    @ApiBearerAuth()
    @UsePipes(ValidationPipe)
    @UseGuards(JwtAuthGuard)
    @Patch("profile-change-toggle-setting-on")
    async ProfileUpdateNotificationSettingOn(
        @GetUser("userId") userId: string,
    ): Promise<TResponse<any>> {
        return await this.NotificationsService.ProfileUpdateNotificationSettingOn(userId);
    }

    // update notification change toggle turn of----

    @ApiOperation({
        summary: "ProfileToggle notification setting off",
        description: "PROFILE Toggle notification setting off",
    })
    @ApiBearerAuth()
    @UsePipes(ValidationPipe)
    @UseGuards(JwtAuthGuard)
    @Patch("profile-change-toggle-setting-off")
    async ProfileToogleNotificationSettingOff(
        @GetUser("userId") userId: string,
    ): Promise<TResponse<any>> {
        return await this.NotificationsService.ProfileToogleNotificationSettingOff(userId);
    }

    // @Post('test-ngo-notification')
    // async testNgoNotification(@Body() body: { userId: string }) {
    //     const testPayload: Ngo = {
    //         action: "CREATE",
    //         meta: { ngoId: "test_123", ownerId: "owner_123" },
    //         info: {
    //             title: "TEST NGO",
    //             message: "This is a test",
    //             recipients: [{ id: body.userId, email: "test@x.com" }],
    //         },
    //     };
    //     this.eventEmitter.emit(EVENT_TYPES.NGO_CREATE, testPayload);
    //     return { sent: true };
    // }



    // --------------  Ngo change notification  ON -----------------

    @ApiOperation({
        summary: "Ngo-Toggle notification setting on",
        description: "Ngo-Toggle notification setting on",
    })

    @ApiBearerAuth()
    @UsePipes(ValidationPipe)
    @UseGuards(JwtAuthGuard)
    @Patch("Ngo-Toggle-toggle-setting-on")
    async NgoUpdateNotificationSettingOn(
        @GetUser("userId") userId: string,
    ): Promise<TResponse<any>> {
        return await this.NotificationsService.NgoUpdateNotificationSettingOn(userId);
    }

    // ngo update notification change toggle turn of----

    @ApiOperation({
        summary: "NGO -Toggle notification setting off",
        description: "Ngo-Toggle notification setting off",
    })
    @ApiBearerAuth()
    @UsePipes(ValidationPipe)
    @UseGuards(JwtAuthGuard)
    @Patch("Ngo-change-toggle-setting-off")
    async NgoToogleNotificationSettingOff(
        @GetUser("userId") userId: string,
    ): Promise<TResponse<any>> {
        return await this.NotificationsService.NgoToogleNotificationSettingOff(userId);
    }

    // --------------  community change notification  ON -----------------

    @ApiOperation({
        summary: "Community Toggle notification setting on",
        description: "Community Toggle Toggle notification setting on",
    })
    @ApiBearerAuth()
    @UsePipes(ValidationPipe)
    @UseGuards(JwtAuthGuard)
    @Patch("community-Toggle-toggle-setting-on")
    async CommunityUpdateNotificationSettingOn(
        @GetUser("userId") userId: string,
    ): Promise<TResponse<any>> {
        return await this.NotificationsService.CommunityUpdateNotificationSettingOn(userId);
    }

    // community update notification change toggle turn off----

    @ApiOperation({
        summary: "Community -Toggle notification setting off",
        description: "Community-Toggle notification setting off",
    })
    @ApiBearerAuth()
    @UsePipes(ValidationPipe)
    @UseGuards(JwtAuthGuard)
    @Patch("Community-change-toggle-setting-off")
    async CommunityToogleNotificationSettingOff(
        @GetUser("userId") userId: string,
    ): Promise<TResponse<any>> {
        return await this.NotificationsService.CommunityToogleNotificationSettingOff(userId);
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

    // @ApiBearerAuth()
    // @UsePipes(ValidationPipe)
    // @UseGuards(JwtAuthGuard)
    // @Patch("setting")
    // async TestupdateNotificationSetting(
    //     @GetUser("userId") userId: string,
    //     @Body() dto: NotificationToggleDto,
    // ): Promise<TResponse<any>> {
    //     return await this.NotificationsService.TestupdateNotificationSetting(userId, dto);
    // }
}
