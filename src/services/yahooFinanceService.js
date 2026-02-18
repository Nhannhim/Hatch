// Yahoo Finance Service — free stock quotes and chart data
// Uses Vite dev proxy (/yf → query1.finance.yahoo.com) to bypass CORS
// Endpoints used:
//   - /v8/finance/spark  (batch prices, no auth, max 20 symbols per request)
//   - /v8/finance/chart  (OHLCV history, no auth, single symbol)

const BASE = '/yf';
const SPARK_BATCH_SIZE = 20; // Yahoo Finance limit per spark request

export class YahooFinanceService {

  // Fetch current prices for multiple symbols using spark endpoint
  // Batches into groups of 20 (Yahoo's limit), runs in parallel
  static async fetchQuotes(symbols) {
    if (!symbols || symbols.length === 0) return new Map();

    const map = new Map();
    const batches = [];

    for (let i = 0; i < symbols.length; i += SPARK_BATCH_SIZE) {
      batches.push(symbols.slice(i, i + SPARK_BATCH_SIZE));
    }

    // Fetch all batches in parallel
    const results = await Promise.all(
      batches.map(batch => this._fetchSparkBatch(batch))
    );

    for (const batchMap of results) {
      for (const [sym, data] of batchMap) {
        map.set(sym, data);
      }
    }

    if (map.size > 0) {
      console.log(`[YF] Fetched ${map.size}/${symbols.length} quotes`);
    }
    return map;
  }

