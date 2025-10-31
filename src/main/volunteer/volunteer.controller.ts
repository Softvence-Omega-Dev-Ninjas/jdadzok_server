import { Controller, Post, Body, UseGuards, Get } from "@nestjs/common";
import { VolunteerService } from "./volunteer.service";
import { CreateVolunteerProjectDto } from "./dto/create-volunteer-project.dto";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import { GetVerifiedUser } from "@common/jwt/jwt.decorator";
import { VerifiedUser } from "@type/shared.types";
import { handleRequest } from "@common/utils/handle.request.util";
import { ApiBearerAuth } from "@nestjs/swagger";
import { ApplyVolunteerDto } from "./dto/apply-volunteer.dto";

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("volunteer")
export class VolunteerController {
    constructor(private readonly volunteerService: VolunteerService) {}

    @Post("projects")
    createProject(@Body() dto: CreateVolunteerProjectDto, @GetVerifiedUser() user: VerifiedUser) {
        return handleRequest(
            () => this.volunteerService.createProject(dto, user.id),
            "Ngo create volunteer project successfully",
        );
    }

    @Get("allProjects")
    getAllNgoProjects(@GetVerifiedUser() user: VerifiedUser) {
        return handleRequest(
            () => this.volunteerService.getAllNgoProjects(user.id),
            "Get all ngo volunteer project successfully",
        );
    }

    @Get("my-projects")
    getMyProjects(@GetVerifiedUser() user: VerifiedUser) {
        return handleRequest(
            () => this.volunteerService.getNgoProjects(user.id),
            "Get my ngo volunteer project successfully",
        );
    }

    @Post("apply")
    applyToProject(@Body() dto: ApplyVolunteerDto, @GetVerifiedUser() user: VerifiedUser) {
        return handleRequest(
            () => this.volunteerService.applyToProject(dto, user.id),
            "Apply volunteer project successfully",
        );
    }

    // @Patch("log-hours/:applicationId")
    // logHours(
    //     @Param("applicationId") id: string,
    //     @Body() dto: LogHoursDto,
    //     @GetVerifiedUser() user: VerifiedUser,
    // ) {
    //     return handleRequest(
    //         () => this.volunteerService.logHours(id, dto, user.id),
    //         "Apply volunteer project successfully",
    //     );
    // }

    // @Patch("status/:applicationId")
    // updateStatus(
    //     @Param("applicationId") id: string,
    //     @Body() dto: UpdateStatusDto,
    //     @GetVerifiedUser() user: VerifiedUser,
    // ) {
    //     return this.volunteerService.updateStatus(id, dto, user.id);
    // }

    // @Get("my-applications")
    // getMyApplications(@GetVerifiedUser() user: VerifiedUser) {
    //     return this.volunteerService.getVolunteerApplications(user.id);
    // }
}
