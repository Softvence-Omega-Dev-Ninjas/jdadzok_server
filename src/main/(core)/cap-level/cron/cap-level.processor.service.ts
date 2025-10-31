import { QUEUE_JOB_NAME } from "@module/(buill-queue)/constants";
import { UserMetricsService } from "@module/(users)/profile-metrics/user-metrics.service";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CapLevel, User } from "@prisma/client";
import { Job, Queue } from "bullmq";
import { AdRevenueService } from "../../ad-revenue/ad-revenue.service";

import { CapLevelService } from "../cap-lavel.service";
import {
    BatchMetricsJobData,
    BatchPromotionJobData,
    MonthlyRevenueJobData,
    UserMetricsUpdateJobData,
    UserPromotionJobData,
    VolunteerHoursJobData,
} from "../types";
import { PrismaService } from "@lib/prisma/prisma.service";

@Injectable()
export class CapLevelProcessorService {
    private readonly logger = new Logger(CapLevelProcessorService.name);

    constructor(
        @InjectQueue(QUEUE_JOB_NAME.CAP_LEVEL.CAP_LEVEL_QUEUE_NAME) private readonly queue: Queue,
        private readonly capLevelService: CapLevelService,
        private readonly userMetricsService: UserMetricsService,
        private readonly adRevenueService: AdRevenueService,
        private readonly prisma:PrismaService
    ) {
        this.logger.log("Cap Level Processor initialized");
    }
    

    async handleUserCaplevelCheckingAndDedicatedToUserusers(users:User[]){
        const adminScore=await this.prisma.activityScore.findFirst()
        if(!adminScore){
            throw new NotFoundException("Admin must need to set all activity score for his platfrom..")
        }
       for(const user of users){
         const UserMatrix=await this.prisma.userMetrics.findFirst({
            where:{
                userId:user.id
            }
         })
         if(UserMatrix&&UserMatrix.activityScore<100){
            console.log("this user not eligble for cap Promotion")
         }
         if(UserMatrix&&UserMatrix.activityScore>=adminScore.greenCapScore){
            if(user.capLevel===CapLevel.GREEN){
               continue
            }
            user.capLevel=CapLevel.GREEN
         }else if(UserMatrix&&UserMatrix.activityScore>=adminScore.yellowCapScore){
            if(user.capLevel===CapLevel.YELLOW){
               continue
            }
            user.capLevel=CapLevel.YELLOW
         }else if(UserMatrix&&UserMatrix.activityScore>=adminScore.redCapScore){
            if(user.capLevel===CapLevel.RED){
               continue
            }
            user.capLevel=CapLevel.BLACK
           
         }else if(UserMatrix&&UserMatrix.activityScore>=adminScore.redCapScore){
            if(user.capLevel===CapLevel.RED){
               continue
            }
            user.capLevel=CapLevel.RED
           
         }
       }
    }
}
