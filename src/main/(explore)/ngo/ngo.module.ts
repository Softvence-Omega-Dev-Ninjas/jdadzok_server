import { PrismaService } from '@lib/prisma/prisma.service';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { NgoController } from './ngo.controller';
import { NgoService } from './ngo.service';

@Module({
    
    controllers: [NgoController],
    providers: [NgoService, PrismaService],
    exports: [BullModule, NgoService],
})
export class NgoModule { }
