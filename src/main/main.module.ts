import { Module } from '@nestjs/common';
import { PostModule } from '@project/main/posts/posts.module';
import { UserModule } from '@project/main/users/users.module';

@Module({
  imports: [UserModule, PostModule],
  controllers: [],
  providers: [],
})
export class MainModule { }
