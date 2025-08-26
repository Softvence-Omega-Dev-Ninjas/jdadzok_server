import { ENVEnum } from "@common/enum/env.enum";
import { createKeyv } from '@keyv/redis';
import { CacheModuleAsyncOptions } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Cacheable } from 'cacheable';

export const CACHE_INSTANCE = 'CACHE_INSTANCE'
export const RedisConfig: CacheModuleAsyncOptions = {
    isGlobal: true,
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => {
        const redisHost = configService.getOrThrow(ENVEnum.REDIS_HOST);
        const redisPort = configService.getOrThrow(ENVEnum.REDIS_PORT);
        const redisUrl = `redis://${redisHost}:${redisPort}`;

        const secondary = createKeyv(redisUrl);
        return new Cacheable({ secondary, ttl: '4h' });
    },
    inject: [ConfigService]
}