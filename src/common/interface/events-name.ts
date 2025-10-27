import { Comment, Community, PostEvent, UserRegistration } from "./events-payload";

//  EVENT TYPE CONSTANTS
export const EVENT_TYPES = {
    Community_CREATE: "Community.create",
    Community_UPDATE: "Community.update",
    Community_DELETE: "Community.delete",

    Comment_CREATE: "Comment.create",
    Comment_UPDATE: "Comment.update",
    Comment_DELETE: "Comment.delete",

    UserRegistration_CREATE: "UserRegistration.create",
    UserRegistration_UPDATE: "UserRegistration.update",
    UserRegistration_DELETE: "UserRegistration.delete",

    Post_CREATE: "Post.create",
    Post_UPDATE: "Post.update",
    Post_DELETE: "Post.delete",
    Message_CREATE: "Message.create",
} as const;

export type EventType = keyof typeof EVENT_TYPES;

export type EventPayloadMap = {
    [EVENT_TYPES.Community_CREATE]: Community;
    [EVENT_TYPES.Community_UPDATE]: Community;
    [EVENT_TYPES.Community_DELETE]: Community;

    [EVENT_TYPES.Comment_CREATE]: Comment;
    [EVENT_TYPES.Comment_UPDATE]: Comment;
    [EVENT_TYPES.Comment_DELETE]: Comment;

    [EVENT_TYPES.UserRegistration_CREATE]: UserRegistration;
    [EVENT_TYPES.UserRegistration_UPDATE]: UserRegistration;
    [EVENT_TYPES.UserRegistration_DELETE]: UserRegistration;

    [EVENT_TYPES.Post_CREATE]: PostEvent;
    [EVENT_TYPES.Post_UPDATE]: PostEvent;
    [EVENT_TYPES.Post_DELETE]: PostEvent;
    [EVENT_TYPES.Message_CREATE]?: any;
};
