import { redisKey, RedisKey } from "@constants/redis.key";
import { TTL, TTLKey } from "@constants/ttl.constants";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Global, Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";

@Global()
@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  private bindKey(key: RedisKey, suffix?: string) {
    const prefix = redisKey[key];
    return suffix ? `${prefix}:${suffix}` : prefix;
  }

  async set<V>(
    key: RedisKey,
    value: V,
    ttl: number | TTLKey = "1h",
    suffix?: string,
  ) {
    const ttlInSecond = typeof ttl === "string" ? TTL[ttl] : ttl;
    return await this.cache.set(
      this.bindKey(key, suffix),
      value && JSON.stringify(value),
      ttlInSecond,
    );
  }

  async get<V>(key: RedisKey, suffix?: string): Promise<V> {
    const value = (await this.cache.get(this.bindKey(key, suffix))) as string;
    return value && (JSON.parse(value) as V as any);
  }

  async delete(key: RedisKey, suffix?: string): Promise<void> {
    await this.cache.del(this.bindKey(key, suffix));
  }
}
