import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { QUEUE_JOB_NAME } from "@project/main/(buill-queue)/constants";
import { Job } from "bullmq";
import { UserService } from "./users.service";

@Processor("users")
export class UsersProcessor extends WorkerHost {
  private readonly logger = new Logger(UsersProcessor.name);
  constructor(private readonly service: UserService) {
    super();
  }
  async process(job: Job): Promise<any> {
    switch (job.name) {
      case QUEUE_JOB_NAME.MAIL.SEND_OTP:
        try {
          await this.service.sendOtpMail({
            email: job.data.email,
            userId: job.data.userId,
          });
        } catch (error: any) {
          this.logger.error("Could not send opt", error);
        }
        return {};
      case QUEUE_JOB_NAME.MAIL.POST_MAIL:
        return new Promise((resolv) => resolv("Hello"));
    }
  }
}
