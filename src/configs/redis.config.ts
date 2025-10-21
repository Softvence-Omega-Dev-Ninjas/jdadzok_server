import { ENVEnum } from "@common/enum/env.enum";
import { createKeyv } from "@keyv/redis";
import { CacheModuleAsyncOptions } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CacheableMemory } from "cacheable";
import { Keyv } from "keyv";

export const RedisConfig: CacheModuleAsyncOptions = {
    isGlobal: true,
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.getOrThrow(ENVEnum.REDIS_URL);

        return {
            stores: [
                new Keyv({
                    store: new CacheableMemory({ ttl: 3600000 }),
                }),
                createKeyv(redisUrl),
            ],
        };
    },
    inject: [ConfigService],
};
