export const SOCKET_EVENTS = {
  // Connection Events
  CONNECTION: {
    CONNECT: "connect",
    DISCONNECT: "disconnect",
    USER_JOINED: "user:joined",
    USER_LEFT: "user:left",
    USER_STATUS: "user:status",
  },

  // Chat Events
  CHAT: {
    MESSAGE_SEND: "chat:message:send",
    MESSAGE_RECEIVE: "chat:message:receive",
    MESSAGE_TYPING: "chat:typing",
    MESSAGE_READ: "chat:message:read",
    MESSAGE_DELETE: "chat:message:delete",
    MESSAGE_EDIT: "chat:message:edit",
  },

  // Post Events
  POST: {
    CREATE: "post:create",
    UPDATE: "post:update",
    DELETE: "post:delete",
    LIKE: "post:like",
    UNLIKE: "post:unlike",
    SHARE: "post:share",
    COMMENT_ADD: "post:comment:add",
    COMMENT_UPDATE: "post:comment:update",
    COMMENT_DELETE: "post:comment:delete",
    REACTION_ADD: "post:reaction:add",
    REACTION_REMOVE: "post:reaction:remove",
  },

  // Call Events
  CALL: {
    INITIATE: "call:initiate",
    ACCEPT: "call:accept",
    DECLINE: "call:decline",
    END: "call:end",
    JOIN: "call:join",
    LEAVE: "call:leave",
    SDP_OFFER: "call:sdp:offer",
    SDP_ANSWER: "call:sdp:answer",
    ICE_CANDIDATE: "call:ice:candidate",
    MUTE_AUDIO: "call:mute:audio",
    MUTE_VIDEO: "call:mute:video",
  },

  // Room Events
  ROOM: {
    JOIN: "room:join",
    LEAVE: "room:leave",
    CREATE: "room:create",
    DELETE: "room:delete",
    UPDATE: "room:update",
    LIST_USERS: "room:users:list",
  },

  // Notification Events
  NOTIFICATION: {
    SEND: "notification:send",
    READ: "notification:read",
    READ_ALL: "notification:read:all",
    DELETE: "notification:delete",
  },

  // Error Events
  ERROR: {
    VALIDATION: "error:validation",
    UNAUTHORIZED: "error:unauthorized",
    RATE_LIMIT: "error:rate_limit",
    SERVER_ERROR: "error:server",
  },
} as const;
export type T_SOCKET_EVENTS = typeof SOCKET_EVENTS