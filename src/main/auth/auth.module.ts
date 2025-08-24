import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '@project/common/jwt/jwt.strategy';
import { JwtServices } from '@project/services/jwt.service';
import { UserRepository } from '../users/users.repository';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

@Module({
    imports: [JwtModule.register({})],
    controllers: [AuthController],
    providers: [AuthService, UserRepository, AuthRepository, JwtServices, JwtService, JwtStrategy],
    exports: [AuthRepository, JwtModule]
})
export class AuthModule { }
