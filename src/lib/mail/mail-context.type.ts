export type MailTemplateType = "otp" | "friend-request";

export type MailContext = {
    otp?: string;
    senderName?: string;
    avatarUrl?: string;
    // it is allow to passing anothers key value that i'm not define yet
    [key: string]: string | number | boolean | undefined;
};
