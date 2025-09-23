import { IsString, IsUUID } from "class-validator";

export class SignalDto {
  @IsUUID()
  callId: string;

  @IsUUID()
  targetId: string;

  @IsString()
  payload: any;
}
