import { Injectable, ForbiddenException } from "@nestjs/common";

import { CreateVolunteerProjectDto } from "./dto/create-volunteer-project.dto";

import { PrismaService } from "@lib/prisma/prisma.service";

@Injectable()
export class VolunteerService {
    constructor(private prisma: PrismaService) {}

    async createProject(dto: CreateVolunteerProjectDto, userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new ForbiddenException("Only NGO users can create projects");

        return this.prisma.volunteerProject.create({
            data: { ...dto, createdById: userId, ngoId: dto.ngoId },
        });
    }

    // async applyToProject(dto: ApplyVolunteerDto, userId: string) {
    //     const user = await this.prisma.user.findUnique({ where: { id: userId } });
    //     if (!user || user.role !== Role.USER)
    //         throw new ForbiddenException("Only regular volunteers can apply");

    //     const existing = await this.prisma.volunteerApplication.findFirst({
    //         where: { projectId: dto.projectId, volunteerId: userId },
    //     });
    //     if (existing) throw new BadRequestException("You already applied to this project");

    //     return this.prisma.volunteerApplication.create({
    //         data: { projectId: dto.projectId, volunteerId: userId },
    //     });
    // }

    // async logHours(applicationId: string, dto: LogHoursDto, userId: string) {
    //     const app = await this.prisma.volunteerApplication.findUnique({
    //         where: { id: applicationId },
    //     });
    //     if (!app) throw new NotFoundException("Application not found");
    //     if (app.volunteerId !== userId)
    //         throw new ForbiddenException("You can only log hours for your own application");

    //     const total = app.workedHours + dto.hours;
    //     if (total > 352) throw new BadRequestException("Cannot exceed 352 working hours");

    //     return this.prisma.volunteerApplication.update({
    //         where: { id: applicationId },
    //         data: { workedHours: total },
    //     });
    // }

    // async updateStatus(applicationId: string, dto: UpdateStatusDto, userId: string) {
    //     const app = await this.prisma.volunteerApplication.findUnique({
    //         where: { id: applicationId },
    //         include: { project: true },
    //     });
    //     if (!app) throw new NotFoundException("Application not found");
    //     if (app.project.createdById !== userId)
    //         throw new ForbiddenException("Only NGO owner can confirm completion");

    //     const updated = await this.prisma.volunteerApplication.update({
    //         where: { id: applicationId },
    //         data: {
    //             status: dto.status,
    //             completionNote: dto.completionNote,
    //             confirmedById: userId,
    //         },
    //     });

    // Auto endorsement after COMPLETED
    //     if (dto.status === ApplicationStatus.COMPLETED) {
    //         await this.prisma.endorsement.create({
    //             data: {
    //                 fromUserId: userId,
    //                 toUserId: app.volunteerId,
    //                 message: dto.completionNote || "Excellent volunteer work!",
    //                 projectId: app.projectId,
    //             },
    //         });
    //     }

    //     return updated;
    // }

    // async getVolunteerApplications(userId: string) {
    //     return this.prisma.volunteerApplication.findMany({
    //         where: { volunteerId: userId },
    //         include: { project: true },
    //     });
    // }

    // async getNgoProjects(userId: string) {
    //     return this.prisma.volunteerProject.findMany({
    //         where: { createdById: userId },
    //         include: { applications: true },
    //     });
    // }
}
