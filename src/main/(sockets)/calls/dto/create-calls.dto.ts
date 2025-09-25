import { IsUUID, IsIn } from "class-validator";
import { CallType, callType } from "@constants/enums";

export class CreateCallDto {
    @IsIn(callType)
    type: CallType;

<<<<<<< HEAD
  @IsUUID()
  to: string;

  offer: any;
=======
    @IsUUID()
    to: string[];
>>>>>>> sabbir
}
