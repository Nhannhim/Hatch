// Mock options data used as fallback when Yahoo Finance API is unavailable
// Expiration timestamps are Unix epoch seconds

const now = Math.floor(Date.now() / 1000);
const DAY = 86400;
const exp1 = now + 7 * DAY;   // 1 week out
const exp2 = now + 14 * DAY;  // 2 weeks out
const exp3 = now + 30 * DAY;  // ~1 month out
const exp4 = now + 60 * DAY;  // ~2 months out

function makeContract(strike, type, price, bid, ask, vol, oi, iv, itm) {
  return {
    strike, type,
    contractSymbol: `AAPL${type === 'call' ? 'C' : 'P'}${strike}`,
    lastPrice: price, bid, ask,
    change: +(Math.random() * 2 - 1).toFixed(2),
    percentChange: +(Math.random() * 10 - 5).toFixed(1),
    volume: vol, openInterest: oi,
    impliedVolatility: iv,
    inTheMoney: itm,
    expiration: exp1,
  };
}

const aaplPrice = 228.50;
const strikes = [210, 215, 220, 222.5, 225, 227.5, 230, 232.5, 235, 240, 245, 250];

const aaplCalls = strikes.map(s => {
  const itm = s < aaplPrice;
  const dist = Math.abs(s - aaplPrice);
  const intrinsic = itm ? aaplPrice - s : 0;
  const timeVal = Math.max(0.5, 8 - dist * 0.15);
  const price = +(intrinsic + timeVal).toFixed(2);
  return makeContract(s, 'call', price, +(price - 0.15).toFixed(2), +(price + 0.15).toFixed(2),
    Math.floor(Math.random() * 5000 + 500), Math.floor(Math.random() * 20000 + 2000),
    +(0.25 + Math.random() * 0.15).toFixed(3), itm);
});

const aaplPuts = strikes.map(s => {
  const itm = s > aaplPrice;
  const dist = Math.abs(s - aaplPrice);
  const intrinsic = itm ? s - aaplPrice : 0;
  const timeVal = Math.max(0.5, 8 - dist * 0.15);
  const price = +(intrinsic + timeVal).toFixed(2);
  return makeContract(s, 'put', price, +(price - 0.12).toFixed(2), +(price + 0.12).toFixed(2),
    Math.floor(Math.random() * 3000 + 300), Math.floor(Math.random() * 15000 + 1000),
    +(0.22 + Math.random() * 0.18).toFixed(3), itm);
});

export const MOCK_CHAINS = {
  AAPL: {
    underlyingPrice: aaplPrice,
    underlyingChange: 1.24,
    underlyingName: 'Apple Inc.',
    expirations: [exp1, exp2, exp3, exp4],
    calls: aaplCalls,
    puts: aaplPuts,
  },
  SPY: {
    underlyingPrice: 598.30,
    underlyingChange: -0.42,
    underlyingName: 'SPDR S&P 500 ETF',
    expirations: [exp1, exp2, exp3, exp4],
    calls: [580, 585, 590, 595, 598, 600, 602, 605, 610, 615, 620].map(s => {
      const itm = s < 598.30;
      const price = +(Math.max(0.3, (itm ? 598.30 - s : 0) + 5 - Math.abs(s - 598.30) * 0.12)).toFixed(2);
      return makeContract(s, 'call', price, +(price - 0.10).toFixed(2), +(price + 0.10).toFixed(2),
        Math.floor(Math.random() * 10000 + 1000), Math.floor(Math.random() * 50000 + 5000),
        +(0.15 + Math.random() * 0.08).toFixed(3), itm);
    }),
    puts: [580, 585, 590, 595, 598, 600, 602, 605, 610, 615, 620].map(s => {
      const itm = s > 598.30;
      const price = +(Math.max(0.3, (itm ? s - 598.30 : 0) + 5 - Math.abs(s - 598.30) * 0.12)).toFixed(2);
      return makeContract(s, 'put', price, +(price - 0.10).toFixed(2), +(price + 0.10).toFixed(2),
        Math.floor(Math.random() * 8000 + 800), Math.floor(Math.random() * 40000 + 4000),
        +(0.14 + Math.random() * 0.10).toFixed(3), itm);
    }),
  },
};

// Mock positions for the positions page
export const MOCK_POSITIONS = [
  {
    id: 1,
    ticker: 'AAPL',
    contractSymbol: 'AAPL250321C230',
    type: 'call',
    strike: 230,
    expiration: exp3,
    quantity: 5,
    avgCost: 6.20,
    currentPrice: 7.85,
    underlyingPrice: aaplPrice,
  },
  {
    id: 2,
    ticker: 'SPY',
    contractSymbol: 'SPY250321P590',
    type: 'put',
    strike: 590,
    expiration: exp3,
    quantity: -2,
    avgCost: 4.50,
    currentPrice: 3.20,
    underlyingPrice: 598.30,
  },
  {
    id: 3,
    ticker: 'AAPL',
    contractSymbol: 'AAPL250307C225',
    type: 'call',
    strike: 225,
    expiration: exp2,
    quantity: 10,
    avgCost: 5.80,
    currentPrice: 8.10,
    underlyingPrice: aaplPrice,
  },
];

// Mock trade history for analytics page
export const MOCK_OPTIONS_TRADES = [
  { id: 1, ticker: 'AAPL', type: 'call', strike: 220, action: 'buy', quantity: 5, price: 4.50, date: '2026-02-10', total: -2250 },
  { id: 2, ticker: 'AAPL', type: 'call', strike: 220, action: 'sell', quantity: 5, price: 7.20, date: '2026-02-15', total: 3600 },
  { id: 3, ticker: 'SPY', type: 'put', strike: 600, action: 'sell', quantity: 2, price: 4.50, date: '2026-02-12', total: 900 },
  { id: 4, ticker: 'AAPL', type: 'call', strike: 230, action: 'buy', quantity: 5, price: 6.20, date: '2026-02-18', total: -3100 },
  { id: 5, ticker: 'AAPL', type: 'call', strike: 225, action: 'buy', quantity: 10, price: 5.80, date: '2026-02-14', total: -5800 },
];
