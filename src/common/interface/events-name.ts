import { AnnouncementEvent, ShiftEvent, TimeOffEvent } from './events-payload';

export const EVENT_TYPES = {
  COMPANY_ANNOUNCEMENT_CREATE: 'company-announcement.create',
  SHIFT_ASSIGN: 'shift.assign',
  SHIFT_CHANGE: 'shift.change',
  SHIFT_STATUS_UPDATE: 'shift.status.update',

  TIME_OFF_CREATE: 'timeoff.create',
  TIME_OFF_UPDATE: 'timeoff.update',
  TIME_OFF_DELETE: 'timeoff.delete',
  TIME_OFF_STATUS_CHANGE: 'timeoff.status.change',
} as const;

export type EventPayloadMap = {
  [EVENT_TYPES.COMPANY_ANNOUNCEMENT_CREATE]: AnnouncementEvent;
  [EVENT_TYPES.SHIFT_ASSIGN]: ShiftEvent;
  [EVENT_TYPES.SHIFT_CHANGE]: ShiftEvent;
  [EVENT_TYPES.SHIFT_STATUS_UPDATE]: ShiftEvent;

  [EVENT_TYPES.TIME_OFF_CREATE]: TimeOffEvent;
  [EVENT_TYPES.TIME_OFF_UPDATE]: TimeOffEvent;
  [EVENT_TYPES.TIME_OFF_DELETE]: TimeOffEvent;
  [EVENT_TYPES.TIME_OFF_STATUS_CHANGE]: TimeOffEvent;
};
