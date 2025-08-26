import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { ChoicesModule } from "./choices/choices.module";

@Module({
  imports: [AuthModule, ChoicesModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class StartedGroupModule {}
