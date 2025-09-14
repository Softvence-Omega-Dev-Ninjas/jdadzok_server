import { AnnouncementEvent } from "./events-payload";

export const EVENT_TYPES = {
  COMPANY_ANNOUNCEMENT_CREATE: "company-announcement.create",
} as const;

export type EventPayloadMap = {
  [EVENT_TYPES.COMPANY_ANNOUNCEMENT_CREATE]: AnnouncementEvent;
};
