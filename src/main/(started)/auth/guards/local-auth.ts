import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { IS_LOCAL_KEY } from "@project/common/jwt/jwt.decorator";

@Injectable()
export class LocalAuthGuard extends AuthGuard(IS_LOCAL_KEY) {}
