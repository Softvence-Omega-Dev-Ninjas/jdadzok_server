import { Module } from "@nestjs/common";
import { SimpleBaseQueryDto } from "./dto/simple.base.query.dto";
import { JwtServices } from "./jwt.service";
import { SocketAuthMiddleware } from "./middleware/socket-auth.middleware";

@Module({
  providers: [JwtServices, SimpleBaseQueryDto],
  exports: [JwtServices, SocketAuthMiddleware, SimpleBaseQueryDto],
})
export class ServiceModule {}
