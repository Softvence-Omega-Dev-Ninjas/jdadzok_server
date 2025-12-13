import { PrismaService } from "@lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { CallStatus } from "@prisma/client";

@Injectable()
export class RealTimeCallService {
    constructor(private readonly prisma: PrismaService) {}

    async createCall(hostUserId: string, recipientUserId?: string, title?: string) {
        return this.prisma.calling.create({
            data: {
                hostUserId,
                recipientUserId,
                title,
                status: CallStatus.CALLING,
            },
        });
    }

    async markRinging(callId: string) {
        return this.prisma.calling.update({
            where: { id: callId },
            data: { status: CallStatus.RINING },
        });
    }

    async markActive(callId: string) {
        return this.prisma.calling.update({
            where: { id: callId },
            data: {
                status: CallStatus.ACTIVE,
                startedAt: new Date(),
            },
        });
    }

    async markDeclined(callId: string) {
        return this.prisma.calling.update({
            where: { id: callId },
            data: { status: CallStatus.DECLINED },
        });
    }

    async markMissed(callId: string) {
        return this.prisma.calling.update({
            where: { id: callId },
            data: { status: CallStatus.MISSED },
        });
    }

    async endCall(callId: string) {
        return this.prisma.calling.update({
            where: { id: callId },
            data: {
                status: CallStatus.END,
                endedAt: new Date(),
            },
        });
    }

    async getCallStatus(callId: string) {
        return this.prisma.calling.findUnique({
            where: { id: callId },
            include: { participants: true },
        });
    }
}
