import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "@project/common/jwt/jwt.decorator";
import { RequestWithUser } from "@project/common/jwt/jwt.interface";
import { Role } from "@project/constants";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!roles) return true;

    const user = ctx.switchToHttp().getRequest<RequestWithUser>().user;
    if (!user?.roles) throw new ForbiddenException("User roles not found");

    const hasRole = roles.some((role) => user.roles!.includes(role));
    if (!hasRole)
      throw new ForbiddenException("User does not have the required roles");

    return hasRole;
  }
}
