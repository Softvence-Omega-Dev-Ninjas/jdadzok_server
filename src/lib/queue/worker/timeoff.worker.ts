import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENVEnum } from '@project/common/enum/env.enum';
import { EVENT_TYPES } from '@project/common/interface/events-name';
import { TimeOffEvent } from '@project/common/interface/events-payload';
import { QueueName } from '@project/common/interface/queue-name';
import { MailService } from '@project/lib/mail/mail.service';
import { NotificationGateway } from '@project/lib/notification/notification.gateway';
import { UtilsService } from '@project/lib/utils/utils.service';
import { Worker } from 'bullmq';

@Injectable()
export class TimeOffWorker implements OnModuleInit {
  private logger = new Logger(TimeOffWorker.name);

  constructor(
    private readonly gateway: NotificationGateway,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
    private readonly utils: UtilsService,
  ) {}

  onModuleInit() {
    new Worker<TimeOffEvent>(
      QueueName.TIME_OFF,
      async (job) => {
        const { action, meta } = job.data;

        try {
          const userEmail = await this.utils.getEmailById(meta.userId);

          const message = this.generateMessage(action, meta);
          const title = this.generateTitle(action);
          const eventName = this.generateTimeOffEventName(action);

          this.logger.log(
            `Processing time off event: ${action} for ${userEmail}`,
          );

          // Send Email
          await this.mailService.sendEmail(userEmail, title, message);

          // Send Socket Notification
          this.gateway.notifySingleUser(meta.userId, eventName, {
            type: eventName,
            title,
            message,
            createdAt: new Date(),
            meta,
          });

          this.logger.log(
            `Time off ${action} notification sent to ${userEmail}`,
          );
        } catch (err) {
          this.logger.error(
            `Failed to process time off event ${action}: ${err.message}`,
            err.stack,
          );
        }
      },
      {
        connection: {
          host: this.config.getOrThrow(ENVEnum.REDIS_HOST),
          port: +this.config.getOrThrow(ENVEnum.REDIS_PORT),
        },
      },
    );
  }

  private generateTitle(action: TimeOffEvent['action']): string {
    switch (action) {
      case 'CREATE':
        return 'Time Off Request Created';
      case 'DELETE':
        return 'Time Off Request Deleted';
      case 'UPDATE':
        return 'Time Off Request Updated';
      case 'STATUS_CHANGE':
        return 'Time Off Request Status Changed';
      default:
        return 'Time Off Notification';
    }
  }

  private generateMessage(
    action: TimeOffEvent['action'],
    timeOff: TimeOffEvent['meta'],
  ): string {
    switch (action) {
      case 'CREATE':
        return `Your time off request for ${timeOff.startDate} to ${timeOff.endDate} has been created.`;
      case 'DELETE':
        return `Your time off request for ${timeOff.startDate} to ${timeOff.endDate} has been deleted.`;
      case 'UPDATE':
        return `Your time off request has been updated. New dates: ${timeOff.startDate} to ${timeOff.endDate}.`;
      case 'STATUS_CHANGE':
        return `The status of your time off request has changed to ${timeOff.status}.`;
      default:
        return 'You have a new time off notification.';
    }
  }

  private generateTimeOffEventName(action: TimeOffEvent['action']): string {
    switch (action) {
      case 'CREATE':
        return EVENT_TYPES.TIME_OFF_CREATE;
      case 'DELETE':
        return EVENT_TYPES.TIME_OFF_DELETE;
      case 'UPDATE':
        return EVENT_TYPES.TIME_OFF_UPDATE;
      case 'STATUS_CHANGE':
        return EVENT_TYPES.TIME_OFF_STATUS_CHANGE;
      default:
        return 'timeoff.unknown';
    }
  }
}
