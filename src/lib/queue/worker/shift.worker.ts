import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENVEnum } from '@project/common/enum/env.enum';
import { EVENT_TYPES } from '@project/common/interface/events-name';
import { ShiftEvent } from '@project/common/interface/events-payload';
import { QueueName } from '@project/common/interface/queue-name';
import { MailService } from '@project/lib/mail/mail.service';
import { NotificationGateway } from '@project/lib/notification/notification.gateway';
import { UtilsService } from '@project/lib/utils/utils.service';
import { Worker } from 'bullmq';

@Injectable()
export class ShiftWorker implements OnModuleInit {
  private logger = new Logger(ShiftWorker.name);

  constructor(
    private readonly gateway: NotificationGateway,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
    private readonly utils: UtilsService,
  ) {}

  onModuleInit() {
    new Worker<ShiftEvent>(
      QueueName.SHIFT,
      async (job) => {
        const {
          action,
          meta: { userId, shiftId, ...meta },
        } = job.data;

        try {
          const userEmail = await this.utils.getEmailById(userId);
          const shift = await this.utils.getDefaultShiftById(shiftId);

          const message = this.generateMessage(action, shift, meta);
          const title = this.generateTitle(action);
          const eventName = this.generateShiftEventName(action);

          this.logger.log(`Processing shift event: ${action} for ${userEmail}`);

          // Send Email
          await this.mailService.sendEmail(userEmail, title, message);

          // Send Socket Notification
          this.gateway.notifySingleUser(userId, eventName, {
            type: eventName,
            title,
            message,
            createdAt: new Date(),
            meta,
          });

          this.logger.log(`Shift ${action} notification sent to ${userEmail}`);
        } catch (err) {
          this.logger.error(
            `Failed to process shift event ${action}: ${err.message}`,
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

  private generateTitle(action: ShiftEvent['action']): string {
    switch (action) {
      case 'ASSIGN':
        return 'New Shift Assigned';
      case 'STATUS_UPDATE':
        return 'Your Shift Status Updated';
      case 'CHANGE':
        return 'Shift Details Updated';
      default:
        return 'Shift Notification';
    }
  }

  private generateMessage(
    action: ShiftEvent['action'],
    shift: any,
    meta: any,
  ): string {
    switch (action) {
      case 'ASSIGN':
        return `
          <p>You have been assigned a new shift.</p>
          <ul>
            <li><strong>Start:</strong> ${new Date(shift.startTime).toLocaleString()}</li>
            <li><strong>End:</strong> ${new Date(shift.endTime).toLocaleString()}</li>
          </ul>
        `;
      case 'STATUS_UPDATE':
        return `
          <p>Your shift status has been updated to: <strong>${meta.status || shift.status}</strong>.</p>
          <p>Shift starts at ${new Date(shift.startTime).toLocaleString()}</p>
        `;
      case 'CHANGE':
        return `
          <p>Your shift has been updated with new details.</p>
          <ul>
            <li><strong>Start:</strong> ${new Date(shift.startTime).toLocaleString()}</li>
            <li><strong>End:</strong> ${new Date(shift.endTime).toLocaleString()}</li>
          </ul>
        `;
      default:
        return `<p>You have a shift update.</p>`;
    }
  }

  private generateShiftEventName(action: ShiftEvent['action']): string {
    switch (action) {
      case 'ASSIGN':
        return EVENT_TYPES.SHIFT_ASSIGN;
      case 'CHANGE':
        return EVENT_TYPES.SHIFT_CHANGE;
      case 'STATUS_UPDATE':
        return EVENT_TYPES.SHIFT_STATUS_UPDATE;
      default:
        return 'shift.unknown';
    }
  }
}
