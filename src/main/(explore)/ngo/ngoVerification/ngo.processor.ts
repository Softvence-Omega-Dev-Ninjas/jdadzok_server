import { QUEUE_JOB_NAME } from "@module/(buill-queue)/constants";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { InternalServerErrorException, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { NgoVerificationService } from "./ngo-verification.service";


@Processor(QUEUE_JOB_NAME.VERIFICATION.NGO_VERIFICATION_PROCESSOR)
export class NgoVerificationProcessor extends WorkerHost {
    private readonly logger = new Logger(NgoVerificationProcessor.name);

    constructor(private readonly service: NgoVerificationService) {
        super();
    }

    async process<T = any>(job: Job): Promise<T | string | undefined> {
        switch (job.name) {
            case QUEUE_JOB_NAME.VERIFICATION.NGO_VERIFICATION:
                try {
                    // TODO: Call your verification third party provider
                    return new Promise((resolv) => resolv("Hello")); // TODO: remove this line and return your data
                } catch (error: any) {
                    this.logger.error("Fail to process ngo verification job", error);
                    throw new InternalServerErrorException(error.message);
                }
        }
    }
}
