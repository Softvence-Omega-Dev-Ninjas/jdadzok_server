import { Module } from "@nestjs/common";
import { JwtServices } from "./jwt.service";

@Module({
    providers: [JwtServices],
    exports: [JwtServices]
})
export class ServiceModule { }