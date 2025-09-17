import { BaseSocketEvent } from "./base.types";

export interface marketplaceEvent extends BaseSocketEvent {
    action: "create" | "update" | "delete";
}