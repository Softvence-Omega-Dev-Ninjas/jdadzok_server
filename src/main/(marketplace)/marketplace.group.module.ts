import { Module } from "@nestjs/common";
import { FavouritelistModule } from "./favouritelist/favouritelist.module";
import { HideModule } from "./hide/hide.module";
import { ProductModule } from "./product/product.module";
@Module({
  imports: [ProductModule, FavouritelistModule, HideModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class MarketplacesGroupModule { }
