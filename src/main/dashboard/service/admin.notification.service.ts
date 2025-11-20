import { HandleError } from "@common/error/handle-error.decorator";
import { EVENT_TYPES } from "@common/interface/events-name";
import { Custom } from "@common/interface/events-payload";
import { PrismaService } from "@lib/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CustomNotificationDto } from "../dto/custom-notification.dto";

@Injectable()
export class AdminNotificationService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async sendCustomNotification(dto: CustomNotificationDto) {
        const users = await this.prisma.user.findMany({
            where: { NotificationToggle: { some: { Custom: true } } },
            select: { id: true, email: true, NotificationToggle: true },
        });

        if (!users.length) {
            throw new NotFoundException("No users found with Custom toggle ON");
        }

        // Save notification for first user (or system user if you prefer)
        const notification = await this.prisma.notification.create({
            data: {
                title: dto.title,
                message: dto.message,
                userId: users[0].id,
                type: "Custom",
            },
        });
        console.log("notification", notification);
        // Emit event to all users with Custom toggle ON
        const recipients = users.map((u) => ({ id: u.id, email: u.email }));

        const payload: Custom = {
            action: "CREATE",
            meta: { title: dto.title, message: dto.message },
            info: {
                title: dto.title,
                message: dto.message,
                recipients,
            },
        };

        console.log("the payload", payload);
        this.eventEmitter.emit(EVENT_TYPES.CUSTOM_CREATE, payload);

        return notification;
    }

    // -------------get notification get---------------
    @HandleError(" failed to getNotificationStats")
    async getNotificationStats() {
        const now = new Date();

        // Today start & end
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(startOfToday);
        endOfToday.setDate(endOfToday.getDate() + 1);

        // This month start
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Last month start + this month start
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // --------------- Total Count ----------------
        const total = await this.prisma.notification.count();

        // --------------- Read Count ----------------
        const readCount = await this.prisma.notification.count({
            where: { read: true },
        });

        // --------------- Read Rate (Open Rate) ----------------
        const openRate = total ? Math.round((readCount / total) * 100) : 0;

        // --------------- Today Count ----------------
        const todayCount = await this.prisma.notification.count({
            where: {
                createdAt: { gte: startOfToday, lt: endOfToday },
            },
        });

        // --------------- This Month Count ----------------
        const thisMonthCount = await this.prisma.notification.count({
            where: {
                createdAt: { gte: startOfMonth, lt: endOfToday },
            },
        });

        // --------------- Last Month Count ----------------
        const lastMonthCount = await this.prisma.notification.count({
            where: {
                createdAt: {
                    gte: startOfLastMonth,
                    lt: startOfMonth,
                },
            },
        });

        return {
            totalNotifications: total,
            readNotifications: readCount,
            openRate,
            todayCount,
            thisMonthCount,
            lastMonthCount,
        };
    }
    // -------------- latest 6 notification  with title date,message & time, type ------
    @HandleError("getLatestNotifications")
    async getLatestNotifications() {
        const notifications = await this.prisma.notification.findMany({
            orderBy: { createdAt: "desc" },
            take: 6,
            select: {
                id: true,
                title: true,
                message: true,
                createdAt: true,
                type: true,
            },
        });
        return notifications;
    }

}
