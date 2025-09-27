import { CallType, callType } from "@constants/enums";
import { IsIn, IsUUID } from "class-validator";

export class CreateCallDto {
    @IsIn(callType)
    type: CallType;

    @IsUUID()
    to: string;

    offer: any;
}