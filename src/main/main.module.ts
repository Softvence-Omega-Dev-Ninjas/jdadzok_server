import { Module } from '@nestjs/common';
import { PostModule } from '@project/main/posts/posts.module';
import { UserModule } from '@project/main/users/users.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './categories/category.module';

@Module({
  imports: [AuthModule, UserModule, PostModule, CategoryModule],
  controllers: [],
  providers: [],
})
export class MainModule { }
