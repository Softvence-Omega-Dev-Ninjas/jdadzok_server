import { Module } from "@nestjs/common";
import { FavouritelistModule } from "./favouritelist/favouritelist.module";
import { ProductModule } from "./product/product.module";

@Module({
  imports: [ProductModule, FavouritelistModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class MarketplacesGroupModule {}
