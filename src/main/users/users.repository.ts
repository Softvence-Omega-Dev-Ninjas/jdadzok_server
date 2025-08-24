import { Injectable } from "@nestjs/common";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { CreateUserDto } from "./dto/users.dto";

@Injectable()
export class UserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async store(input: CreateUserDto) {
        return this.prisma.user.create({
            data: { ...input }
        })
    }
    async findByEmail(email: string) {
        return await this.prisma.user.findUnique({
            where: { email }
        })
    }
}