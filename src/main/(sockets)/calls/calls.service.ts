import { Injectable } from '@nestjs/common';
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { CallType } from "@constants/enums";

@Injectable()
export class CallsService {
  constructor(private prisma: PrismaService) {}

  async createCall(creatorId: string, type: CallType, to: string[]) {
    const call = await this.prisma.call.create({
      data: {
        type: type,
        status: 'CALLING',
        creatorId,
        participants: { create: to.map((u) => ({ userId: u })) },
      },
      include: { participants: true },
    });
    return call;
  }

  async setAccepted(callId: string, userId: string) {
    const p = await this.prisma.participant.updateMany({
      where: { callId, userId },
      data: { accepted: true, joinedAt: new Date() },
    });
    const call = await this.prisma.call.findUnique({ where: { id: callId }, include: { participants: true } });
    return call;
  }

  async setStarted(callId: string) {
    return await this.prisma.call.update({
      where: { id: callId },
      data: { status: 'ACTIVE', startedAt: new Date() },
    });
  }

  async endCall(callId: string) {
    return await this.prisma.call.update({
      where: { id: callId },
      data: { status: 'END', endedAt: new Date() },
    });
  }

  async declinedCall(callId: string) {
    return await this.prisma.call.update({
      where: { id: callId },
      data: { status: 'DECLINED' },
    });
  }

  async getCall(callId: string) {
    return this.prisma.call.findUnique({ where: { id: callId }, include: { participants: true } });
  }
}

