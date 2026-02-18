import { useState, useEffect, useRef, useCallback } from 'react';
import { FinnhubNewsService } from '../services/finnhubNewsService';
import { YahooFinanceService } from '../services/yahooFinanceService';
import { terminalFeed as mockTerminalFeed } from '../data/mockData';

// Module-level cache (persists across remounts within session)
const newsCache = {
  items: [],
  maxFinnhubId: null,
  lastFetchTime: 0,
};

const POLL_MARKET_MS = 60_000;   // 60s during market hours
const POLL_AFTER_MS = 300_000;   // 5min after hours
const MAX_ITEMS = 50;

export function useNewsStream({ enabled = true } = {}) {
  const [news, setNews] = useState(mockTerminalFeed);
  const [status, setStatus] = useState('idle');
  const [lastUpdate, setLastUpdate] = useState(null);
  const mountedRef = useRef(true);
  const intervalRef = useRef(null);

  const fetchAndUpdate = useCallback(async () => {
    try {
      const rawItems = await FinnhubNewsService.fetchMarketNews(newsCache.maxFinnhubId);
      if (!mountedRef.current) return;

      if (rawItems.length === 0 && newsCache.items.length === 0) {
        setNews(mockTerminalFeed);
        setStatus('mock');
        return;
      }

      if (rawItems.length > 0) {
        const mapped = FinnhubNewsService.mapAllToTerminalFeed(rawItems);

        const maxId = Math.max(...rawItems.map(r => r.id));
        if (!newsCache.maxFinnhubId || maxId > newsCache.maxFinnhubId) {
          newsCache.maxFinnhubId = maxId;
        }

        const existingIds = new Set(newsCache.items.map(i => i.id));
        const newItems = mapped.filter(i => !existingIds.has(i.id));
        newsCache.items = [...newItems, ...newsCache.items]
          .sort((a, b) => b._datetime - a._datetime)
          .slice(0, MAX_ITEMS);
      }

      newsCache.lastFetchTime = Date.now();
      setNews([...newsCache.items]);
      setStatus('live');
      setLastUpdate(new Date());
    } catch (err) {
      console.warn('[NewsStream] Fetch error:', err.message);
      if (newsCache.items.length > 0) {
        setNews([...newsCache.items]);
        setStatus('live');
      } else {
        setNews(mockTerminalFeed);
        setStatus('error');
      }
    }
  }, []);

  // Adaptive polling — faster during market hours
  const schedulePoll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const ms = YahooFinanceService.isMarketOpen?.() ? POLL_MARKET_MS : POLL_AFTER_MS;
    intervalRef.current = setInterval(() => {
      fetchAndUpdate();
      // Re-schedule with updated market hours check every cycle
      const nextMs = YahooFinanceService.isMarketOpen?.() ? POLL_MARKET_MS : POLL_AFTER_MS;
      if (nextMs !== ms) schedulePoll();
    }, ms);
  }, [fetchAndUpdate]);

  useEffect(() => {
    if (!enabled) {
      setStatus('mock');
      return;
    }

    const hasKey = !!import.meta.env.VITE_FINNHUB_API_KEY;
    if (!hasKey) {
      console.warn('[NewsStream] No VITE_FINNHUB_API_KEY — using mock data');
      setNews(mockTerminalFeed);
      setStatus('mock');
      return;
    }

    mountedRef.current = true;
    setStatus('loading');

    // Use cached data immediately if fresh enough
    if (newsCache.items.length > 0 && Date.now() - newsCache.lastFetchTime < 30_000) {
      setNews([...newsCache.items]);
      setStatus('live');
    }

    fetchAndUpdate();
    schedulePoll();

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, fetchAndUpdate, schedulePoll]);

  return {
    news,
    status,
    isLive: status === 'live',
    lastUpdate,
    refreshNews: fetchAndUpdate,
  };
}
