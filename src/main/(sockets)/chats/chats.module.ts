import { Module } from "@nestjs/common";
import { ChatService } from "./chat.service";

@Module({
    imports: [],
    controllers: [],
    providers: [ChatService],
    exports: [],
})
export class ChatModule {}
