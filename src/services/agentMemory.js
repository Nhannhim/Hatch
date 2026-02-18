// Agent Memory Service
// Simple in-memory cache with TTL (time-to-live) for agent results

export class AgentMemory {
  static cache = new Map();
  static maxSize = 50; // Maximum number of cached entries

  /**
   * Get cached data if it exists and is still fresh
   * @param {string} key - Cache key
   * @param {number} maxAgeMs - Maximum age in milliseconds (default: 30 minutes)
   * @returns {*|null} - Cached data or null if expired/not found
   */
  static getCached(key, maxAgeMs = 30 * 60 * 1000) {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const age = Date.now() - entry.timestamp;

    // Check if entry has expired
    if (age > maxAgeMs) {
      this.cache.delete(key);
      return null;
    }

    // Cache hit!
    console.log(`[AgentMemory] Cache HIT for "${key}" (age: ${Math.round(age / 1000)}s)`);
    return entry.data;
  }

  /**
   * Store data in cache with current timestamp
   * @param {string} key - Cache key
   * @param {*} data - Data to cache
   */
  static set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Evict oldest entry if cache is over maxSize
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      console.log(`[AgentMemory] Evicted oldest entry: "${firstKey}"`);
    }

    console.log(`[AgentMemory] Cached "${key}" (cache size: ${this.cache.size}/${this.maxSize})`);
  }

  /**
   * Clear all cached data
   */
  static clear() {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`[AgentMemory] Cleared ${size} cached entries`);
  }

  /**
   * Remove specific key from cache
   * @param {string} key - Cache key to remove
   */
  static invalidate(key) {
    const existed = this.cache.has(key);
    this.cache.delete(key);

    if (existed) {
      console.log(`[AgentMemory] Invalidated "${key}"`);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache stats
   */
  static getStats() {
    const entries = Array.from(this.cache.entries());
    const now = Date.now();

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilizationPercent: Math.round((this.cache.size / this.maxSize) * 100),
      entries: entries.map(([key, entry]) => ({
        key,
        ageSeconds: Math.round((now - entry.timestamp) / 1000)
      }))
    };
  }

  /**
   * Check if key exists in cache (regardless of age)
   * @param {string} key - Cache key
   * @returns {boolean} - True if key exists
   */
  static has(key) {
    return this.cache.has(key);
  }

  /**
   * Get cache key for agent results
   * Creates a consistent key based on agent name and input hash
   * @param {string} agentName - Name of the agent
   * @param {Object} input - Input data for hashing
   * @returns {string} - Cache key
   */
  static generateKey(agentName, input) {
    // Simple hash function for input data
    const inputStr = JSON.stringify(input);
    const hash = this.simpleHash(inputStr);
    return `${agentName}_${hash}`;
  }

  /**
   * Simple hash function for creating cache keys
   * @param {string} str - String to hash
   * @returns {string} - Hash string
   */
  static simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}
