import { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { apiResponse } from "@/lib/utils";

// ── Upstash Redis rate limiter (production) ──────────────
// Falls back to in-memory for local dev if env vars are not set.

const hasRedis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

function createLimiter(maxRequests: number, windowSec: number, prefix: string) {
  if (hasRedis) {
    return new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowSec} s`),
      prefix: `rl:${prefix}`,
      analytics: true,
    });
  }
  // Dev fallback: in-memory with ephemeral cache
  return new Ratelimit({
    redis: new Map() as unknown as ConstructorParameters<typeof Ratelimit>[0]["redis"],
    limiter: Ratelimit.slidingWindow(maxRequests, `${windowSec} s`),
    prefix: `rl:${prefix}`,
    ephemeralCache: new Map(),
  });
}

const limiters = {
  /** Auth endpoints — strict to prevent brute force */
  auth: createLimiter(10, 60, "auth"),
  /** File uploads */
  upload: createLimiter(20, 60, "upload"),
  /** Standard API calls */
  api: createLimiter(60, 60, "api"),
  /** Admin endpoints */
  admin: createLimiter(30, 60, "admin"),
};

export type RateLimitPreset = keyof typeof limiters;

function getClientIp(request: NextRequest): string {
  // Vercel sets x-forwarded-for automatically (cannot be spoofed behind their proxy)
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Check rate limit for a request.
 * Returns null if allowed, or a 429 Response if exceeded.
 */
export async function rateLimit(
  request: NextRequest,
  preset: RateLimitPreset = "api",
): Promise<Response | null> {
  const limiter = limiters[preset];
  const ip = getClientIp(request);
  const key = `${ip}`;

  try {
    const { success, limit, remaining, reset } = await limiter.limit(key);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      const res = apiResponse(
        { error: "Demasiadas peticiones. Inténtalo de nuevo más tarde." },
        429,
      );
      res.headers.set("Retry-After", String(retryAfter));
      res.headers.set("X-RateLimit-Limit", String(limit));
      res.headers.set("X-RateLimit-Remaining", "0");
      res.headers.set("X-RateLimit-Reset", String(reset));
      return res as unknown as Response;
    }

    return null;
  } catch (error) {
    // If rate limiting fails (Redis down etc.), allow the request through
    console.error("Rate limit error:", error);
    return null;
  }
}
