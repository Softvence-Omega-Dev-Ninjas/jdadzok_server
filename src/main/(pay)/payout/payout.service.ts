import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Payout, PayOutStatus } from "@prisma/client";
import {
  CreatePayoutDto,
  PayoutQueryDto,
  PayoutResponseDto,
  PayoutStatsDto,
  ProcessPayoutDto,
  UpdatePayoutDto,
} from "./dto/payout.dto";
import { PayoutRepository } from "./payout.repository";

@Injectable()
export class PayoutService {
  constructor(private readonly payoutRepository: PayoutRepository) {}

  async createPayout(
    userId: string,
    createDto: CreatePayoutDto,
  ): Promise<PayoutResponseDto> {
    try {
      // Validate minimum payout amount
      const minPayoutAmount = 5.0; // $5.00 minimum
      if (createDto.amount < minPayoutAmount) {
        throw new BadRequestException(
          `Minimum payout amount is $${minPayoutAmount.toFixed(2)}`,
        );
      }

      // Check if user has pending payouts (optional business rule)
      const pendingAmount = await this.payoutRepository.getPendingAmountByUser(
        createDto.userId || userId,
      );
      const maxPendingAmount = 1000.0; // $1000 max pending

      if (pendingAmount + createDto.amount > maxPendingAmount) {
        throw new BadRequestException(
          `Total pending amount would exceed maximum of $${maxPendingAmount.toFixed(2)}`,
        );
      }

      const payout = await this.payoutRepository.create(userId, createDto);
      return this.transformToResponse(payout);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException("Failed to create payout request");
    }
  }

