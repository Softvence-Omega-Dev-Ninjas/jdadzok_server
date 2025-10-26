import {
    CommentMeta,
    CommunityMeta,
    MessageMeta,
    PostMeta,
    UserRegistrationMeta,
} from "./events-meta";

//  Generic Base Event
export interface BaseEvent<TMeta> {
    action: "CREATE" | "UPDATE" | "DELETE";
    meta: TMeta;
}

//  Notification Base
export interface Notification {
    type: string;
    title: string;
    message: string;
    createdAt: Date;
    meta: Record<string, any>;
}

//  Individual Events

export interface UserRegistration extends BaseEvent<UserRegistrationMeta> {
    info: {
        email: string;
        id: string;
        name: string;
        role: string;
    };
}

// Community Event
export interface Community extends BaseEvent<CommunityMeta> {
    info: {
        title: string;
        message: string;
        recipients: { email: string; id: string }[];
    };
}

// Comment Event
export interface Comment extends BaseEvent<CommentMeta> {
    info: {
        title: string;
        message: string;
        recipients: { email: string; id: string }[];
        sendEmail: boolean;
    };
}

// Post Event
export interface PostEvent {
    action: "CREATE" | "UPDATE" | "DELETE";
    meta: PostMeta;
    info: {
        title: string;
        message: string;
        authorId: string;
        recipients: { id: string; email: string }[];
        sendEmail: boolean;
    };
}

//  Message Event
export interface Message extends BaseEvent<MessageMeta> {
    info: {
        fromUserId: string;
        toUserId: string;
        content: string;
        sendEmail: boolean;
    };
}
