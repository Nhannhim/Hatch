// Finnhub News Service — free financial news API
// Endpoint: https://finnhub.io/api/v1/news (general market news, 60 calls/min free)
// CORS-enabled — works in both Vite dev and Capacitor native (no proxy needed)

const BASE_URL = 'https://finnhub.io/api/v1';

export class FinnhubNewsService {

  static _getToken() {
    return import.meta.env.VITE_FINNHUB_API_KEY || '';
  }

  // Fetch general market news. Pass minId for incremental polling (only new items).
  static async fetchMarketNews(minId = null) {
    try {
      let url = `${BASE_URL}/news?category=general&token=${this._getToken()}`;
      if (minId) url += `&minId=${minId}`;

      const res = await fetch(url);
      if (!res.ok) {
        console.warn('[Finnhub] Market news fetch failed:', res.status);
        return [];
      }
      const data = await res.json();
      console.log(`[Finnhub] Fetched ${data.length} market news items`);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('[Finnhub] Market news error:', err.message);
      return [];
    }
  }

  // Fetch company-specific news for a ticker (last N days)
  static async fetchCompanyNews(symbol, daysBack = 3) {
    try {
      const to = new Date().toISOString().split('T')[0];
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - daysBack);
      const from = fromDate.toISOString().split('T')[0];

      const url = `${BASE_URL}/company-news?symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}&token=${this._getToken()}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[Finnhub] Company news failed for ${symbol}:`, res.status);
        return [];
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn(`[Finnhub] Company news error for ${symbol}:`, err.message);
      return [];
    }
  }

  // Map a single Finnhub news item → app's terminalFeed format
  static mapToTerminalFeed(item) {
    const dt = new Date(item.datetime * 1000);
    const hours = dt.getHours().toString().padStart(2, '0');
    const mins = dt.getMinutes().toString().padStart(2, '0');

    return {
      id: `fh-${item.id}`,
      time: `${hours}:${mins}`,
      cat: this._deriveCategory(item.category, item.headline),
      priority: this._derivePriority(item.headline),
      headline: (item.headline || '').toUpperCase(),
      source: item.source || 'Finnhub',
      impact: this._deriveImpact(item.headline, item.summary),
      assets: item.related ? item.related.split(',').map(s => s.trim()).filter(Boolean) : [],
      move: '',
      desc: item.summary || '',
      _finnhubId: item.id,
      _datetime: item.datetime,
      _url: item.url,
    };
  }

  // Batch-map array of Finnhub items, sorted newest first
  static mapAllToTerminalFeed(items) {
    return items
      .map(item => this.mapToTerminalFeed(item))
      .sort((a, b) => b._datetime - a._datetime);
  }

  // ── Derive category from Finnhub category + headline keywords ──
  static _deriveCategory(finnhubCat, headline) {
    const h = (headline || '').toUpperCase();
    const rules = [
      { keywords: ['FED', 'FOMC', 'RATE', 'TREASURY', 'YIELD', 'BOND'], cat: 'RATES' },
      { keywords: ['EARNINGS', 'REVENUE', 'EPS', 'QUARTERLY', 'BEAT', 'MISS'], cat: 'EARNINGS' },
      { keywords: ['GDP', 'CPI', 'INFLATION', 'JOBS', 'EMPLOYMENT', 'PMI', 'RETAIL SALES'], cat: 'MACRO' },
      { keywords: ['OIL', 'CRUDE', 'NATURAL GAS', 'OPEC', 'BRENT', 'ENERGY'], cat: 'ENERGY' },
      { keywords: ['GOLD', 'SILVER', 'COPPER', 'COMMODITY'], cat: 'COMMODITIES' },
      { keywords: ['CHINA', 'BEIJING', 'PBOC', 'SHANGHAI'], cat: 'CHINA' },
      { keywords: ['EUROPE', 'ECB', 'EUROZONE'], cat: 'EUROPE' },
      { keywords: ['CRYPTO', 'BITCOIN', 'BTC', 'ETHEREUM'], cat: 'CRYPTO' },
      { keywords: ['DEFENSE', 'PENTAGON', 'MILITARY', 'NATO'], cat: 'DEFENSE' },
      { keywords: ['FDA', 'DRUG', 'PHARMA', 'TRIAL', 'HEALTH'], cat: 'HEALTHCARE' },
      { keywords: ['AI ', 'ARTIFICIAL INTELLIGENCE', 'GPU', 'CHIP', 'SEMICONDUCTOR'], cat: 'TECH' },
      { keywords: ['SANCTION', 'GEOPOLITICAL', 'WAR', 'TENSION'], cat: 'GEOPOLITICAL' },
      { keywords: ['DOLLAR', 'FOREX', 'YEN', 'EURO', 'CURRENCY'], cat: 'FX' },
    ];
    for (const rule of rules) {
      if (rule.keywords.some(kw => h.includes(kw))) return rule.cat;
    }
    if (finnhubCat === 'technology') return 'TECH';
    if (finnhubCat === 'business') return 'MACRO';
    return 'MARKET';
  }

  // ── Derive priority from headline keywords ──
  static _derivePriority(headline) {
    const h = (headline || '').toUpperCase();
    if (h.includes('BREAKING') || h.includes('FLASH') || h.includes('ALERT')) return 'flash';
    if (h.includes('URGENT') || h.includes('JUST IN')) return 'urgent';
    if (h.includes('UPDATE') || h.includes('REPORT')) return 'high';
    return 'normal';
  }

  // ── Derive impact from sentiment keywords ──
  static _deriveImpact(headline, summary) {
    const text = `${headline || ''} ${summary || ''}`.toLowerCase();
    const bullish = ['surge', 'jump', 'rally', 'beat', 'record', 'upgrade', 'boost',
      'gain', 'rise', 'soar', 'high', 'strong', 'approve', 'bullish', 'outperform'];
    const bearish = ['crash', 'fall', 'drop', 'miss', 'cut', 'downgrade', 'plunge',
      'sink', 'decline', 'fear', 'concern', 'weak', 'bearish', 'recession', 'default'];
    const bullCount = bullish.filter(w => text.includes(w)).length;
    const bearCount = bearish.filter(w => text.includes(w)).length;
    if (bullCount > bearCount) return 'bullish';
    if (bearCount > bullCount) return 'bearish';
    return 'mixed';
  }
}
