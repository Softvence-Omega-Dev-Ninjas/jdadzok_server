import { RedisKey } from "@constants/redis.key";
import { TTL, TTLKey } from "@constants/ttl.constants";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { Cache } from "cache-manager";


@Injectable()
export class RedisService implements OnModuleInit {
    constructor(
        @Inject(CACHE_MANAGER) private readonly cache: Cache,
    ) { }

    async onModuleInit() {
        try {
            await this.cache.get('test_connection');
            console.log('✅ Redis connection successful!');
        } catch (err) { console.error('❌ Redis connection failed!', err) }
    }

    async set<V>(key: RedisKey, value: V, ttl: number | TTLKey = "1d"
    ) {
        const ttlInSecond = typeof ttl === "string" ? TTL[ttl] : ttl
        return await this.cache.set(key, value && JSON.stringify(value), ttlInSecond)
    }

    async get<V>(key: RedisKey): Promise<V> {
        const value = await this.cache.get(key) as string;
        return value && JSON.parse(value) as V as any
    }

    async delete(key: RedisKey): Promise<void> {
        await this.cache.del(key)
    }
}
