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
    ) {}

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

        console.log("the paload", payload);
        this.eventEmitter.emit(EVENT_TYPES.CUSTOM_CREATE, payload);

        return notification;
    }

    async getNotificationStats() {
        // Total notifications
        const total = await this.prisma.notification.count();

        // Read notifications
        const readCount = await this.prisma.notification.count({
            where: { read: true },
        });

        // Read rate (%)
        const readRate = total ? Math.round((readCount / total) * 100) : 0;

        // Last month notifications count
        const now = new Date();
        const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const lastMonthCount = await this.prisma.notification.count({
            where: {
                createdAt: {
                    gte: firstDayLastMonth,
                    lt: firstDayCurrentMonth,
                },
            },
        });

        return {
            total,
            readCount,
            readRate,
            lastMonthCount,
        };
    }
}
