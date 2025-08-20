import { Module } from '@nestjs/common';
import { PostModule } from '@project/main/posts/posts.module';
import { UserModule } from '@project/main/users/users.module';
// import { AuthModule } from './auth/auth.module';

@Module({
  // TODO: need to add AuthModule
  imports: [UserModule, PostModule],
  controllers: [],
  providers: [],
})
export class MainModule { }
