import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { YahooFinanceService } from '../services/yahooFinanceService';
import {
  basketStocks,
  myBaskets,
  allInstruments,
} from '../data/mockData';

// Static fallback explorer prices (imported from App.jsx's initial values)
const INITIAL_EXPLORER_PRICES = {
  XOM: 118.50, CVX: 162.40, GLD: 212.80, "BRK.B": 412.60, COST: 748.20,
  O: 58.40, AMT: 198.60, XLU: 68.20, TLT: 92.40, PLD: 124.80,
  JNJ: 158.20, PG: 162.45, WMT: 168.90, KO: 61.20, MCD: 298.40,
  NVDA: 878.40, AMD: 168.30, AVGO: 1284.60, MSFT: 415.60, AMZN: 185.30,
  LMT: 448.60, RTX: 98.40, GD: 284.20, NOC: 468.80,
  TQQQ: 62.40, SPXL: 148.20, ARKK: 48.60, TSLA: 248.42, COIN: 182.40,
  AAPL: 228.60, GOOGL: 178.40, PEP: 172.80, MMM: 108.40,
  ENPH: 128.60, SEDG: 68.40, FSLR: 198.20, RUN: 14.80, PLUG: 3.42,
  PLTR: 82.40, PATH: 24.60, ISRG: 548.20,
  UNH: 548.60, LLY: 824.40, ABBV: 188.20, MRK: 118.60, TMO: 582.40,
};

// Ticker pattern: standard stock symbols only (1-5 uppercase letters, optional dot)
const TICKER_RE = /^[A-Z.]{1,6}$/;

function isQuotableTicker(ticker) {
  return TICKER_RE.test(ticker);
}

// Collect all unique equity/ETF/bond tickers across the app
function collectAllTickers() {
  const tickers = new Set();

  // From basket holdings (equities + bond ETFs)
  Object.values(basketStocks).flat().forEach(s => {
    if ((s.asset === 'equity' || s.asset === 'bond') && isQuotableTicker(s.ticker)) {
      tickers.add(s.ticker);
    }
  });

  // From allInstruments (equities + bonds that look like ETFs)
  allInstruments.forEach(i => {
    if ((i.type === 'equity' || i.type === 'bond') && isQuotableTicker(i.ticker)) {
      tickers.add(i.ticker);
    }
  });

  // From explorer prices
  Object.keys(INITIAL_EXPLORER_PRICES).forEach(t => {
    if (isQuotableTicker(t)) tickers.add(t);
  });

  return [...tickers].sort();
}

// Mutate the shared mockData objects in-place so the rest of the app sees live prices
function updateMockData(quotesMap) {
  // 1. Update individual holdings in basketStocks
  Object.values(basketStocks).flat().forEach(stock => {
    const q = quotesMap.get(stock.ticker);
    if (q) {
      stock.current = q.price;
      stock.change = q.changePercent;
      // Store intraday spark closes for real sparkline charts
      if (q.sparkCloses) stock._sparkCloses = q.sparkCloses.filter(c => c != null);
      if (q.high) stock._dayHigh = q.high;
      if (q.low) stock._dayLow = q.low;
      if (q.prevClose) stock._prevClose = q.prevClose;
    }
  });

  // 2. Update allInstruments
  allInstruments.forEach(inst => {
    const q = quotesMap.get(inst.ticker);
    if (q) {
      inst.price = q.price;
      inst.change = q.changePercent;
    }
  });

  // 3. Recalculate basket-level summaries
  myBaskets.forEach(basket => {
    const stocks = basketStocks[basket.id] || [];
    const totalValue = stocks.reduce((s, st) => s + st.shares * st.current, 0);
    const totalCost = stocks.reduce((s, st) => s + st.shares * st.avgCost, 0);
    basket.value = Math.round(totalValue * 100) / 100;
    basket.totalPL = Math.round((totalValue - totalCost) * 100) / 100;
    basket.dayPL = Math.round(
      stocks.reduce((s, st) => s + st.shares * st.current * (st.change / 100), 0) * 100
    ) / 100;
    basket.change = basket.value > 0
      ? Math.round((basket.dayPL / basket.value) * 10000) / 100
      : 0;
  });
}

export function useStockPrices({ enabled = true } = {}) {
  const [prices, setPrices] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | live | error | static
  const [lastUpdate, setLastUpdate] = useState(null);
  const mountedRef = useRef(true);
  const intervalRef = useRef(null);

  const allTickers = useMemo(() => collectAllTickers(), []);

  const fetchAndUpdate = useCallback(async () => {
    const quotesMap = await YahooFinanceService.fetchQuotes(allTickers);
    if (!mountedRef.current) return;

    if (quotesMap.size === 0) {
      // If we had no data before, mark as error; if we already have data, keep it
      if (Object.keys(prices).length === 0) {
        setStatus('error');
      }
      return;
    }

    // Update mockData in-place
    updateMockData(quotesMap);

    // Build prices state object
    const newPrices = {};
    for (const [ticker, q] of quotesMap) {
      newPrices[ticker] = {
        current: q.price,
        change: q.change,
        changePercent: q.changePercent,
        high: q.high,
        low: q.low,
        prevClose: q.prevClose,
        sparkCloses: q.sparkCloses,
      };
    }

    setPrices(newPrices);
    setStatus('live');
    setLastUpdate(new Date());
  }, [allTickers]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial load + polling
  useEffect(() => {
    if (!enabled) {
      setStatus('static');
      return;
    }

    mountedRef.current = true;
    setStatus('loading');

    // Initial fetch
    fetchAndUpdate();

    // Set up polling interval
    const startPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const pollMs = YahooFinanceService.isMarketOpen() ? 30000 : 300000; // 30s or 5min
      intervalRef.current = setInterval(() => {
        fetchAndUpdate();
      }, pollMs);
    };

    startPolling();

    // Re-evaluate polling interval every 5 minutes (to switch between market/after-hours)
    const intervalCheck = setInterval(startPolling, 300000);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearInterval(intervalCheck);
    };
  }, [enabled, fetchAndUpdate]);

  // Compute explorer prices from live data with static fallback
  const explorerPrices = useMemo(() => {
    const result = { ...INITIAL_EXPLORER_PRICES };
    Object.entries(prices).forEach(([ticker, data]) => {
      if (ticker in result) {
        result[ticker] = data.current;
      }
    });
    return result;
  }, [prices]);

  const isLive = status === 'live';

  return {
    prices,
    status,
    isLive,
    explorerPrices,
    lastUpdate,
    refreshAll: fetchAndUpdate,
    getPrice: (ticker) => prices[ticker]?.current ?? null,
    getChange: (ticker) => prices[ticker]?.changePercent ?? null,
  };
}
