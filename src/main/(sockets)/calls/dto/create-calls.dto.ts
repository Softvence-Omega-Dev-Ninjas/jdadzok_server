import { IsUUID, IsIn } from "class-validator";
import { CallType, callType } from "@constants/enums";

export class CreateCallDto {
  @IsIn(callType)
  type: CallType;

  @IsUUID()
  to: string[];
}
