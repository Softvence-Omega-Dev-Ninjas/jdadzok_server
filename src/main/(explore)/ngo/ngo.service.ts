import { Injectable } from "@nestjs/common";
import { PrismaService } from "@project/lib/prisma/prisma.service";

@Injectable()
export class NgoService {
  constructor(private readonly prisma: PrismaService) {}
}
