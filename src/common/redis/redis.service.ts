import { RedisKey } from "@constants/redis.key";
import { TTL, TTLKey } from "@constants/ttl.constants";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";

@Injectable()
export class RedisService {
    constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) { }

    async set<V>(key: RedisKey, value: V, ttl: number | TTLKey = "1d"
    ): Promise<V> {
        const ttlInSecond = typeof ttl === "string" ? TTL[ttl] : ttl
        return await this.cacheManager.set(key, value, ttlInSecond)
    }

    async get<V>(key: RedisKey): Promise<V> {
        return await this.cacheManager.get(key) as V
    }

    async delete(key: RedisKey): Promise<void> {
        await this.cacheManager.del(key)
    }
}
