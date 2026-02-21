import { useState, useEffect, useRef, useCallback } from 'react';
import { OptionsService } from '../services/optionsService';
import { YahooFinanceService } from '../services/yahooFinanceService';

// Fallback when Yahoo Finance options endpoint is unavailable
const MOCK_SPY_VOL = { totalVol: 4820000, callVol: 2650000, putVol: 2170000, pcRatio: 0.82, avgVol: 3900000 };

export function useSpyOptionsVolume() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchVolume = useCallback(async () => {
    try {
      const chain = await OptionsService.getChain('SPY');
      if (!mountedRef.current) return;

      const callVol = chain.calls.reduce((sum, c) => sum + (c.volume || 0), 0);
      const putVol = chain.puts.reduce((sum, p) => sum + (p.volume || 0), 0);
      const totalVol = callVol + putVol;
      const pcRatio = callVol > 0 ? Math.round((putVol / callVol) * 100) / 100 : 0;

      if (totalVol > 0) {
        setData({ totalVol, callVol, putVol, pcRatio, avgVol: 3900000 });
      }
      setIsLoading(false);
    } catch (err) {
      console.warn('[SPY Vol] Fetch error:', err.message);
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchVolume();
    // Options volume changes less frequently — poll every 60s during market, 5min off-hours
    const pollMs = YahooFinanceService.isMarketOpen() ? 60000 : 300000;
    const interval = setInterval(fetchVolume, pollMs);
    const intervalCheck = setInterval(() => {
      clearInterval(interval);
      const newPollMs = YahooFinanceService.isMarketOpen() ? 60000 : 300000;
      setInterval(fetchVolume, newPollMs);
    }, 300000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
      clearInterval(intervalCheck);
    };
  }, [fetchVolume]);

  const result = data || MOCK_SPY_VOL;
  return { ...result, isLoading, isLive: !!data };
}
