import React, { useState } from 'react';
import { Icon } from '../../components/Icons';
import { T } from '../OptionsPage';

const FLOW_DATA = [
  { time: '15:58', ticker: 'AAPL', strike: 230, type: 'call', exp: 'Mar 21', side: 'buy', size: 1250, premium: 968750, spot: 228.50, sentiment: 'bullish', sweep: true, ivRank: 42 },
  { time: '15:55', ticker: 'SPY', strike: 600, type: 'put', exp: 'Mar 14', side: 'sell', size: 3400, premium: 1190000, spot: 598.30, sentiment: 'neutral', sweep: false, ivRank: 28 },
  { time: '15:52', ticker: 'TSLA', strike: 350, type: 'call', exp: 'Mar 28', side: 'buy', size: 800, premium: 640000, spot: 342.10, sentiment: 'bullish', sweep: true, ivRank: 68 },
  { time: '15:48', ticker: 'NVDA', strike: 900, type: 'call', exp: 'Apr 18', side: 'buy', size: 450, premium: 1575000, spot: 875.20, sentiment: 'bullish', sweep: false, ivRank: 55 },
  { time: '15:44', ticker: 'QQQ', strike: 510, type: 'put', exp: 'Mar 7', side: 'buy', size: 2100, premium: 462000, spot: 520.80, sentiment: 'bearish', sweep: true, ivRank: 35 },
  { time: '15:40', ticker: 'AAPL', strike: 225, type: 'call', exp: 'Mar 14', side: 'buy', size: 2000, premium: 1620000, spot: 228.50, sentiment: 'bullish', sweep: false, ivRank: 42 },
  { time: '15:36', ticker: 'META', strike: 600, type: 'put', exp: 'Mar 21', side: 'sell', size: 600, premium: 420000, spot: 612.40, sentiment: 'neutral', sweep: false, ivRank: 31 },
  { time: '15:32', ticker: 'AMZN', strike: 235, type: 'call', exp: 'Apr 18', side: 'buy', size: 1100, premium: 715000, spot: 228.90, sentiment: 'bullish', sweep: true, ivRank: 44 },
  { time: '15:28', ticker: 'SPY', strike: 590, type: 'put', exp: 'Mar 7', side: 'buy', size: 5000, premium: 650000, spot: 598.30, sentiment: 'bearish', sweep: true, ivRank: 28 },
  { time: '15:24', ticker: 'TSLA', strike: 330, type: 'put', exp: 'Mar 14', side: 'sell', size: 900, premium: 360000, spot: 342.10, sentiment: 'neutral', sweep: false, ivRank: 68 },
  { time: '15:20', ticker: 'MSFT', strike: 430, type: 'call', exp: 'Mar 21', side: 'buy', size: 1500, premium: 975000, spot: 425.60, sentiment: 'bullish', sweep: false, ivRank: 22 },
  { time: '15:16', ticker: 'GOOGL', strike: 180, type: 'call', exp: 'Apr 18', side: 'buy', size: 700, premium: 350000, spot: 176.30, sentiment: 'bullish', sweep: true, ivRank: 38 },
];

const FLOW_SUMMARY = {
  totalPremium: FLOW_DATA.reduce((s, f) => s + f.premium, 0),
  callPremium: FLOW_DATA.filter(f => f.type === 'call').reduce((s, f) => s + f.premium, 0),
  putPremium: FLOW_DATA.filter(f => f.type === 'put').reduce((s, f) => s + f.premium, 0),
  sweeps: FLOW_DATA.filter(f => f.sweep).length,
  bullish: FLOW_DATA.filter(f => f.sentiment === 'bullish').length,
  bearish: FLOW_DATA.filter(f => f.sentiment === 'bearish').length,
  neutral: FLOW_DATA.filter(f => f.sentiment === 'neutral').length,
};

const PCR = FLOW_SUMMARY.putPremium / FLOW_SUMMARY.callPremium;

