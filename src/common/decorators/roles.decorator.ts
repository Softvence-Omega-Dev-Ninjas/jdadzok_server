import type { Role } from "@constants/enums";
import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "role";
export const Roles = <R extends Role>(...roles: R[]) => SetMetadata(ROLES_KEY, roles);

// @Injectable()
// export class RolesGuard implements CanActivate {
//     constructor(private reflector: Reflector) { }

//     async canActivate(context: ExecutionContext): Promise<boolean> {
//         const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
//             context.getHandler(),
//             context.getClass(),
//         ]);

//         if (!requiredRoles) return true;

//         const request = context.switchToHttp().getRequest<RequestWithUser>();
//         const user = request.user;

//         if (!user?.roles) {
//             throw new ForbiddenException("User roles not found");
//         }

//         const hasRole = requiredRoles.some((role) => user.roles!.includes(role));

//         if (!hasRole) {
//             throw new ForbiddenException("Insufficient role");
//         }
//         return true;
//     }
// }
