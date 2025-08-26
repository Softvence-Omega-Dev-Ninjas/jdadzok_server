import { RedisKey } from "@constants/redis.key";
import { TTL, TTLKey } from "@constants/ttl.constants";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import Keyv from 'keyv';


@Injectable()
export class RedisService implements OnModuleInit {
    constructor(@Inject(CACHE_MANAGER) private readonly cache: Keyv) { }

    async onModuleInit() {
        try {
            await this.cache.get('test_connection');
            console.log('✅ Redis connection successful!');
        } catch (err) { console.error('❌ Redis connection failed!', err) }
    }

    async set<V>(key: RedisKey, value: V, ttl: number | TTLKey = "1d"
    ) {
        const ttlInSecond = typeof ttl === "string" ? TTL[ttl] : ttl
        return await this.cache.set(key, JSON.stringify(value), ttlInSecond)
    }

    async get<V>(key: RedisKey): Promise<V> {
        const value = await this.cache.get(key)
        return JSON.parse(value) as V
    }

    async delete(key: RedisKey): Promise<void> {
        await this.cache.delete(key)
    }
}
