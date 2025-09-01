import { Module } from "@nestjs/common";
import { SimpleBaseQueryDto } from "./dto/simple.base.query.dto";
import { JwtServices } from "./jwt.service";

@Module({
  providers: [JwtServices, SimpleBaseQueryDto],
  exports: [JwtServices, SimpleBaseQueryDto],
})
export class ServiceModule {}
