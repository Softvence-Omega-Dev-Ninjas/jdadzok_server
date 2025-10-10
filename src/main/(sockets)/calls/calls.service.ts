import { PrismaService } from "@app/lib/prisma/prisma.service";
import { BadRequestException, Injectable } from "@nestjs/common";
import { Call, CallStatus, CallType } from "@prisma/client";
import { CreateCallDto } from "./dto/create-calls.dto";

@Injectable()
export class CallsService {
    constructor(private readonly prisma: PrismaService) {}

    async createCall(fromId: string, payload: CreateCallDto): Promise<Call> {
        try {
            // Validate that fromId and toId are different
            if (fromId === payload.to) {
                throw new BadRequestException("Cannot create call to self");
            }

            // Check if both users exist
            const [fromUser, toUser] = await Promise.all([
                this.prisma.user.findUnique({ where: { id: fromId } }),
                this.prisma.user.findUnique({ where: { id: payload.to } }),
            ]);

            if (!fromUser || !toUser) {
                throw new BadRequestException("Invalid user IDs");
            }

            // Create new call record
            return await this.prisma.call.create({
                data: {
                    type: payload.type || CallType.AUDIO,
                    status: CallStatus.CALLING,
                    fromId,
                    toId: payload.to,
                    metadata: payload.offer ? { offer: payload.offer } : undefined,
                },
            });
        } catch (error: any) {
            throw new BadRequestException(`Failed to create call: ${error?.message}`);
        }
    }

    async getCall(callId: string): Promise<Call | null> {
        try {
            return await this.prisma.call.findUnique({
                where: { id: callId },
            });
        } catch (error: any) {
            throw new BadRequestException(`Failed to fetch call: ${error?.message}`);
        }
    }

    async markAsAccepted(callId: string, userId: string): Promise<Call | null> {
        try {
            const call = await this.prisma.call.findUnique({
                where: { id: callId },
            });

            if (!call || call.status !== CallStatus.CALLING) {
                return null;
            }

            if (call.toId !== userId) {
                throw new BadRequestException("Only the recipient can accept the call");
            }

            return await this.prisma.call.update({
                where: { id: callId },
                data: {
                    status: CallStatus.ACTIVE,
                    startedAt: new Date(),
                },
            });
        } catch (error: any) {
            throw new BadRequestException(`Failed to accept call: ${error?.message}`);
        }
    }

    async markAsDeclined(callId: string, userId: string): Promise<Call | null> {
        try {
            const call = await this.prisma.call.findUnique({
                where: { id: callId },
            });

            if (!call || call.status !== CallStatus.CALLING) {
                return null;
            }

            if (call.toId !== userId) {
                throw new BadRequestException("Only the recipient can decline the call");
            }

            return await this.prisma.call.update({
                where: { id: callId },
                data: {
                    status: CallStatus.DECLINED,
                    endedAt: new Date(),
                },
            });
        } catch (error: any) {
            throw new BadRequestException(`Failed to decline call: ${error?.message}`);
        }
    }

    async endCall(callId: string): Promise<Call | null> {
        try {
            const call = await this.prisma.call.findUnique({
                where: { id: callId },
            });

            if (!call || call.status === CallStatus.END) {
                return null;
            }

            return await this.prisma.call.update({
                where: { id: callId },
                data: {
                    status: CallStatus.END,
                    endedAt: new Date(),
                },
            });
        } catch (error: any) {
            throw new BadRequestException(`Failed to end call: ${error?.message}`);
        }
    }
}
