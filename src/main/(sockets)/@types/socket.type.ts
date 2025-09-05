export type SocketPayload<T = any> = {
  from?: string; // userId or system
  to?: string | string[]; // receivers
  roomId?: string; // for group chatting or group calling
  type: string; // "text" | "image" | "video" | "call" | "notification"
  data: T; // payload of socket event data
  meta?: Record<string, any>; // otpional metadata if need then we can pass as key value paris
};
