
class HistoryService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    this.cache = new Map();
    this.maxCacheSize = 100;
  }

  async getSessionHistory(sessionId, options = {}) {
    const cacheKey = this.buildCacheKey(sessionId, options);

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const queryParams = new URLSearchParams({
        limit: options.limit || 50,
        offset: options.offset || 0,
        ...options.filters
      });

      const url = `${this.baseUrl}/sessions/${sessionId}/history?${queryParams}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`History API error ${response.status}: ${errorData.detail || response.statusText}`);
      }

      const historyData = await response.json();

      // Cache the result
      if (this.cache.size >= this.maxCacheSize) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }

      this.cache.set(cacheKey, historyData);
      return historyData;

    } catch (error) {
      console.error('Failed to load session history:', error);

      if (error.message.includes('404')) {
        throw new Error('Session not found or no messages available');
      } else if (error.message.includes('500')) {
        throw new Error('Server error loading message history');
      } else {
        throw error;
      }
    }
  }

  async getFilteredHistory(sessionId, filters) {
    return this.getSessionHistory(sessionId, {
      filters,
      limit: 200 // Larger limit for filtered results
    });
  }

  buildCacheKey(sessionId, options) {
    const keyParts = [sessionId];

    if (options.offset !== undefined) keyParts.push(`offset_${options.offset}`);
    if (options.limit) keyParts.push(`limit_${options.limit}`);

    // Add filter keys to cache key
    if (options.filters) {
      Object.keys(options.filters).sort().forEach(key => {
        keyParts.push(`${key}_${options.filters[key]}`);
      });
    }

    return keyParts.join('_');
  }

  clearCache() {
    this.cache.clear();
  }

  invalidateSessionCache(sessionId) {
    for (const [key, value] of this.cache.entries()) {
      if (key.startsWith(sessionId)) {
        this.cache.delete(key);
      }
    }
  }
}

export default HistoryService;
