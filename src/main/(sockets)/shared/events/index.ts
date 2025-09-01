import { NotificationEvents } from "@module/(shared)/notifications/dto/notification.event";
import { ChatEvents } from "@module/(sockets)/chats/dto/chat.event";
import { BaseSocketEvent } from "../../@types";

export type AppSocketEvents = BaseSocketEvent & ChatEvents & NotificationEvents;