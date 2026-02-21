import { useState, useEffect, useCallback, useRef } from 'react';
import { OptionsService } from '../services/optionsService';
import { MOCK_CHAINS } from '../tier2/data/optionsMockData';

export function useOptionsChain(ticker) {
  const [chain, setChain] = useState({ calls: [], puts: [] });
  const [expirations, setExpirations] = useState([]);
  const [selectedExpiration, setSelectedExpiration] = useState(null);
  const [underlyingPrice, setUnderlyingPrice] = useState(0);
  const [underlyingChange, setUnderlyingChange] = useState(0);
  const [underlyingName, setUnderlyingName] = useState(ticker);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const pollRef = useRef(null);

  // Fetch expirations when ticker changes
  useEffect(() => {
    if (!ticker) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    OptionsService.getExpirations(ticker).then(data => {
      if (cancelled) return;
      if (data.expirations.length > 0) {
        setExpirations(data.expirations);
        setUnderlyingPrice(data.underlyingPrice);
        setUnderlyingChange(data.underlyingChange);
        setUnderlyingName(data.underlyingName);
        // Auto-select nearest expiration
        setSelectedExpiration(data.expirations[0]);
        setIsLive(true);
      } else {
        // Fallback to mock data
        const mock = MOCK_CHAINS[ticker] || MOCK_CHAINS['AAPL'];
        if (mock) {
          setExpirations(mock.expirations);
          setUnderlyingPrice(mock.underlyingPrice);
          setUnderlyingChange(mock.underlyingChange);
          setUnderlyingName(mock.underlyingName || ticker);
          setSelectedExpiration(mock.expirations[0]);
        }
        setIsLive(false);
      }
      setLoading(false);
    }).catch(e => {
      if (cancelled) return;
      setError(e.message);
      // Fallback to mock
      const mock = MOCK_CHAINS[ticker] || MOCK_CHAINS['AAPL'];
      if (mock) {
        setExpirations(mock.expirations);
        setUnderlyingPrice(mock.underlyingPrice);
        setUnderlyingChange(mock.underlyingChange);
        setSelectedExpiration(mock.expirations[0]);
      }
      setIsLive(false);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [ticker]);

  // Fetch chain when expiration changes
  const fetchChain = useCallback(async () => {
    if (!ticker || !selectedExpiration) return;
    try {
      const data = await OptionsService.getChain(ticker, selectedExpiration);
      if (data.calls.length > 0 || data.puts.length > 0) {
        setChain({ calls: data.calls, puts: data.puts });
        setUnderlyingPrice(data.underlyingPrice);
        setUnderlyingChange(data.underlyingChange);
        setIsLive(true);
      } else {
        // Fallback to mock
        const mock = MOCK_CHAINS[ticker] || MOCK_CHAINS['AAPL'];
        if (mock) {
          setChain({ calls: mock.calls, puts: mock.puts });
        }
        setIsLive(false);
      }
    } catch {
      const mock = MOCK_CHAINS[ticker] || MOCK_CHAINS['AAPL'];
      if (mock) {
        setChain({ calls: mock.calls, puts: mock.puts });
      }
      setIsLive(false);
    }
  }, [ticker, selectedExpiration]);

  useEffect(() => {
    fetchChain();
  }, [fetchChain]);

  // Poll every 30s during market hours
  useEffect(() => {
    if (!ticker || !selectedExpiration) return;
    const now = new Date();
    const hour = now.getUTCHours();
    const isMarketOpen = now.getDay() >= 1 && now.getDay() <= 5 && hour >= 14 && hour < 21;
    const interval = isMarketOpen ? 30000 : 120000;

    pollRef.current = setInterval(fetchChain, interval);
    return () => clearInterval(pollRef.current);
  }, [ticker, selectedExpiration, fetchChain]);

  return {
    chain,
    expirations,
    selectedExpiration,
    setSelectedExpiration,
    underlyingPrice,
    underlyingChange,
    underlyingName,
    loading,
    error,
    isLive,
  };
}
