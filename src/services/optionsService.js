const BASE = '/yf';

export class OptionsService {
  // Fetch available expiration dates for a ticker
  static async getExpirations(ticker) {
    try {
      const res = await fetch(`${BASE}/v7/finance/options/${ticker}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const result = data?.optionChain?.result?.[0];
      return {
        expirations: result?.expirationDates || [],
        underlyingPrice: result?.quote?.regularMarketPrice || 0,
        underlyingChange: result?.quote?.regularMarketChangePercent || 0,
        underlyingName: result?.quote?.shortName || ticker,
      };
    } catch (e) {
      console.warn('[Options] Failed to fetch expirations:', e.message);
      return { expirations: [], underlyingPrice: 0, underlyingChange: 0, underlyingName: ticker };
    }
  }

  // Fetch options chain for a specific expiration
  static async getChain(ticker, expirationTimestamp) {
    try {
      const url = expirationTimestamp
        ? `${BASE}/v7/finance/options/${ticker}?date=${expirationTimestamp}`
        : `${BASE}/v7/finance/options/${ticker}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const result = data?.optionChain?.result?.[0];
      return {
        calls: (result?.options?.[0]?.calls || []).map(c => OptionsService.normalizeContract(c, 'call')),
        puts: (result?.options?.[0]?.puts || []).map(p => OptionsService.normalizeContract(p, 'put')),
        underlyingPrice: result?.quote?.regularMarketPrice || 0,
        underlyingChange: result?.quote?.regularMarketChangePercent || 0,
        expirations: result?.expirationDates || [],
      };
    } catch (e) {
      console.warn('[Options] Failed to fetch chain:', e.message);
      return { calls: [], puts: [], underlyingPrice: 0, underlyingChange: 0, expirations: [] };
    }
  }

  static normalizeContract(c, type) {
    return {
      strike: c.strike,
      type,
      contractSymbol: c.contractSymbol,
      lastPrice: c.lastPrice || 0,
      bid: c.bid || 0,
      ask: c.ask || 0,
      change: c.change || 0,
      percentChange: c.percentChange || 0,
      volume: c.volume || 0,
      openInterest: c.openInterest || 0,
      impliedVolatility: c.impliedVolatility || 0,
      inTheMoney: c.inTheMoney || false,
      expiration: c.expiration,
    };
  }
}
