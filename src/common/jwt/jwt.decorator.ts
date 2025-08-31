import { Role } from "@constants/enums";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import { RolesGuard } from "@module/(started)/auth/guards/role.guard";
import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  NotFoundException,
  SetMetadata,
  UseGuards,
} from "@nestjs/common";
import { RequestWithUser } from "./jwt.interface";

export const ROLES_KEY = "roles";
export const IS_PUBLIC_KEY = "isPublic";
export const IS_LOCAL_KEY = "isLocal";
export const Roles = <R>(...roles: R[]) => SetMetadata(ROLES_KEY, roles);

export function MakePublic() {
  return SetMetadata(IS_PUBLIC_KEY, true);
}

export const GetUser = createParamDecorator(
  (key: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user
      || !user.userId
    ) throw new NotFoundException("Request User not found!");

    return key ? user?.[key] : user;
  },
);

export function ValidateAuth<R extends Role>(...roles: R[]) {
  const decorators = [UseGuards(JwtAuthGuard, RolesGuard)];
  if (roles.length > 0) {
    decorators.push(Roles(...roles));
  }
  return applyDecorators(...decorators);
}

export function ValidateSuperAdmin() {
  return ValidateAuth("SUPER_ADMIN");
}

export function ValidateAdmin() {
  return ValidateAuth("ADMIN", "SUPER_ADMIN");
}

export function ValidateUser() {
  return ValidateAuth("USER", "SUPER_ADMIN");
}
