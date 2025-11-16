import { PrismaService } from "@lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { EventQueryDto } from "../dto/eventQuery.dto";

@Injectable()
export class EventService {
    constructor(private readonly prisma: PrismaService) {}

    async getOverview() {
        const now = new Date();
        const totalProject = await this.prisma.volunteerProject.count();
        const upcoming = await this.prisma.volunteerProject.count({
            where: {
                startDate: {
                    gt: now,
                },
            },
        });
        const ongoing = await this.prisma.volunteerProject.count({
            where: {
                startDate: { lte: now },
                endDate: { gte: now },
            },
        });
        const pendingApproval = await this.prisma.volunteerProject.count({
            where: {
                applications: {
                    some: {
                        status: "PENDING",
                    },
                },
            },
        });

        return {
            totalProject,
            upcoming,
            ongoing,
            pendingApproval,
        };
    }

    private getStatus(project: any): string {
        const now = new Date();

        if (project.startDate && project.startDate > now) return "Upcoming";
        if (
            project.startDate &&
            project.endDate &&
            project.startDate <= now &&
            project.endDate >= now
        )
            return "Ongoing";
        if (project.endDate && project.endDate < now) return "Completed";

        return "Pending";
    }

    // ---------- LIST PROJECTS WITH SEARCH ----------
    async listEvents(dto: EventQueryDto) {
        const { search } = dto;

        const events = await this.prisma.volunteerProject.findMany({
            where: search
                ? {
                      OR: [
                          // Search in project title
                          { title: { contains: search, mode: "insensitive" } },

                          // Search in NGO profile name
                          {
                              ngo: {
                                  profile: {
                                      name: {
                                          contains: search,
                                          mode: "insensitive",
                                      },
                                  },
                              },
                          },
                      ],
                  }
                : undefined,

            include: {
                ngo: { include: { profile: true } },
                applications: true,
            },

            orderBy: { createdAt: "desc" },
        });

        return this.formatEvents(events);
    }
    private formatEvents(events: any[]) {
        return events.map((event) => {
            const approved = event.applications.filter((a: any) => a.status === "APPROVED").length;

            return {
                id: event.id,
                title: event.title,
                community: event.ngo?.profile?.name || "Unknown NGO",
                date: event.startDate,
                location: event.location,
                participants: `${approved}/200`,
                status: this.getStatus(event),
            };
        });
    }
}
