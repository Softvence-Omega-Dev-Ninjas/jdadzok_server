import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { VolunteerService } from "./volunteer.service";
import { CreateVolunteerProjectDto } from "./dto/create-volunteer-project.dto";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import { GetVerifiedUser } from "@common/jwt/jwt.decorator";
import { VerifiedUser } from "@type/shared.types";
import { handleRequest } from "@common/utils/handle.request.util";
import { ApiBearerAuth } from "@nestjs/swagger";

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("volunteer")
export class VolunteerController {
    constructor(private readonly volunteerService: VolunteerService) {}

    @Post("projects")
    createProject(@Body() dto: CreateVolunteerProjectDto, @GetVerifiedUser() user: VerifiedUser) {
        return handleRequest(
            () => this.volunteerService.createProject(dto, user.id),
            "Ngo create project successfully",
        );
    }

    // @Post("apply")
    // applyToProject(@Body() dto: ApplyVolunteerDto, @GetVerifiedUser() user: VerifiedUser) {
    //     return this.volunteerService.applyToProject(dto, user.id);
    // }

    // @Patch("log-hours/:applicationId")
    // logHours(
    //     @Param("applicationId") id: string,
    //     @Body() dto: LogHoursDto,
    //     @GetVerifiedUser() user: VerifiedUser,
    // ) {
    //     return this.volunteerService.logHours(id, dto, user.id);
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

    // @Get("my-projects")
    // getMyProjects(@GetVerifiedUser() user: VerifiedUser) {
    //     return this.volunteerService.getNgoProjects(user.id);
    // }
}
