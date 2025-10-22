import { HandleError } from "@common/error/handle-error.decorator";
import { successResponse, TResponse } from "@common/utils/response.util";
import { PrismaService } from "@lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { NotificationToggleDto } from "./dto/notification-toggle";

@Injectable()
export class NotificationsService {
    constructor(private readonly prisma: PrismaService) { }

    @HandleError('Failed to get notification setting')
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
            return successResponse(
                notificationToggle,
                'Notification setting created successfully',
            );
        }

        return successResponse(result, 'Notification setting found successfully');
    }

    //   -------------- update user notification now -------------------

    @HandleError('Failed to update notification setting')
    async updateNotificationSetting(userId: string): Promise<TResponse<any>> {

        const changeNotification = await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                isToggleNotification: true
            }
        });

        return successResponse(changeNotification, 'Notification setting updated successfully');
    }

    // ------------ toggle notificaton off-----------

    @HandleError('Failed to update notification setting')
    async ToogleNotificationSettingOff(userId: string): Promise<TResponse<any>> {

        const changeNotification = await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                isToggleNotification: false
            }
        });

        return successResponse(changeNotification, 'Notification setting updated successfully');
    }

    //  --- 
    @HandleError('Failed to update notification setting')
    async TestupdateNotificationSetting(
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

                message: dto.message,
                userRegistration: dto.userRegistration,
            },
            create: {
                userId: userId,
                email: dto.email,
                communication: dto.communication,

                message: dto.message,
                userRegistration: dto.userRegistration,
            },
        });
        return successResponse(result, 'Notification setting updated successfully');
    }

}




