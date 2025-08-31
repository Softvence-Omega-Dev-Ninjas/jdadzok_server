import { Role } from "@constants/enums";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

export type TUser = {
  userId: string;
  email: string;
  role: Role;
};

export type HelperTx = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;
export type PaginatedResult<T> = {
  data: T[];
  nextCursor?: string;
};
