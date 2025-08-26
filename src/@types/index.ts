import { Role } from "@constants/enums";

export type TUser = {
  userId: string;
  email: string;
  role: Role;
};
