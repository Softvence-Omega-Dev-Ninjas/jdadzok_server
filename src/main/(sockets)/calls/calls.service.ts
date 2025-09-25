import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { CreateCallDto } from "./dto/create-calls.dto";
import { Call, CallStatus, CallType } from "@prisma/client";

@Injectable()
export class CallsService {
<<<<<<< HEAD
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
        throw new BadRequestException(
          "Only the recipient can decline the call",
        );
      }

      return await this.prisma.call.update({
        where: { id: callId },
        data: {
          status: CallStatus.DECLINED,
          endedAt: new Date(),
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to decline call: ${error?.message}`,
      );
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
=======
    constructor(private prisma: PrismaService) {}

    async createCall(creatorId: string, type: CallType, to: string[]) {
        const call = await this.prisma.call.create({
            data: {
                type: type,
                status: "CALLING",
                creatorId,
                participants: { create: to.map((u) => ({ userId: u })) },
            },
            include: { participants: true },
        });
        return call;
    }

    async setAccepted(callId: string, userId: string) {
        // const p = await this.prisma.chatParticipant.updateMany({
        //   where: { userId, chatId },
        //   data: { : true, joinedAt: new Date() },
        // });
        const call = await this.prisma.call.findUnique({
            where: { id: callId, creatorId: userId },
            include: { participants: true },
        });
        return call;
    }

    async setStarted(callId: string) {
        return await this.prisma.call.update({
            where: { id: callId },
            data: { status: "ACTIVE", startedAt: new Date() },
        });
    }

    async endCall(callId: string) {
        return await this.prisma.call.update({
            where: { id: callId },
            data: { status: "END", endedAt: new Date() },
        });
    }

    async declinedCall(callId: string) {
        return await this.prisma.call.update({
            where: { id: callId },
            data: { status: "DECLINED" },
        });
    }

    async getCall(callId: string) {
        return this.prisma.call.findUnique({
            where: { id: callId },
            include: { participants: true },
        });
    }
>>>>>>> sabbir
}
