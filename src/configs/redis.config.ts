import { CacheModuleAsyncOptions } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ENVEnum } from "@project/common/enum/env.enum";
import { CacheableMemory, createKeyv } from 'cacheable';
import { Keyv } from 'keyv';


export const RedisConfig: CacheModuleAsyncOptions = {
    isGlobal: true,
    imports: [ConfigModule],

    useFactory: async (configService: ConfigService) => ({
        stores: [
            new Keyv({
                store: new CacheableMemory({ ttl: 60000, lruSize: 5000 })
            }),
            createKeyv(configService.getOrThrow(ENVEnum.REDIS_URL)),
        ]
    }),
    inject: [ConfigService],
}
