// In-memory cache implementation with TTL and cleanup
// In production, this should be replaced with Redis

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default
    this.cleanupInterval = 60 * 1000; // Cleanup every minute
    this.maxSize = 1000; // Maximum cache entries
    
    // Start periodic cleanup
    this.startCleanup();
  }

  // Set cache value with TTL
  set(key, value, ttl = this.defaultTTL) {
    // Check cache size limit
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    const expiresAt = Date.now() + ttl;
    
    this.cache.set(key, {
      value,
      createdAt: Date.now(),
      expiresAt,
      hits: 0
    });
    
    this.ttls.set(key, expiresAt);
    
    console.log(`💾 Cache SET: ${key} (TTL: ${ttl}ms)`);
  }

  // Get cache value
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      console.log(`💾 Cache MISS: ${key}`);
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      console.log(`💾 Cache EXPIRED: ${key}`);
      return null;
    }

    // Update hit count
    item.hits++;
    
    console.log(`💾 Cache HIT: ${key} (hits: ${item.hits})`);
    return item.value;
  }

  // Delete cache entry
  delete(key) {
    this.cache.delete(key);
    this.ttls.delete(key);
    console.log(`💾 Cache DELETE: ${key}`);
  }

  // Clear all cache
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.ttls.clear();
    console.log(`💾 Cache CLEAR: Removed ${size} entries`);
  }

  // Check if key exists and is not expired
  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    let totalHits = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        expiredCount++;
      } else {
        totalHits += item.hits;
      }
    }

    return {
      totalEntries: this.cache.size,
      expiredEntries: expiredCount,
      activeEntries: this.cache.size - expiredCount,
      totalHits,
      maxSize: this.maxSize,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  // Estimate memory usage
  estimateMemoryUsage() {
    let size = 0;
    for (const [key, item] of this.cache.entries()) {
      size += key.length * 2; // Approximate UTF-16 encoding
      size += JSON.stringify(item.value).length * 2;
      size += 64; // Overhead for metadata
    }
    return size;
  }

  // Evict oldest entry when cache is full
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.createdAt < oldestTime) {
        oldestTime = item.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
      console.log(`💾 Cache EVICTED: ${oldestKey} (oldest entry)`);
    }
  }

  // Cleanup expired entries
  cleanup() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, expiresAt] of this.ttls.entries()) {
      if (now > expiresAt) {
        this.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cache cleanup: Removed ${cleanedCount} expired entries`);
    }

    return cleanedCount;
  }

  // Start periodic cleanup
  startCleanup() {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  // Generate cache key for function calls
  static generateKey(functionName, args = []) {
    const argsString = JSON.stringify(args).substring(0, 200); // Limit key length
    return `${functionName}:${argsString}`;
  }
}

// Global cache instance
const globalCache = new CacheManager();

// Caching decorator function
export function withCache(ttl = 5 * 60 * 1000) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      const cacheKey = CacheManager.generateKey(`${target.constructor.name}.${propertyKey}`, args);
      
      // Try to get from cache first
      const cached = globalCache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute original function
      const result = await originalMethod.apply(this, args);
      
      // Cache the result
      globalCache.set(cacheKey, result, ttl);
      
      return result;
    };

    return descriptor;
  };
}

// Caching wrapper for async functions
export function cacheAsyncFunction(fn, ttl = 5 * 60 * 1000) {
  return async function(...args) {
    const cacheKey = CacheManager.generateKey(fn.name, args);
    
    // Try to get from cache first
    const cached = globalCache.get(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Execute original function
    const result = await fn(...args);
    
    // Cache the result
    globalCache.set(cacheKey, result, ttl);
    
    return result;
  };
}

// Cache specific data types
export const Cache = {
  // Cache lead statistics (5 minutes)
  setLeadStats: (stats) => globalCache.set('lead-stats', stats, 5 * 60 * 1000),
  getLeadStats: () => globalCache.get('lead-stats'),
  
  // Cache user data (10 minutes)
  setUser: (userId, userData) => globalCache.set(`user:${userId}`, userData, 10 * 60 * 1000),
  getUser: (userId) => globalCache.get(`user:${userId}`),
  
  // Cache referral validation (1 hour)
  setReferralCode: (code, isValid) => globalCache.set(`referral:${code}`, isValid, 60 * 60 * 1000),
  getReferralCode: (code) => globalCache.get(`referral:${code}`),
  
  // Cache application counts (15 minutes)
  setApplicationCount: (filter, count) => globalCache.set(`app-count:${JSON.stringify(filter)}`, count, 15 * 60 * 1000),
  getApplicationCount: (filter) => globalCache.get(`app-count:${JSON.stringify(filter)}`),

  // General cache methods
  set: (key, value, ttl) => globalCache.set(key, value, ttl),
  get: (key) => globalCache.get(key),
  delete: (key) => globalCache.delete(key),
  clear: () => globalCache.clear(),
  has: (key) => globalCache.has(key),
  getStats: () => globalCache.getStats()
};

export default Cache;