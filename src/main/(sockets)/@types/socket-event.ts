export type BaseSocketEvent = {
  "system:ping": {
    timestamp: Date;
  };
  "system:error": {
    message: string;
  };
};

// marge mulitple event maps into single one
// export type MargeEvents<T extends Record<string, any>[]> = T extends [
//   infer F,
//   ...infer R,
// ]
//   ? F & MargeEvents<Extract<R, Record<string, any>[]>>
//   : {};
