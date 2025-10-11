import { TUser } from "@app/@types";
import { PrismaService } from "@app/lib/prisma/prisma.service";
import { JwtServices } from "@app/services/jwt.service";
import { omit } from "@app/utils";
import { Role } from "@constants/enums";
import { JwtAuthGuard } from "@module/(started)/auth/guards/jwt-auth";
import { RolesGuard } from "@module/(started)/auth/guards/role.guard";
import {
    applyDecorators,
    createParamDecorator,
    ExecutionContext,
    NotFoundException,
    SetMetadata,
    UnauthorizedException,
    UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { cookieHandler } from "./cookie.handler";
import { RequestWithUser } from "./jwt.interface";

export const ROLES_KEY = "roles";
export const IS_PUBLIC_KEY = "isPublic";
export const IS_LOCAL_KEY = "isLocal";
export const Roles = <R>(...roles: R[]) => SetMetadata(ROLES_KEY, roles);

export function MakePublic() {
    return SetMetadata(IS_PUBLIC_KEY, true);
}

export const GetUser = createParamDecorator(
    async (key: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<RequestWithUser>();
        const user = request.user;

        if (!cookieHandler(request, "get"))
            throw new UnauthorizedException("Cookies not found on request");

        if (!user || !user.userId) throw new NotFoundException("Request User not found!");
        return key ? user?.[key] : user;
    },
);

export const GetVerifiedUser = createParamDecorator(
    async (key: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<RequestWithUser>();

        const token = cookieHandler(request, "get");
        if (!token || !token.length) throw new NotFoundException("Request User not found!");

        // verify token
        const jwt = new JwtService();
        const configService = new ConfigService();
        const jwtService = new JwtServices(jwt, configService);
        const isVerifyToken = await jwtService.verifyAsync(token);
        if (!isVerifyToken?.email)
            throw new UnauthorizedException("Invalid token your are unauthorized");

        const prisma = new PrismaService();
        const isUser = await prisma.user.findFirst({
            where: {
                OR: [{ id: isVerifyToken.sub }, { email: isVerifyToken.email }],
            },
        });
        if (!isUser) throw new NotFoundException("Request User not found!");

        // check user verified or not
        if (!isUser.isVerified) throw new UnauthorizedException("Please verify your account first");

        const obj = omit(isUser, ["password"])
        return {
            userId: obj.id,
            email: obj.email,
            role: obj.role
        } satisfies TUser;
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
