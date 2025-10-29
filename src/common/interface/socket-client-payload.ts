export type PayloadForSocketClient = {
    sub: string;
    email: string;
    emailToggle: boolean;
    userUpdates: boolean;
    communication: boolean;
    community: boolean;
    comment: boolean;
    post: boolean;
    message: boolean;
    userRegistration: boolean;
};
