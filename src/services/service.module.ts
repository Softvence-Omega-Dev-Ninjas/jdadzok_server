import { Logger, Module } from "@nestjs/common";
import { SimpleBaseQueryDto } from "./dto/simple.base.query.dto";
import { JwtServices } from "./jwt.service";
import { ApplicationLogger } from "./logger.service";
import { SocketAuthMiddleware } from "./middleware/socket-auth.middleware";

@Module({
  providers: [
    JwtServices,
    SimpleBaseQueryDto,
    { provide: Logger, useClass: ApplicationLogger },
  ],
  exports: [JwtServices, SocketAuthMiddleware, SimpleBaseQueryDto],
})
export class ServiceModule {}
