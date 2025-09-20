import { Logger, Module } from "@nestjs/common";
import { SocketMiddleware } from "@project/main/(sockets)/middleware/socket.middleware";
import { SimpleBaseQueryDto } from "./dto/simple.base.query.dto";
import { JwtServices } from "./jwt.service";
import { ApplicationLogger } from "./logger.service";

@Module({
  providers: [
    JwtServices,
    SimpleBaseQueryDto,
    { provide: Logger, useClass: ApplicationLogger },
    SocketMiddleware,
  ],
  exports: [JwtServices, SimpleBaseQueryDto],
})
export class ServiceModule {}
