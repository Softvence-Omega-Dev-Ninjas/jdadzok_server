import { Injectable } from "@nestjs/common";
import { CreateMessageDto } from "./dto/create.message.dto";

@Injectable()
export class ChatService {
  async createMessage(userId: string, input: CreateMessageDto) {
    return { userId, input };
  }
}
