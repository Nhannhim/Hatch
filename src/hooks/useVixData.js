import { useState, useEffect, useRef, useCallback } from 'react';
import { YahooFinanceService } from '../services/yahooFinanceService';
import { useStockChart } from './useStockChart';

// Fallback mock data when Yahoo Finance is unavailable
const MOCK_VIX_HISTORY = [21.3,22.1,20.8,19.5,20.2,21.0,19.8,18.6,19.2,20.5,19.1,18.0,17.5,18.8,19.6,20.1,19.4,18.2,17.8,18.5,19.0,18.1,17.6,18.9,19.3,18.7,18.0,17.9,18.6,18.42];
const MOCK_DEFAULTS = { vix: 18.42, vixChange: -1.24 };

export function useVixData() {
  const [quote, setQuote] = useState(null);
  const mountedRef = useRef(true);

  // 30-day chart for sparkline
  const { chartData: monthChart, isLoading: monthLoading } = useStockChart('^VIX', '1mo', '1d');

  // 1-year chart for IV rank / percentile calculation
  const { chartData: yearChart } = useStockChart('^VIX', '1y', '1d');

  // Poll current VIX quote
  const fetchQuote = useCallback(async () => {
    try {
      const quotesMap = await YahooFinanceService.fetchQuotes(['^VIX']);
      if (!mountedRef.current) return;
      const vixData = quotesMap.get('^VIX');
      if (vixData) setQuote(vixData);
    } catch (err) {
      console.warn('[VIX] Quote fetch error:', err.message);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchQuote();
    const pollMs = YahooFinanceService.isMarketOpen() ? 30000 : 300000;
    const interval = setInterval(fetchQuote, pollMs);
    const intervalCheck = setInterval(() => {
      clearInterval(interval);
      const newPollMs = YahooFinanceService.isMarketOpen() ? 30000 : 300000;
      setInterval(fetchQuote, newPollMs);
    }, 300000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
      clearInterval(intervalCheck);
    };
  }, [fetchQuote]);

  // Build sparkline history from 1-month chart closes
  const vixHistory = monthChart?.closes?.filter(c => c != null);
  const hasHistory = vixHistory && vixHistory.length >= 5;

  // Compute IV Rank and IV Percentile from 1-year VIX data
  let ivRank = 35;  // fallback
  let ivPercentile = 28; // fallback
  if (yearChart?.closes) {
    const yearCloses = yearChart.closes.filter(c => c != null);
    if (yearCloses.length >= 20) {
      const currentVix = quote?.price ?? yearCloses[yearCloses.length - 1];
      const yearHigh = Math.max(...yearCloses);
      const yearLow = Math.min(...yearCloses);
      // IV Rank: where current VIX sits in its 52-week range
      ivRank = yearHigh > yearLow
        ? Math.round(((currentVix - yearLow) / (yearHigh - yearLow)) * 100)
        : 50;
      // IV Percentile: % of days in the past year VIX was below current level
      const daysBelow = yearCloses.filter(c => c < currentVix).length;
      ivPercentile = Math.round((daysBelow / yearCloses.length) * 100);
    }
  }

  // Current price + change
  const vix = quote?.price ?? MOCK_DEFAULTS.vix;
  const vixChange = quote?.change ?? MOCK_DEFAULTS.vixChange;
  const vixTrend = vixChange < -0.01 ? 'falling' : vixChange > 0.01 ? 'rising' : 'flat';

  return {
    vix: Math.round(vix * 100) / 100,
    vixChange: Math.round(vixChange * 100) / 100,
    vixTrend,
    vixHistory: hasHistory ? vixHistory : MOCK_VIX_HISTORY,
    ivRank,
    ivPercentile,
    isLoading: monthLoading || !quote,
    isLive: !!quote,
  };
}
