import { HandleError } from "@common/error/handle-error.decorator";
import { successResponse, TResponse } from "@common/utils/response.util";
import { PrismaService } from "@lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { NotificationToggleDto } from "./dto/notification-toggle";

@Injectable()
export class NotificationsService {
    constructor(private readonly prisma: PrismaService) {}

    @HandleError("Failed to get notification setting")
    async getNotificationSetting(userId: string): Promise<TResponse<any>> {
        const result = await this.prisma.notificationToggle.findUnique({
            where: {
                userId: userId,
            },
            include: {
                user: true,
            },
        });

        // * if does not exist, create it
        if (!result) {
            const notificationToggle = await this.prisma.notificationToggle.create({
                data: {
                    userId: userId,
                },
            });
            return successResponse(notificationToggle, "Notification setting created successfully");
        }

        return successResponse(result, "Notification setting found successfully");
    }

    //   --------------ProfileUpdateNotificationSettingOn update user notification now -------------------

    @HandleError("Failed to update notification setting")
    async ProfileUpdateNotificationSettingOn(userId: string): Promise<TResponse<any>> {
        const changeNotification = await this.prisma.profile.update({
            where: {
                userId: userId,
            },
            data: {
                isToggleNotification: true,
            },
        });

        return successResponse(changeNotification, "Notification setting updated successfully");
    }

    // ------------ Profile-ToogleNotificationSettingOff  off-----------

    @HandleError("Failed t off profile update notification setting")
    async ProfileToogleNotificationSettingOff(userId: string): Promise<TResponse<any>> {
        const changeNotificationOff = await this.prisma.profile.update({
            where: {
                userId: userId,
            },
            data: {
                isToggleNotification: false,
            },
        });

        return successResponse(
            changeNotificationOff,
            "Notification profile setting updated successfully",
        );
    }

    // ---------------- NGO Notification ON ----------------
    @HandleError("Failed to update NGO notification setting")
    async NgoUpdateNotificationSettingOn(userId: string): Promise<TResponse<any>> {
        const NgochangeNotification = await this.prisma.ngo.updateMany({
            where: { ownerId: userId },
            data: { isToggleNotification: true },
        });

        if (NgochangeNotification.count === 0) {
            return {
                success: false,
                message: "No NGO found for this user",
                data: null,
            };
        }

        return successResponse(
            NgochangeNotification,
            "NGO notification setting turned ON successfully",
        );
    }

    // ---------------- NGO Notification OFF ----------------
    @HandleError("Failed to update NGO notification setting OFF")
    async NgoToogleNotificationSettingOff(userId: string): Promise<TResponse<any>> {
        const NgochangeNotificationoff = await this.prisma.ngo.updateMany({
            where: { ownerId: userId },
            data: { isToggleNotification: false },
        });

        if (NgochangeNotificationoff.count === 0) {
            return {
                success: false,
                message: "No NGO found for this user",
                data: null,
            };
        }

        return successResponse(
            NgochangeNotificationoff,
            "NGO notification setting turned OFF successfully",
        );
    }

    // ---------------- Community Notification ON ----------------
    @HandleError("Failed to update community notification setting")
    async CommunityUpdateNotificationSettingOn(userId: string): Promise<TResponse<any>> {
        const changeNotification = await this.prisma.community.updateMany({
            where: {
                ownerId: userId,
            },
            data: {
                isToggleNotification: true,
            },
        });

        if (changeNotification.count === 0) {
            return {
                success: false,
                message: "No community found for this user",
                data: null,
            };
        }

        return successResponse(
            changeNotification,
            "Community notification setting turned ON successfully",
        );
    }

    // ---------------- Community Notification OFF ----------------
    @HandleError("Failed to update community notification setting")
    async CommunityToogleNotificationSettingOff(userId: string): Promise<TResponse<any>> {
        const changeNotification = await this.prisma.community.updateMany({
            where: {
                ownerId: userId,
            },
            data: {
                isToggleNotification: false,
            },
        });

        if (changeNotification.count === 0) {
            return {
                success: false,
                message: "No community found for this user",
                data: null,
            };
        }

        return successResponse(
            changeNotification,
            "Community notification setting turned OFF successfully",
        );
    }

    //  --- -------- failed to notification--------
    @HandleError("Failed to update notification setting")
    async updateNotificationSetting(
        userId: string,
        dto: NotificationToggleDto,
    ): Promise<TResponse<any>> {
        const result = await this.prisma.notificationToggle.upsert({
            where: {
                userId: userId,
            },
            update: {
                email: dto.email,
                communication: dto.communication,
                community: dto.community,
                post: dto.post,
                comment: dto.comment,
                message: dto.message,
                userRegistration: dto.userRegistration,
            },
            create: {
                userId: userId,
                email: dto.email,
                communication: dto.communication,
                community: dto.community,
                post: dto.post,
                comment: dto.comment,
                message: dto.message,
                userRegistration: dto.userRegistration,
            },
        });
        return successResponse(result, "Notification setting updated successfully");
    }
}
