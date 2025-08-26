import { Module } from "@nestjs/common";
import { ProductModule } from "./product/product.module";

@Module({
    imports: [ProductModule],
    controllers: [],
    providers: [],
    exports: [],
})
export class MarketplacesGroupModule { }