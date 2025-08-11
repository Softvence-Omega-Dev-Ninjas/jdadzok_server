import { AnnouncementMeta, ShiftMeta, TimeOffMeta } from './events-meta';

export interface Notification {
  type: string;
  title: string;
  message: string;
  createdAt: Date;
  meta: Record<string, any>;
}

export interface BaseEvent<TMeta> {
  action: string;
  meta: TMeta;
}

export interface AnnouncementEvent extends BaseEvent<AnnouncementMeta> {
  info: {
    title: string;
    message: string;
    recipients: { email: string; id: string }[];
    sendEmail: boolean;
  };
  action: 'CREATE' | 'UPDATE' | 'DELETE';
}

export interface ShiftEvent extends BaseEvent<ShiftMeta> {
  action: 'ASSIGN' | 'CHANGE' | 'STATUS_UPDATE';
}

export interface TimeOffEvent extends BaseEvent<TimeOffMeta> {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
}
