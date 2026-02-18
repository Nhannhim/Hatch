import { useState, useEffect, useRef } from 'react';
import { YahooFinanceService } from '../services/yahooFinanceService';

// Simple in-memory cache for chart data
const chartCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(symbol, range, interval) {
  return `${symbol}:${range}:${interval}`;
}

export function useStockChart(symbol, range = '1y', interval = '1d') {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!symbol) return;

    const key = getCacheKey(symbol, range, interval);
    const cached = chartCache.get(key);

    // Return cached data if still fresh
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setChartData(cached.data);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    YahooFinanceService.fetchChart(symbol, range, interval).then(data => {
      if (!mountedRef.current) return;

      if (data) {
        chartCache.set(key, { data, timestamp: Date.now() });
        setChartData(data);
        setError(null);
      } else {
        setError('Failed to load chart data');
      }
      setIsLoading(false);
    });

    return () => { mountedRef.current = false; };
  }, [symbol, range, interval]);

  return { chartData, isLoading, error };
}
