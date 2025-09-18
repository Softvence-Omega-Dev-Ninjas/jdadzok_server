import { Module } from "@nestjs/common";
import { FavouritelistModule } from "./favouritelist/favouritelist.module";
import { HideModule } from "./hide/hide.module";
import { ProductCategoryModule } from './product-category/product-category.module';
import { ProductModule } from "./product/product.module";
@Module({
  imports: [ProductModule, FavouritelistModule, HideModule, ProductCategoryModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class MarketplacesGroupModule { }
