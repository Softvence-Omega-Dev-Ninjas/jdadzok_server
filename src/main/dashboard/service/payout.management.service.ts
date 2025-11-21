import { PrismaService } from "@lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PayoutManagementService {
    constructor(private prisma: PrismaService) {}
}
