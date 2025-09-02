export type ChatEvents = {
  "chat:message": {
    roomId: string;
    senderId: string;
    content: string;
  };
};