  async findUserPayouts(
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<PayoutResponseDto[]> {
    const payouts = await this.payoutRepository.findByUserId(
      userId,
      limit,
      offset,
    );
    return payouts.map((payout) => this.transformToResponse(payout));
  }

  async findPayouts(query?: PayoutQueryDto): Promise<PayoutResponseDto[]> {
    const payouts = await this.payoutRepository.findAll(query);
    return payouts.map((payout) => this.transformToResponse(payout));
  }

  async findPayoutById(
    id: string,
    userId?: string,
  ): Promise<PayoutResponseDto> {
    const payout = userId
      ? await this.payoutRepository.findByIdAndUserId(id, userId)
      : await this.payoutRepository.findById(id);

    if (!payout) {
      throw new NotFoundException("Payout not found");
    }

    return this.transformToResponse(payout);
  }

  async findPendingPayouts(limit = 100): Promise<PayoutResponseDto[]> {
    const payouts = await this.payoutRepository.findPendingPayouts(limit);
    return payouts.map((payout) => this.transformToResponse(payout));
  }

  async findPayoutsByStatus(
    status: PayOutStatus,
    limit = 50,
    offset = 0,
  ): Promise<PayoutResponseDto[]> {
    const payouts = await this.payoutRepository.findByStatus(
      status,
      limit,
      offset,
    );
    return payouts.map((payout) => this.transformToResponse(payout));
  }

  async updatePayout(
    id: string,
    userId: string,
    updateDto: UpdatePayoutDto,
  ): Promise<PayoutResponseDto> {
    const existingPayout = await this.payoutRepository.findByIdAndUserId(
      id,
      userId,
    );
    if (!existingPayout) {
      throw new NotFoundException("Payout not found");
    }

    // Only allow updates to pending payouts
    if (existingPayout.status !== PayOutStatus.PENDING) {
      throw new BadRequestException("Can only update pending payouts");
    }

    // Users can only update amount and method, not status or transaction details
    const allowedUpdates = {
      amount: updateDto.amount,
      method: updateDto.method,
    };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach(
      (key: keyof typeof allowedUpdates) =>
        allowedUpdates[key] === undefined && delete allowedUpdates[key],
    );

    if (Object.keys(allowedUpdates).length === 0) {
      throw new BadRequestException("No valid fields to update");
    }

    try {
      const updatedPayout = await this.payoutRepository.update(
        id,
        allowedUpdates,
      );
      return this.transformToResponse(updatedPayout);
    } catch (error) {
      console.info(error);
      throw new BadRequestException("Failed to update payout");
    }
  }

  async deletePayout(id: string, userId: string): Promise<void> {
    const payout = await this.payoutRepository.findByIdAndUserId(id, userId);
    if (!payout) {
      throw new NotFoundException("Payout not found");
    }

    // Only allow deletion of pending payouts
    if (payout.status !== PayOutStatus.PENDING) {
      throw new BadRequestException("Can only delete pending payouts");
    }

    await this.payoutRepository.delete(id);
  }

  async processPayout(
    id: string,
    processDto: ProcessPayoutDto,
  ): Promise<PayoutResponseDto> {
    const payout = await this.payoutRepository.findById(id);
    if (!payout) {
      throw new NotFoundException("Payout not found");
    }

    if (payout.status !== PayOutStatus.PENDING) {
      throw new BadRequestException("Can only process pending payouts");
    }

    try {
      const updatedPayout = await this.payoutRepository.updateStatus(
        id,
        PayOutStatus.PAID,
        processDto.transactionId,
        processDto.processorFee,
      );

      return this.transformToResponse(updatedPayout);
    } catch (error) {
      console.info(error);
      throw new BadRequestException("Failed to process payout");
    }
  }

  async getPayoutStats(userId?: string): Promise<PayoutStatsDto> {
    return this.payoutRepository.getStats(userId);
  }

  async getUserPayoutSummary(userId: string): Promise<{
    totalPaid: number;
    pendingAmount: number;
    lastPayout: PayoutResponseDto | null;
    stats: PayoutStatsDto;
  }> {
    const [totalPaid, pendingAmount, lastPayout, stats] = await Promise.all([
      this.payoutRepository.getTotalAmountByUser(userId),
      this.payoutRepository.getPendingAmountByUser(userId),
      this.payoutRepository.getLastPayout(userId),
      this.payoutRepository.getStats(userId),
    ]);

    return {
      totalPaid,
      pendingAmount,
      lastPayout: lastPayout ? this.transformToResponse(lastPayout) : null,
      stats,
    };
  }

  async countPayouts(query?: PayoutQueryDto): Promise<number> {
    return this.payoutRepository.count(query);
  }

  // Admin only methods
  async adminUpdatePayout(
    id: string,
    updateDto: UpdatePayoutDto,
  ): Promise<PayoutResponseDto> {
    const existingPayout = await this.payoutRepository.findById(id);
    if (!existingPayout) {
      throw new NotFoundException("Payout not found");
    }

    try {
      const updatedPayout = await this.payoutRepository.update(id, updateDto);
      return this.transformToResponse(updatedPayout);
    } catch (error) {
      console.info(error);
      throw new BadRequestException("Failed to update payout");
    }
  }

  async adminDeletePayout(id: string): Promise<void> {
    const payout = await this.payoutRepository.findById(id);
    if (!payout) {
      throw new NotFoundException("Payout not found");
    }

    await this.payoutRepository.delete(id);
  }

  async updatePayoutStatus(
    id: string,
    status: PayOutStatus,
    transactionId?: string,
    processorFee?: number,
  ): Promise<PayoutResponseDto> {
    const payout = await this.payoutRepository.findById(id);
    if (!payout) {
      throw new NotFoundException("Payout not found");
    }

    const updatedPayout = await this.payoutRepository.updateStatus(
      id,
      status,
      transactionId,
      processorFee,
    );
    return this.transformToResponse(updatedPayout);
  }

  private transformToResponse(payout: Payout): PayoutResponseDto {
    const processorFee = payout.processorFee || 0;
    const netAmount = payout.amount - processorFee;

    return {
      id: payout.id,
      userId: payout.userId,
      amount: payout.amount,
      method: payout.method,
      status: payout.status,
      transactionId: payout.transactionId,
      processorFee: payout.processorFee,
      netAmount,
      createdAt: payout.createdAt,
      updatedAt: payout.updatedAt,
    };
  }

  async validatePayoutOwnership(id: string, userId: string): Promise<boolean> {
    const payout = await this.payoutRepository.findByIdAndUserId(id, userId);
    return !!payout;
  }

  async canUserCreatePayout(
    userId: string,
    amount: number,
  ): Promise<{
    canCreate: boolean;
    reason?: string;
  }> {
    const minPayoutAmount = 5.0;
    if (amount < minPayoutAmount) {
      return {
        canCreate: false,
        reason: `Minimum payout amount is $${minPayoutAmount.toFixed(2)}`,
      };
    }

    const pendingAmount =
      await this.payoutRepository.getPendingAmountByUser(userId);
    const maxPendingAmount = 1000.0;

    if (pendingAmount + amount > maxPendingAmount) {
      return {
        canCreate: false,
        reason: `Total pending amount would exceed maximum of $${maxPendingAmount.toFixed(2)}`,
      };
    }

    return { canCreate: true };
  }
}
