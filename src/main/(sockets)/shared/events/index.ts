import { NotificationEvents } from "@module/(shared)/notifications/dto/notification.event";
import { BaseSocketEvent } from "../../@types";

export type AppSocketEvents = BaseSocketEvent & NotificationEvents;
