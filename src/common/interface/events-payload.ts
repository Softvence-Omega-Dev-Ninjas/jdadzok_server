import { AnnouncementMeta } from "./events-meta";

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
  action: "CREATE" | "UPDATE" | "DELETE";
}
