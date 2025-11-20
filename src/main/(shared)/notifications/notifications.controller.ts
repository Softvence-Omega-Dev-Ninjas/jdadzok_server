import { GetUser, ValidateAuth } from "@common/jwt/jwt.decorator";
import { TResponse } from "@common/utils/response.util";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import { Body, Controller, Get, Patch, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { NotificationToggleDto } from "./dto/notification-toggle";
import { ReadNotificationDto } from "./dto/read.notification.dto";
import { NotificationsService } from "./notifications.service";
@ApiTags("Notification Setting")
@ValidateAuth()
@ApiBearerAuth()
@Controller("notifications")
export class NotificaitonsController {
    constructor(private readonly NotificationsService: NotificationsService) {}

    // -----------get all notification show---
    @ApiBearerAuth()
    @ValidateAuth()
    @ApiOperation({ summary: "Get all notification" })
    @Get("all")
    async getAllNotification() {
        return this.NotificationsService.getAllNotification();
    }
    // ----------------read notification---------------
    @ApiBearerAuth()
    @ValidateAuth()
    @ApiOperation({ summary: "Mark notification as read" })
    @Patch("read")
    async readOne(@Body() dto: ReadNotificationDto, @GetUser("userId") userId: string) {
        return this.NotificationsService.markAsRead(dto, userId);
    }

    @ApiBearerAuth()
    @ValidateAuth()
    @ApiOperation({ summary: "Mark all notifications as read" })
    @Patch("read-all")
    async readAll(@GetUser("userId") userId: string) {
        return this.NotificationsService.markAllAsRead(userId);
    }

    //   ----------notification settings-------------

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
