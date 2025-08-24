import { Role } from '@project/constants';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user?: UserTokenPayload;
}

export interface JWTPayload {
  sub: string;
  email: string;
  roles: string;
}

export interface UserTokenPayload {
  roles: typeof Role[number][];
  email: string;
  userId: string;
  [key: string]: unknown;
}
