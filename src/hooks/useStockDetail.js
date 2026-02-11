import { useState, useEffect, useRef } from 'react';
import { YahooFinanceService } from '../services/yahooFinanceService';

// Cache for stock summaries
const summaryCache = new Map();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export function useStockDetail(symbol) {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!symbol) return;

    const cached = summaryCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setSummary(cached.data);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    YahooFinanceService.fetchStockSummary(symbol).then(data => {
      if (!mountedRef.current) return;

      if (data) {
        summaryCache.set(symbol, { data, timestamp: Date.now() });
        setSummary(data);
        setError(null);
      } else {
        setError('Failed to load stock data');
      }
      setIsLoading(false);
    });

    return () => { mountedRef.current = false; };
  }, [symbol]);

  return { summary, isLoading, error };
}
