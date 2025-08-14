import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { QueueName } from '@project/common/interface/queue-name';
import { CompanyEventService } from './services/company-event.service';
import { CompanyAnnouncementWorker } from './worker/company-announcement.worker';

@Global()
@Module({
  imports: [BullModule.registerQueue({ name: QueueName.ANNOUNCEMENT })],
  providers: [CompanyAnnouncementWorker, CompanyEventService],
  exports: [BullModule],
})
export class QueueModule {}
