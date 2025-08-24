import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '@project/lib/prisma/prisma.service';
import { UserEnum } from '../enum/user.enum';
import { ROLES_KEY } from './jwt.decorator';
import { RequestWithUser } from './jwt.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    console.log("JWT Auth Guard activated");
    console.log("context: ", context.switchToHttp().getRequest<RequestWithUser>().user);
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user?.roles) {
      throw new ForbiddenException('User roles not found');
    }

    const hasRole = requiredRoles.some((role) => user.roles!.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('Insufficient role');
    }

    // * check if user exists in database
    const userExists = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!userExists) {
      throw new ForbiddenException('User not found');
    }

    return true;
  }
}
