import { useState, useEffect, useRef } from 'react';
import { FinnhubNewsService } from '../services/finnhubNewsService';

// Per-ticker cache with 5-min TTL (matches useStockChart pattern)
const companyNewsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

export function useCompanyNews(symbol) {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!symbol) return;
    if (!import.meta.env.VITE_FINNHUB_API_KEY) return;

    // Check cache
    const cached = companyNewsCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setNews(cached.data);
      return;
    }

    setIsLoading(true);
    FinnhubNewsService.fetchCompanyNews(symbol, 3).then(raw => {
      if (!mountedRef.current) return;
      const mapped = FinnhubNewsService.mapAllToTerminalFeed(raw).slice(0, 5);
      companyNewsCache.set(symbol, { data: mapped, timestamp: Date.now() });
      setNews(mapped);
      setIsLoading(false);
    }).catch(() => {
      if (!mountedRef.current) return;
      setIsLoading(false);
    });

    return () => { mountedRef.current = false; };
  }, [symbol]);

  return { news, isLoading };
}