export default function OptionsTradeFlow() {
  const [filter, setFilter] = useState('all');
  const [showSweepsOnly, setShowSweepsOnly] = useState(false);

  const filtered = FLOW_DATA.filter(f => {
    if (filter === 'calls' && f.type !== 'call') return false;
    if (filter === 'puts' && f.type !== 'put') return false;
    if (filter === 'bullish' && f.sentiment !== 'bullish') return false;
    if (filter === 'bearish' && f.sentiment !== 'bearish') return false;
    if (showSweepsOnly && !f.sweep) return false;
    return true;
  });

  const fmtPrem = (v) => v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : `$${(v / 1000).toFixed(0)}K`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* Flow Summary - TastyTrade dark header */}
      <div style={{
        background: T.cardAlt, borderRadius: 8, padding: "12px", border: `1px solid ${T.border}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>
              OPTIONS FLOW
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, fontFamily: "'JetBrains Mono'", color: T.text, marginTop: 2 }}>
              {fmtPrem(FLOW_SUMMARY.totalPremium)}
            </div>
            <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>Total premium today</div>
          </div>
          <div style={{ display: "flex", gap: 3 }}>
            <div style={{ padding: "3px 8px", borderRadius: 4, background: T.green + '15', border: `1px solid ${T.green}30` }}>
              <div style={{ fontSize: 7, fontWeight: 700, color: T.textMuted }}>CALLS</div>
              <div style={{ fontSize: 12, fontWeight: 900, fontFamily: "'JetBrains Mono'", color: T.green }}>{fmtPrem(FLOW_SUMMARY.callPremium)}</div>
            </div>
            <div style={{ padding: "3px 8px", borderRadius: 4, background: T.red + '15', border: `1px solid ${T.red}30` }}>
              <div style={{ fontSize: 7, fontWeight: 700, color: T.textMuted }}>PUTS</div>
              <div style={{ fontSize: 12, fontWeight: 900, fontFamily: "'JetBrains Mono'", color: T.red }}>{fmtPrem(FLOW_SUMMARY.putPremium)}</div>
            </div>
          </div>
        </div>

        {/* P/C Ratio + Sentiment */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 6, marginTop: 10 }}>
          <div style={{ background: T.cardAlt, borderRadius: 6, padding: "6px", textAlign: "center", border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: T.textMuted }}>P/C RATIO</div>
            <div style={{ fontSize: 16, fontWeight: 900, fontFamily: "'JetBrains Mono'", color: PCR > 1 ? T.red : T.green }}>{PCR.toFixed(2)}</div>
          </div>
          <div style={{ background: T.cardAlt, borderRadius: 6, padding: "6px", border: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, fontWeight: 700, color: T.textMuted, marginBottom: 3 }}>
              <span>SENTIMENT</span>
              <span>{FLOW_SUMMARY.bullish}B / {FLOW_SUMMARY.neutral}N / {FLOW_SUMMARY.bearish}Be</span>
            </div>
            <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", gap: 1 }}>
              <div style={{ flex: FLOW_SUMMARY.bullish, background: T.green, borderRadius: 3 }} />
              <div style={{ flex: FLOW_SUMMARY.neutral, background: T.gold, borderRadius: 3 }} />
              <div style={{ flex: FLOW_SUMMARY.bearish, background: T.red, borderRadius: 3 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'calls', label: 'Calls' },
          { id: 'puts', label: 'Puts' },
          { id: 'bullish', label: 'Bullish' },
          { id: 'bearish', label: 'Bearish' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: "5px 10px", borderRadius: 6,
            border: filter === f.id ? `1px solid ${T.orange}` : `1px solid ${T.border}`,
            background: filter === f.id ? T.orange + '15' : T.card,
            fontSize: 10, fontWeight: 800, cursor: "pointer",
            color: filter === f.id ? T.orange : T.textDim,
          }}>
            {f.label}
          </button>
        ))}
        <button onClick={() => setShowSweepsOnly(!showSweepsOnly)} style={{
          padding: "5px 10px", borderRadius: 6,
          border: showSweepsOnly ? `1px solid ${T.orangeBright}` : `1px solid ${T.border}`,
          background: showSweepsOnly ? T.orangeBright + '15' : T.card,
          fontSize: 10, fontWeight: 800, cursor: "pointer",
          color: showSweepsOnly ? T.orangeBright : T.textDim,
        }}>
          Sweeps
        </button>
      </div>

      {/* Flow Items - TastyTrade Activity feed style */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {filtered.map((f, i) => (
          <div key={i} style={{
            background: T.card, borderRadius: 8, padding: "10px 12px",
            border: `1px solid ${T.border}`,
            borderLeft: `3px solid ${f.sentiment === 'bullish' ? T.green : f.sentiment === 'bearish' ? T.red : T.gold}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              {/* Left: Ticker + Contract */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 900, fontFamily: "'JetBrains Mono'", color: T.text }}>{f.ticker}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 3,
                    background: f.type === 'call' ? T.green + '18' : T.red + '18',
                    color: f.type === 'call' ? T.green : T.red,
                    textTransform: 'uppercase',
                  }}>
                    {f.type}
                  </span>
                  {f.sweep && (
                    <span style={{
                      fontSize: 8, fontWeight: 900, padding: "1px 4px", borderRadius: 3,
                      background: T.orangeBright + '18', color: T.orangeBright,
                    }}>
                      SWEEP
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.textDim, marginTop: 2 }}>
                  {f.side === 'buy' ? 'Bought' : 'Sold'} {f.type === 'call' ? 'Call' : 'Put'} &middot; ${f.strike} {f.exp}
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, marginTop: 1 }}>
                  {f.time} today &middot; {f.size.toLocaleString()}x
                  <span style={{ marginLeft: 6, color: T.blue }}>IV Rank {f.ivRank}%</span>
                </div>
              </div>

              {/* Right: Premium */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 900, fontFamily: "'JetBrains Mono'",
                  color: T.text,
                }}>
                  {fmtPrem(f.premium)}
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 800, fontFamily: "'JetBrains Mono'",
                  color: f.side === 'buy' ? T.red : T.green,
                }}>
                  {f.side === 'buy' ? 'db' : 'cr'}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: 30, textAlign: "center", fontSize: 12, fontWeight: 700, color: T.textDim, background: T.card, borderRadius: 8, border: `1px solid ${T.border}` }}>
            No matching flow data
          </div>
        )}
      </div>
    </div>
  );
}
