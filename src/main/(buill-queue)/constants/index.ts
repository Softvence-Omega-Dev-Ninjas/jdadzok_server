export const QUEUE_JOB_NAME = {
    MAIL: {
        POST_MAIL: "post:mail",
        SEND_OTP: "user:send:otp",
    },
    VERIFICATION: {
        NGO_VERIFICATION: "ngo:verification",
        NGO_VERIFICATION_PROCESSOR: "ngo_verification_processor",
    },
    CAP_LEVEL: {
        CAP_LEVEL_QUEUE_NAME: "cap-level-queue",
    },
} as const;
