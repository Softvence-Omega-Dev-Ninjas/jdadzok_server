import { CreateProductDto } from "@project/main/(marketplace)/product/dto/product.dto";
import { BaseSocketEvent } from "./base.types";

export interface marketplaceEvent extends BaseSocketEvent {
    action: "create" | "update" | "delete";
    content: CreateProductDto;
    userId: string;
}
