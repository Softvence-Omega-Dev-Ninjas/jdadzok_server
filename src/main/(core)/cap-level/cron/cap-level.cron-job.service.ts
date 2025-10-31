import { QUEUE_JOB_NAME } from "@module/(buill-queue)/constants";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Queue } from "bullmq";
import { capLevelJobType } from "../constants";

@Injectable()
export class CapLevelCronJobService {
    private readonly logger = new Logger(CapLevelCronJobService.name);

    constructor(
        @InjectQueue(QUEUE_JOB_NAME.CAP_LEVEL.CAP_LEVEL_QUEUE_NAME) private capLevelQueue: Queue,
    ) { }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async scheduleJob() {
        // call your queue from here...
        this.capLevelQueue.add(capLevelJobType.CALCULATE_USER_ELIGIBILITY, {
            message: "hello",
            // TODO: pass your all required data from here that you will receive to your processor based on the queue name you'll get the every single block into the switch case
        });
        this.capLevelQueue.add(capLevelJobType.BATCH_PROMOTE_USERS, {
            message: "hello",
            // TODO: pass your all required data from here that you will receive to your processor based on the queue name you'll get the every single block into the switch case
        });
    }
    // TODO: Write here your another job for diff shedule time as like the same format
}
