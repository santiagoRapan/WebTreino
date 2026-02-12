/**
 * In-memory rate limiter for avatar uploads
 * Tracks upload attempts per user ID
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Cleanup interval reference
let cleanupInterval: NodeJS.Timeout | null = null;

/**
 * Check if a user has exceeded their rate limit
 * @param userId - User ID to check
 * @param maxRequests - Maximum requests allowed in the window (default: 5)
 * @param windowMs - Time window in milliseconds (default: 1 hour)
 * @returns Rate limit status
 */
export function checkRateLimit(
  userId: string,
  maxRequests: number = 5,
  windowMs: number = 3600000 // 1 hour
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  // If no entry or expired, create new
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs,
    };
  }

  // If within window and under limit
  if (entry.count < maxRequests) {
    entry.count++;
    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetAt: entry.resetAt,
    };
  }

  // Rate limit exceeded
  return {
    allowed: false,
    remaining: 0,
    resetAt: entry.resetAt,
  };
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupRateLimitMap(): void {
  const now = Date.now();
  for (const [userId, entry] of rateLimitMap.entries()) {
    if (now >= entry.resetAt) {
      rateLimitMap.delete(userId);
    }
  }
}

/**
 * Start automatic cleanup of expired entries
 */
export function startRateLimitCleanup(): void {
  if (cleanupInterval) return; // Already started

  // Clean up every 5 minutes
  cleanupInterval = setInterval(cleanupRateLimitMap, 5 * 60 * 1000);
}

/**
 * Stop automatic cleanup (useful for testing)
 */
export function stopRateLimitCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

/**
 * Reset rate limit for a specific user (useful for testing)
 */
export function resetUserRateLimit(userId: string): void {
  rateLimitMap.delete(userId);
}

/**
 * Clear all rate limit entries (useful for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitMap.clear();
}

// Start cleanup on module load
startRateLimitCleanup();
