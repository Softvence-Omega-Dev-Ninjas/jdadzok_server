export const redisKey = {
  RESET_PASSWORD_TOKEN: "RESET_PASSWORD_TOKEN",
  EMAIL_VERIFICATION_TOKEN: "EMAIL_VERIFICATION_TOKEN",
  USER_SESSION: "USER_SESSION",
  PRODUCT_CACHE: "PRODUCT_CACHE",
  ORDER_CACHE: "ORDER_CACHE",

  // SOCKET
  SOCKET: "SOCKET",
  // upload files
  S3FileHash: "s3:fileHash",

} as const;

export type RedisKey = keyof typeof redisKey;
