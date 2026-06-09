type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

const redisRestUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.REDIS_REST_URL;
const redisRestToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.REDIS_REST_TOKEN;
const redisEnabled = Boolean(redisRestUrl && redisRestToken);

function cacheKey(key: string) {
  return `lidet-portfolio:${key}`;
}

async function redisCommand<T>(command: unknown[]): Promise<T | null> {
  if (!redisEnabled) return null;

  try {
    const response = await fetch(`${redisRestUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisRestToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([command]),
    });

    if (!response.ok) {
      throw new Error(`Redis command failed: ${response.status}`);
    }

    const results = await response.json();
    return results?.[0]?.result ?? null;
  } catch (error) {
    console.warn("[Cache] Redis unavailable, using memory fallback:", error);
    return null;
  }
}

async function getFromRedis<T>(key: string): Promise<T | null> {
  const result = await redisCommand<string>(["GET", cacheKey(key)]);
  if (!result) return null;

  try {
    return JSON.parse(result) as T;
  } catch {
    return null;
  }
}

async function setInRedis<T>(key: string, value: T, ttlSeconds: number) {
  await redisCommand(["SET", cacheKey(key), JSON.stringify(value), "EX", ttlSeconds]);
}

function getFromMemory<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    memoryCache.delete(key);
    return null;
  }

  return entry.value as T;
}

function setInMemory<T>(key: string, value: T, ttlSeconds: number) {
  memoryCache.set(key, {
    expiresAt: Date.now() + ttlSeconds * 1000,
    value,
  });
}

export async function cached<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
  const memoryValue = getFromMemory<T>(key);
  if (memoryValue !== null) return memoryValue;

  const redisValue = await getFromRedis<T>(key);
  if (redisValue !== null) {
    setInMemory(key, redisValue, Math.min(ttlSeconds, 60));
    return redisValue;
  }

  const value = await loader();
  setInMemory(key, value, ttlSeconds);
  await setInRedis(key, value, ttlSeconds);
  return value;
}

export async function invalidateCache(keys: string[]) {
  for (const key of keys) {
    memoryCache.delete(key);
    await redisCommand(["DEL", cacheKey(key)]);
  }
}
