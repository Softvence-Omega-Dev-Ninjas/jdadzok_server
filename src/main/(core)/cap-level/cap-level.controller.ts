import { JwtAuthGuard } from "@app/main/(started)/auth/guards/jwt-auth";
import { CapLevel } from "@constants/enums";
import { Controller, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import { CapLevelService } from "./cap-lavel.service";

@ApiBearerAuth()
@ApiTags("Cap Level Management")
@Controller("cap-level")
@UseGuards(JwtAuthGuard)
export class CapLevelController {
    constructor(private readonly service: CapLevelService) {}

    @ApiOperation({ summary: "Get all cap level requirements" })
    @Get("requirements")
    async getAllRequirements() {
        try {
            const requirements = await this.service.getAllCapRequirements();
            return requirements;
        } catch (error) {
            throw error;
        }
    }

    @ApiOperation({ summary: "Get requirements for a specific cap level" })
    @ApiParam({
        name: "level",
        enum: ["GREEN", "YELLOW", "RED", "BLACK", "OSTRICH_FEATHER"],
    })
    @Get("requirements/:level")
    async getRequirementsForLevel(@Param("level") level: CapLevel) {
        try {
            return await this.service.getCapRequirements(level);
        } catch (error) {
            throw error;
        }
    }

    // @Get('status/:userId')
    // @ApiOperation({ summary: 'Get comprehensive cap status for a user' })
    // @ApiParam({ name: 'userId', description: 'User ID' })
    // @ApiResponse({ status: 200, description: 'User cap level status with progress and eligibility' })
    // async getUserCapStatus(@Param('userId') userId: string) {
    //   try {
    //     return await this.service.getUserCapStatus(userId);
    //   } catch (error) {
    //     throw error;
    //   }
    // }

    // @Post('calculate/:userId')
    // @ApiOperation({ summary: 'Calculate user eligibility for cap level promotion' })
    // @ApiParam({ name: 'userId', description: 'User ID' })
    // @ApiResponse({ status: 200, description: 'Cap level eligibility calculation result' })
    // async calculateEligibility(@Param('userId') userId: string) {
    //   try {
    //     return await this.service.calculateCapEligibility(userId);
    //   } catch (error) {
    //     throw error;
    //   }
    // }

    @ApiOperation({
        summary: "Promote user to next eligible cap level or specific level",
    })
    @ApiParam({ name: "userId", description: "User ID" })
    @ApiQuery({
        name: "targetLevel",
        required: false,
        enum: ["GREEN", "YELLOW", "RED", "BLACK", "OSTRICH_FEATHER"],
    })
    @ApiQuery({
        name: "bypassVerification",
        required: false,
        type: Boolean,
        description: "Admin override for verification requirements",
    })
    @Put("promote/:userId")
    async promoteUser(
        @Param("userId") userId: string,
        @Query("targetLevel") targetLevel?: CapLevel,
        @Query("bypassVerification") bypassVerification: boolean = false,
    ) {
        try {
            return await this.service.promoteUserCapLevel(userId, targetLevel, bypassVerification);
        } catch (error) {
            throw error;
        }
    }

    @ApiOperation({ summary: "Get platform-wide cap level statistics" })
    @Get("stats")
    async getCapLevelStats() {
        try {
            return await this.service.getCapLevelStats();
        } catch (error) {
            throw error;
        }
    }

    @Get("eligible/:level")
    @ApiOperation({
        summary: "Get users eligible for promotion to specific cap level",
    })
    @ApiParam({
        name: "level",
        enum: ["GREEN", "YELLOW", "RED", "BLACK", "OSTRICH_FEATHER"],
    })
    @ApiResponse({
        status: 200,
        description: "List of users eligible for promotion",
    })
    async getUsersEligibleForPromotion(@Param("level") level: CapLevel) {
        try {
            return await this.service.getUsersEligibleForPromotion(level);
        } catch (error) {
            throw error;
        }
    }

    @Post("batch-promote/:level")
    @ApiOperation({
        summary: "Process automatic promotions for eligible users (admin only)",
    })
    @ApiParam({
        name: "level",
        enum: ["GREEN", "YELLOW", "RED", "BLACK", "OSTRICH_FEATHER"],
    })
    @ApiResponse({ status: 200, description: "Batch promotion results" })
    async processBatchPromotions(@Param("level") level: CapLevel) {
        try {
            return await this.service.processPendingPromotions(level);
        } catch (error) {
            throw error;
        }
    }
}
