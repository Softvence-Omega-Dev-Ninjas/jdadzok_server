import { Role } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  employeeID: number;

  @Expose()
  role: Role;

  @Expose()
  isLogin: boolean;

  @Expose()
  isVerified: boolean;

  @Expose()
  lastLoginAt?: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
