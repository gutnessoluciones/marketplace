import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/utils";

// In-memory rate limiter (reset on server restart — for production use Redis/Upstash)
const store = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries periodically
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, val] of store) {
    if (val.resetAt < now) store.delete(key);
  }
}

interface RateLimitConfig {
  /** Max requests in the window */
  limit: number;
  /** Window in seconds */
  windowSec: number;
}

const PRESETS: Record<string, RateLimitConfig> = {
  /** Auth endpoints — strict to prevent brute force */
  auth: { limit: 10, windowSec: 60 },
  /** File uploads */
  upload: { limit: 20, windowSec: 60 },
  /** Standard API calls */
  api: { limit: 60, windowSec: 60 },
  /** Admin endpoints */
  admin: { limit: 30, windowSec: 60 },
};

/**
 * Check rate limit for a request.
 * Returns null if allowed, or a 429 Response if exceeded.
 */
export function rateLimit(
  request: NextRequest,
  preset: keyof typeof PRESETS = "api",
): Response | null {
  cleanup();

  const config = PRESETS[preset];
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const key = `${preset}:${ip}`;
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + config.windowSec * 1000 });
    return null;
  }

  entry.count++;

  if (entry.count > config.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return apiResponse(
      { error: "Demasiadas peticiones. Inténtalo de nuevo más tarde." },
      429,
    ) as unknown as Response;
  }

  return null;
}
