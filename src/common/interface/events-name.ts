import { Comment, Community, Ngo, PostEvent, UserRegistration } from "./events-payload";

// 🚀 EVENT TYPE CONSTANTS (All in UPPERCASE for consistency)
export const EVENT_TYPES = {
    COMMUNITY_CREATE: "community.create",
    COMMUNITY_UPDATE: "community.update",
    COMMUNITY_DELETE: "community.delete3",

    POST_CREATE: "post.create",
    POST_UPDATE: "post.update",
    POST_DELETE: "post.delete",

    NGO_CREATE: "ngo.create",
    NGO_UPDATE: "ngo.update",
    NGO_DELETE: "ngo.delete",


    COMMENT_CREATE: "COMMENT_CREATE",
    COMMENT_UPDATE: "COMMENT_UPDATE",
    COMMENT_DELETE: "COMMENT_DELETE",

    USERREGISTRATION_CREATE: "USERREGISTRATION_CREATE",
    USERREGISTRATION_UPDATE: "USERREGISTRATION_UPDATE",
    USERREGISTRATION_DELETE: "USERREGISTRATION_DELETE",



    MESSAGE_CREATE: "message.crate",
} as const;

// Type-safe keys for autocomplete
export type EventType = keyof typeof EVENT_TYPES;

//  Event payload mapping for type safety
export type EventPayloadMap = {
    [EVENT_TYPES.COMMUNITY_CREATE]: Community;
    [EVENT_TYPES.COMMUNITY_UPDATE]: Community;
    [EVENT_TYPES.COMMUNITY_DELETE]: Community;

    [EVENT_TYPES.COMMENT_CREATE]: Comment;
    [EVENT_TYPES.COMMENT_UPDATE]: Comment;
    [EVENT_TYPES.COMMENT_DELETE]: Comment;

    [EVENT_TYPES.USERREGISTRATION_CREATE]: UserRegistration;
    [EVENT_TYPES.USERREGISTRATION_UPDATE]: UserRegistration;
    [EVENT_TYPES.USERREGISTRATION_DELETE]: UserRegistration;

    [EVENT_TYPES.POST_CREATE]: PostEvent;
    [EVENT_TYPES.POST_UPDATE]: PostEvent;
    [EVENT_TYPES.POST_DELETE]: PostEvent;

    [EVENT_TYPES.NGO_CREATE]: Ngo;
    [EVENT_TYPES.NGO_UPDATE]: Ngo;
    [EVENT_TYPES.NGO_DELETE]: Ngo;

    [EVENT_TYPES.MESSAGE_CREATE]?: any;
};
