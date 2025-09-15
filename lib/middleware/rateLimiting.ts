import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitMap = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export function createRateLimiter(config: RateLimitConfig) {
  return function rateLimiter(request: NextRequest): NextResponse | null {
    const key = getClientIdentifier(request);
    const now = Date.now();

    // Clean up expired entries
    cleanupExpiredEntries(now);

    const entry = rateLimitMap.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return null; // Allow request
    }

    if (entry.count >= config.maxRequests) {
      // Rate limit exceeded
      const resetTimeSeconds = Math.ceil((entry.resetTime - now) / 1000);

      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests',
          retryAfter: resetTimeSeconds
        },
        {
          status: 429,
          headers: {
            'Retry-After': resetTimeSeconds.toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString()
          }
        }
      );
    }

    // Increment counter
    entry.count++;
    rateLimitMap.set(key, entry);

    return null; // Allow request
  };
}

function getClientIdentifier(request: NextRequest): string {
  // Get IP address from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || request.ip || 'unknown';

  // Combine IP with user agent for better identification
  const userAgent = request.headers.get('user-agent') || '';
  return `${ip}-${userAgent.substring(0, 50)}`;
}

function cleanupExpiredEntries(now: number) {
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Predefined rate limiters
export const strictRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100
});

export const leadSubmissionRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5 // Max 5 lead submissions per minute
});

export const adminApiRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60 // Higher limit for admin operations
});

export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // Max 5 login attempts per 15 minutes
});

// Helper function to apply rate limiting to API routes
export function withRateLimit(
  rateLimiter: (request: NextRequest) => NextResponse | null,
  handler: Function
) {
  return async (request: NextRequest, ...args: any[]) => {
    const rateLimitResponse = rateLimiter(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return handler(request, ...args);
  };
}