  // Internal: fetch a single spark batch (max 20 symbols)
  static async _fetchSparkBatch(symbols) {
    const map = new Map();
    const joined = symbols.join(',');

    try {
      const res = await fetch(
        `${BASE}/v8/finance/spark?symbols=${joined}&range=1d&interval=5m`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      if (!res.ok) {
        console.warn('[YF] Spark batch failed:', res.status);
        return map;
      }
      const data = await res.json();

      for (const [sym, sparkData] of Object.entries(data || {})) {
        if (!sparkData?.close || sparkData.close.length === 0) continue;

        // Current price = last non-null close value
        const closes = sparkData.close;
        let currentPrice = null;
        for (let i = closes.length - 1; i >= 0; i--) {
          if (closes[i] != null) { currentPrice = closes[i]; break; }
        }
        if (currentPrice == null) continue;

        const prevClose = sparkData.previousClose || sparkData.chartPreviousClose || currentPrice;
        const change = currentPrice - prevClose;
        const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

        map.set(sym, {
          price: currentPrice,
          change: Math.round(change * 100) / 100,
          changePercent: Math.round(changePercent * 100) / 100,
          prevClose,
          high: Math.max(...closes.filter(c => c != null)),
          low: Math.min(...closes.filter(c => c != null)),
          sparkCloses: closes, // for mini-chart rendering
        });
      }
    } catch (err) {
      console.warn('[YF] Spark batch error:', err.message);
    }

    return map;
  }

  // Fetch OHLCV chart data for a single symbol
  static async fetchChart(symbol, range = '1y', interval = '1d') {
    try {
      const res = await fetch(
        `${BASE}/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      if (!res.ok) {
        console.warn(`[YF] Chart fetch failed for ${symbol}:`, res.status);
        return null;
      }
      const data = await res.json();
      const result = data?.chart?.result?.[0];
      if (!result) return null;

      const timestamps = result.timestamp || [];
      const quote = result.indicators?.quote?.[0] || {};

      return {
        symbol,
        timestamps,
        closes: quote.close || [],
        opens: quote.open || [],
        highs: quote.high || [],
        lows: quote.low || [],
        volumes: quote.volume || [],
        meta: {
          currency: result.meta?.currency,
          exchangeName: result.meta?.exchangeName,
          regularMarketPrice: result.meta?.regularMarketPrice,
          previousClose: result.meta?.chartPreviousClose,
          fiftyTwoWeekHigh: result.meta?.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: result.meta?.fiftyTwoWeekLow,
        }
      };
    } catch (err) {
      console.warn(`[YF] Chart fetch error for ${symbol}:`, err.message);
      return null;
    }
  }

  // Fetch detailed quote summary for a single symbol
  // Uses the chart endpoint with extended meta + computes additional stats
  static async fetchStockSummary(symbol) {
    try {
      // Fetch 1Y daily chart for comprehensive stats
      const [chartRes, sparkRes] = await Promise.all([
        fetch(
          `${BASE}/v8/finance/chart/${encodeURIComponent(symbol)}?range=1y&interval=1d&includePrePost=false`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        ),
        fetch(
          `${BASE}/v8/finance/spark?symbols=${encodeURIComponent(symbol)}&range=1d&interval=5m`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        ),
      ]);

      let summary = { symbol };

      // Parse chart data for historical stats
      if (chartRes.ok) {
        const chartJson = await chartRes.json();
        const result = chartJson?.chart?.result?.[0];
        if (result) {
          const meta = result.meta || {};
          const quote = result.indicators?.quote?.[0] || {};
          const closes = (quote.close || []).filter(c => c != null);
          const volumes = (quote.volume || []).filter(v => v != null);
          const highs = (quote.high || []).filter(h => h != null);
          const lows = (quote.low || []).filter(l => l != null);

          const currentPrice = meta.regularMarketPrice || closes[closes.length - 1] || 0;
          const prevClose = meta.chartPreviousClose || meta.previousClose || currentPrice;

          // Compute stats from 1Y history
          const avgVolume = volumes.length > 0 ? Math.round(volumes.reduce((a, b) => a + b, 0) / volumes.length) : 0;
          const latestVolume = volumes.length > 0 ? volumes[volumes.length - 1] : 0;

          // 52-week stats
          const high52w = meta.fiftyTwoWeekHigh || (highs.length > 0 ? Math.max(...highs) : 0);
          const low52w = meta.fiftyTwoWeekLow || (lows.length > 0 ? Math.min(...lows) : 0);

          // Calculate returns over different periods
          const returns = {};
          if (closes.length >= 5) returns['1W'] = ((currentPrice / closes[Math.max(0, closes.length - 5)] - 1) * 100);
          if (closes.length >= 21) returns['1M'] = ((currentPrice / closes[Math.max(0, closes.length - 21)] - 1) * 100);
          if (closes.length >= 63) returns['3M'] = ((currentPrice / closes[Math.max(0, closes.length - 63)] - 1) * 100);
          if (closes.length >= 126) returns['6M'] = ((currentPrice / closes[Math.max(0, closes.length - 126)] - 1) * 100);
          if (closes.length >= 252) returns['1Y'] = ((currentPrice / closes[0] - 1) * 100);
          returns['YTD'] = closes.length > 0 ? ((currentPrice / closes[0] - 1) * 100) : 0;

          // Volatility (annualized, based on daily returns)
          const dailyReturns = [];
          for (let i = 1; i < closes.length; i++) {
            dailyReturns.push(Math.log(closes[i] / closes[i - 1]));
          }
          const avgReturn = dailyReturns.length > 0 ? dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length : 0;
          const variance = dailyReturns.length > 1 ? dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (dailyReturns.length - 1) : 0;
          const dailyVol = Math.sqrt(variance);
          const annualizedVol = dailyVol * Math.sqrt(252) * 100;

          // Simple moving averages
          const sma50 = closes.length >= 50 ? closes.slice(-50).reduce((a, b) => a + b, 0) / 50 : null;
          const sma200 = closes.length >= 200 ? closes.slice(-200).reduce((a, b) => a + b, 0) / 200 : null;

          // RSI (14-day)
          let rsi = null;
          if (dailyReturns.length >= 14) {
            const last14 = dailyReturns.slice(-14);
            const gains = last14.filter(r => r > 0);
            const losses = last14.filter(r => r < 0);
            const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / 14 : 0;
            const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((a, b) => a + b, 0)) / 14 : 0.001;
            const rs = avgGain / avgLoss;
            rsi = 100 - (100 / (1 + rs));
          }

          // Max drawdown
          let maxDD = 0;
          let peak = closes[0] || 0;
          for (const c of closes) {
            if (c > peak) peak = c;
            const dd = (c - peak) / peak;
            if (dd < maxDD) maxDD = dd;
          }

          // Day range from spark
          let dayHigh = currentPrice, dayLow = currentPrice, dayChange = 0, dayChangePercent = 0;

          summary = {
            ...summary,
            price: currentPrice,
            previousClose: prevClose,
            change: Math.round((currentPrice - prevClose) * 100) / 100,
            changePercent: Math.round(((currentPrice - prevClose) / prevClose) * 10000) / 100,
            currency: meta.currency || 'USD',
            exchange: meta.exchangeName || meta.fullExchangeName || '',
            instrumentType: meta.instrumentType || 'EQUITY',
            high52w,
            low52w,
            dayHigh,
            dayLow,
            volume: latestVolume,
            avgVolume,
            returns,
            volatility: Math.round(annualizedVol * 10) / 10,
            sma50: sma50 ? Math.round(sma50 * 100) / 100 : null,
            sma200: sma200 ? Math.round(sma200 * 100) / 100 : null,
            rsi: rsi ? Math.round(rsi * 10) / 10 : null,
            maxDrawdown: Math.round(maxDD * 1000) / 10,
          };
        }
      }

      // Parse spark data for intraday
      if (sparkRes.ok) {
        const sparkJson = await sparkRes.json();
        const sparkData = sparkJson?.[symbol];
        if (sparkData?.close) {
          const closes = sparkData.close.filter(c => c != null);
          if (closes.length > 0) {
            summary.dayHigh = Math.max(...closes);
            summary.dayLow = Math.min(...closes);
            summary.sparkCloses = sparkData.close;
          }
        }
      }

      console.log(`[YF] Summary fetched for ${symbol}`);
      return summary;
    } catch (err) {
      console.warn(`[YF] Summary fetch error for ${symbol}:`, err.message);
      return null;
    }
  }

  // Check if US stock market is currently open
  static isMarketOpen() {
    const now = new Date();
    const day = now.getDay(); // 0=Sun, 6=Sat
    if (day === 0 || day === 6) return false;

    // Convert to ET (US Eastern)
    const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const hours = et.getHours();
    const mins = et.getMinutes();
    const timeInMinutes = hours * 60 + mins;

    // Market hours: 9:30 AM - 4:00 PM ET
    return timeInMinutes >= 570 && timeInMinutes < 960;
  }
}
