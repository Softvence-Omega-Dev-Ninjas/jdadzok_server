import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "@project/common/jwt/jwt.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(ctx: ExecutionContext) {
        console.log('Attempting to validate JWT...');

        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            ctx.getHandler(),
            ctx.getClass()
        ])

        if (isPublic) return true
        return super.canActivate(ctx)
    }
    handleRequest<U, IF>(err: any, user: U, info: IF, context: ExecutionContext): U {
        if (err || !user) {
            console.error('Authentication Failed:', { err, info });

            // Re-throw the UnauthorizedException or a custom error
            throw err || new UnauthorizedException();
        }

        return user;
    }
}