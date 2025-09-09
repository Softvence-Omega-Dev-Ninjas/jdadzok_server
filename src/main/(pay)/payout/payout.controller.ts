import { GetUser } from "@common/jwt/jwt.decorator";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { PayOutStatus } from "@prisma/client";
import { TUser } from "@project/@types";
import {
  CreatePayoutDto,
  PayoutQueryDto,
  PayoutResponseDto,
  PayoutStatsDto,
  ProcessPayoutDto,
  UpdatePayoutDto,
} from "./dto/payout.dto";
import { PayoutService } from "./payout.service";

@ApiTags("Payouts")
@ApiBearerAuth()
@Controller("payouts")
@UseGuards(JwtAuthGuard)
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) { }

  @Post()
  @ApiOperation({ summary: "Create a new payout request" })
  @ApiResponse({
    status: 201,
    description: "Payout request created successfully",
    type: PayoutResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  async createPayout(
    @GetUser() user: TUser,
    @Body() createDto: CreatePayoutDto,
  ): Promise<PayoutResponseDto> {
    return this.payoutService.createPayout(user.userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all payouts for the current user" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "offset", required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: "Payouts retrieved successfully",
    type: [PayoutResponseDto],
  })
  async getUserPayouts(
    @GetUser() user: TUser,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number,
  ): Promise<PayoutResponseDto[]> {
    return this.payoutService.findUserPayouts(user.userId, limit, offset);
  }

  @Get("all")
  @ApiOperation({ summary: "Get all payouts with query filters (admin only)" })
  @ApiQuery({ type: PayoutQueryDto, required: false })
  @ApiResponse({
    status: 200,
    description: "Payouts retrieved successfully",
    type: [PayoutResponseDto],
  })
  async getAllPayouts(
    @Query() query: PayoutQueryDto,
  ): Promise<PayoutResponseDto[]> {
    return this.payoutService.findPayouts(query);
  }

  @Get("pending")
  @ApiOperation({ summary: "Get pending payouts (admin only)" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: "Pending payouts retrieved successfully",
    type: [PayoutResponseDto],
  })
  async getPendingPayouts(
    @Query("limit") limit?: number,
  ): Promise<PayoutResponseDto[]> {
    return this.payoutService.findPendingPayouts(limit);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get payout statistics for the current user" })
  @ApiResponse({
    status: 200,
    description: "Payout statistics retrieved successfully",
    type: PayoutStatsDto,
  })
  async getUserPayoutStats(
    @GetUser() user: TUser,
  ): Promise<PayoutStatsDto> {
    return this.payoutService.getPayoutStats(user.userId);
  }

  @Get("stats/all")
  @ApiOperation({ summary: "Get overall payout statistics (admin only)" })
  @ApiResponse({
    status: 200,
    description: "Overall payout statistics retrieved successfully",
    type: PayoutStatsDto,
  })
  async getAllPayoutStats(): Promise<PayoutStatsDto> {
    return this.payoutService.getPayoutStats();
  }

  @Get("summary")
  @ApiOperation({ summary: "Get payout summary for the current user" })
  @ApiResponse({
    status: 200,
    description: "Payout summary retrieved successfully",
    schema: {
      type: "object",
      properties: {
        totalPaid: { type: "number" },
        pendingAmount: { type: "number" },
        lastPayout: { $ref: "#/components/schemas/PayoutResponseDto" },
        stats: { $ref: "#/components/schemas/PayoutStatsDto" },
      },
    },
  })
  async getUserPayoutSummary(@GetUser() user: TUser): Promise<{
    totalPaid: number;
    pendingAmount: number;
    lastPayout: PayoutResponseDto | null;
    stats: PayoutStatsDto;
  }> {
    return this.payoutService.getUserPayoutSummary(user.userId);
  }

  @Get("status/:status")
  @ApiOperation({ summary: "Get payouts by status" })
  @ApiParam({ name: "status", enum: PayOutStatus })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "offset", required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: "Payouts retrieved successfully",
    type: [PayoutResponseDto],
  })
  async getPayoutsByStatus(
    @Param("status") status: PayOutStatus,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number,
  ): Promise<PayoutResponseDto[]> {
    return this.payoutService.findPayoutsByStatus(status, limit, offset);
  }

  @Get("count")
  @ApiOperation({ summary: "Count payouts with query filters" })
  @ApiQuery({ type: PayoutQueryDto, required: false })
  @ApiResponse({
    status: 200,
    description: "Payout count retrieved successfully",
    schema: { type: "object", properties: { count: { type: "number" } } },
  })
  async countPayouts(
    @Query() query: PayoutQueryDto,
  ): Promise<{ count: number }> {
    const count = await this.payoutService.countPayouts(query);
    return { count };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a payout by ID" })
  @ApiParam({ name: "id", description: "Payout ID" })
  @ApiResponse({
    status: 200,
    description: "Payout retrieved successfully",
    type: PayoutResponseDto,
  })
  @ApiResponse({ status: 404, description: "Payout not found" })
  async getPayoutById(
    @GetUser() user: TUser,
    @Param("id") id: string,
  ): Promise<PayoutResponseDto> {
    return this.payoutService.findPayoutById(id, user.userId);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a payout request" })
  @ApiParam({ name: "id", description: "Payout ID" })
  @ApiResponse({
    status: 200,
    description: "Payout updated successfully",
    type: PayoutResponseDto,
  })
  @ApiResponse({ status: 404, description: "Payout not found" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async updatePayout(
    @GetUser() user: TUser,
    @Param("id") id: string,
    @Body() updateDto: UpdatePayoutDto,
  ): Promise<PayoutResponseDto> {
    return this.payoutService.updatePayout(id, user.userId, updateDto);
  }

  @Put(":id/process")
  @ApiOperation({ summary: "Process a payout (admin only)" })
  @ApiParam({ name: "id", description: "Payout ID" })
  @ApiResponse({
    status: 200,
    description: "Payout processed successfully",
    type: PayoutResponseDto,
  })
  @ApiResponse({ status: 404, description: "Payout not found" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @HttpCode(HttpStatus.OK)
  async processPayout(
    @Param("id") id: string,
    @Body() processDto: ProcessPayoutDto,
  ): Promise<PayoutResponseDto> {
    return this.payoutService.processPayout(id, processDto);
  }

  @Put(":id/status")
  @ApiOperation({ summary: "Update payout status (admin only)" })
  @ApiParam({ name: "id", description: "Payout ID" })
  @ApiResponse({
    status: 200,
    description: "Payout status updated successfully",
    type: PayoutResponseDto,
  })
  @ApiResponse({ status: 404, description: "Payout not found" })
  @HttpCode(HttpStatus.OK)
  async updatePayoutStatus(
    @Param("id") id: string,
    @Body() body: {
      status: PayOutStatus;
      transactionId?: string;
      processorFee?: number;
    },
  ): Promise<PayoutResponseDto> {
    return this.payoutService.updatePayoutStatus(
      id,
      body.status,
      body.transactionId,
      body.processorFee
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a payout request" })
  @ApiParam({ name: "id", description: "Payout ID" })
  @ApiResponse({ status: 204, description: "Payout deleted successfully" })
  @ApiResponse({ status: 404, description: "Payout not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePayout(
    @GetUser() user: TUser,
    @Param("id") id: string,
  ): Promise<void> {
    return this.payoutService.deletePayout(id, user.userId);
  }

  @Get(":id/validate-ownership")
  @ApiOperation({ summary: "Validate payout ownership" })
  @ApiParam({ name: "id", description: "Payout ID" })
  @ApiResponse({
    status: 200,
    description: "Ownership validation result",
    schema: { type: "object", properties: { isOwner: { type: "boolean" } } },
  })
  async validateOwnership(
    @GetUser() user: TUser,
    @Param("id") id: string,
  ): Promise<{ isOwner: boolean }> {
    const isOwner = await this.payoutService.validatePayoutOwnership(
      id,
      user.userId,
    );
    return { isOwner };
  }

  @Post("validate-amount")
  @ApiOperation({ summary: "Validate if user can create a payout with specified amount" })
  @ApiResponse({
    status: 200,
    description: "Validation result",
    schema: {
      type: "object",
      properties: {
        canCreate: { type: "boolean" },
        reason: { type: "string" }
      }
    },
  })
  @HttpCode(HttpStatus.OK)
  async validatePayoutAmount(
    @GetUser() user: TUser,
    @Body() body: { amount: number },
  ): Promise<{ canCreate: boolean; reason?: string }> {
    return this.payoutService.canUserCreatePayout(user.userId, body.amount);
  }

  // Admin endpoints
  @Put("admin/:id")
  @ApiOperation({ summary: "Admin update payout" })
  @ApiParam({ name: "id", description: "Payout ID" })
  @ApiResponse({
    status: 200,
    description: "Payout updated successfully",
    type: PayoutResponseDto,
  })
  async adminUpdatePayout(
    @Param("id") id: string,
    @Body() updateDto: UpdatePayoutDto,
  ): Promise<PayoutResponseDto> {
    return this.payoutService.adminUpdatePayout(id, updateDto);
  }

  @Delete("admin/:id")
  @ApiOperation({ summary: "Admin delete payout" })
  @ApiParam({ name: "id", description: "Payout ID" })
  @ApiResponse({ status: 204, description: "Payout deleted successfully" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async adminDeletePayout(
    @Param("id") id: string,
  ): Promise<void> {
    return this.payoutService.adminDeletePayout(id);
  }
}
