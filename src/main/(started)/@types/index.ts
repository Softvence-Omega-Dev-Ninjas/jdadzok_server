export type AuthRedisData = {
    token: number;
    expireDate: Date;
    email: string;
    attempt: number;
    userId: string;
};
