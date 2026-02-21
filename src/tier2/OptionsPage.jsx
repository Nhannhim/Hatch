import React, { useState, useMemo } from 'react';
import { Icon } from '../components/Icons';
import { useOptionsChain } from '../hooks/useOptionsChain';
import { useVixData } from '../hooks/useVixData';
import { useSpyOptionsVolume } from '../hooks/useSpyOptionsVolume';
import BlackScholesModel from './components/BlackScholesModel';
import MonteCarloModel from './components/MonteCarloModel';
import DistributionAnalysis from './components/DistributionAnalysis';
import OptionsTradeFlow from './components/OptionsTradeFlow';
import { MOCK_POSITIONS } from './data/optionsMockData';

// ── Warm Gold Theme (matches app's GOLD_THEME) ──
const T = {
  bg: '#FFFDF5', card: '#fff', cardAlt: '#FFF8EE',
  surface: '#F5F0E8', border: '#F0E6D0', borderLight: '#E8DCC8',
  text: '#333334', textDim: '#8A7040', textMuted: '#A09080',
  green: '#5B8C5A', greenDim: '#4A7A49', greenBright: '#6BA06A',
  red: '#EF5350', redDim: '#D32F2F', redBright: '#FF5252',
  blue: '#42A5F5', purple: '#AB47BC',
  orange: '#C48830', orangeBright: '#D4A03C', gold: '#C48830', accent: '#C48830',
};

const TABS = [
  { id: 'positions', label: 'Positions', icon: 'wallet' },
  { id: 'chain', label: 'Chain', icon: 'list' },
  { id: 'pricing', label: 'Pricing', icon: 'balance' },
  { id: 'simulate', label: 'Simulate', icon: 'target' },
  { id: 'analysis', label: 'Analysis', icon: 'chart-up' },
  { id: 'flow', label: 'Flow', icon: 'rocket' },
];

const RISK_FREE_RATE = 0.045;

// ── Black-Scholes Math (for inline Greeks in chain) ──
function normalCDF(x) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * ax);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return 0.5 * (1.0 + sign * y);
}

function computeGreeks(S, K, T_years, r, sigma, type = 'call') {
  if (T_years <= 0 || sigma <= 0 || S <= 0) {
    const intrinsic = type === 'call' ? Math.max(0, S - K) : Math.max(0, K - S);
    return { price: intrinsic, delta: 0, gamma: 0, theta: 0, vega: 0, pop: 0, breakeven: K };
  }
  const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T_years) / (sigma * Math.sqrt(T_years));
  const d2 = d1 - sigma * Math.sqrt(T_years);
  const nd1 = Math.exp(-0.5 * d1 * d1) / Math.sqrt(2 * Math.PI);
  const Nd1 = normalCDF(d1);
  const Nd2 = normalCDF(d2);

  let price, delta;
  if (type === 'call') {
    price = S * Nd1 - K * Math.exp(-r * T_years) * Nd2;
    delta = Nd1;
  } else {
    price = K * Math.exp(-r * T_years) * normalCDF(-d2) - S * normalCDF(-d1);
    delta = Nd1 - 1;
  }
  const gamma = nd1 / (S * sigma * Math.sqrt(T_years));
  const theta = (-(S * nd1 * sigma) / (2 * Math.sqrt(T_years)) - r * K * Math.exp(-r * T_years) * (type === 'call' ? Nd2 : normalCDF(-d2))) / 365;
  const vega = S * nd1 * Math.sqrt(T_years) / 100;

  const premium = price;
  const effectiveK = type === 'call' ? K + premium : K - premium;
  const d2eff = (Math.log(S / effectiveK) + (r - sigma * sigma / 2) * T_years) / (sigma * Math.sqrt(T_years));
  const pop = type === 'call' ? normalCDF(d2eff) : normalCDF(-d2eff);
  const breakeven = type === 'call' ? K + premium : K - premium;

  return { price, delta, gamma, theta, vega, pop, breakeven };
}

// ── Payoff Diagram SVG Component ──
function PayoffDiagram({ S, K, premium, type, breakeven, T: theme }) {
  const W = 280, H = 80;
  const lowP = K * 0.88, highP = K * 1.12;
  const range = highP - lowP;
  const toX = (p) => ((p - lowP) / range) * W;
  const maxPL = premium * 3;
  const toY = (pl) => H / 2 - (pl / maxPL) * (H / 2 - 4);

  const points = [];
  for (let i = 0; i <= 50; i++) {
    const price = lowP + (range / 50) * i;
    let pl;
    if (type === 'call') {
      pl = price > K ? (price - K - premium) : -premium;
    } else {
      pl = price < K ? (K - price - premium) : -premium;
    }
    points.push({ x: toX(price), y: toY(Math.max(-premium, Math.min(maxPL, pl))), pl });
  }

  const zeroY = toY(0);
  const profitPath = points.filter(p => p.pl >= 0);
  const lossPath = points.filter(p => p.pl < 0);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <line x1="0" y1={zeroY} x2={W} y2={zeroY} stroke={theme.border} strokeWidth="0.5" />
      {lossPath.length > 1 && (
        <path
          d={`M ${lossPath[0].x} ${zeroY} ${lossPath.map(p => `L ${p.x} ${p.y}`).join(' ')} L ${lossPath[lossPath.length - 1].x} ${zeroY} Z`}
          fill={theme.red + '18'} stroke="none"
        />
      )}
      {profitPath.length > 1 && (
        <path
          d={`M ${profitPath[0].x} ${zeroY} ${profitPath.map(p => `L ${p.x} ${p.y}`).join(' ')} L ${profitPath[profitPath.length - 1].x} ${zeroY} Z`}
          fill={theme.green + '18'} stroke="none"
        />
      )}
      <polyline
        points={points.map(p => `${p.x},${p.y}`).join(' ')}
        fill="none" stroke={theme.orange} strokeWidth="1.5"
      />
      <line x1={toX(breakeven)} y1="4" x2={toX(breakeven)} y2={H - 4} stroke={theme.gold} strokeWidth="0.8" strokeDasharray="3,2" />
      <text x={toX(breakeven)} y="10" fill={theme.gold} fontSize="7" fontWeight="700" textAnchor="middle">BEP</text>
      <circle cx={toX(S)} cy={zeroY} r="3" fill={theme.blue} />
      <text x={toX(S)} y={zeroY - 6} fill={theme.blue} fontSize="7" fontWeight="700" textAnchor="middle">{S.toFixed(0)}</text>
      <line x1={toX(K)} y1={zeroY - 2} x2={toX(K)} y2={zeroY + 2} stroke={theme.textDim} strokeWidth="1" />
      <text x="2" y={H - 2} fill={theme.textMuted} fontSize="7">${lowP.toFixed(0)}</text>
      <text x={W - 2} y={H - 2} fill={theme.textMuted} fontSize="7" textAnchor="end">${highP.toFixed(0)}</text>
      <text x="2" y={zeroY - 2} fill={theme.textMuted} fontSize="6">$0</text>
    </svg>
  );
}

// ── IVR Gauge Component (warm themed) ──
function IVRGauge({ ivr, size = 36 }) {
  const pct = Math.min(100, Math.max(0, ivr));
  const color = pct < 30 ? T.green : pct < 60 ? T.orange : T.red;
  const label = pct < 30 ? 'LOW' : pct < 60 ? 'MID' : 'HIGH';
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%", position: "relative",
        background: `conic-gradient(${color} ${pct * 3.6}deg, ${T.border} ${pct * 3.6}deg)`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: size - 6, height: size - 6, borderRadius: "50%",
          background: T.card, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 10, fontWeight: 900, fontFamily: "'JetBrains Mono'", color }}>{pct}</span>
        </div>
      </div>
      <span style={{ fontSize: 7, fontWeight: 800, color, letterSpacing: 0.5 }}>{label} VOL</span>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// ██  POSITIONS TAB - Portfolio P&L Overview
// ══════════════════════════════════════════════════════════════
function PositionsTab({ goToStock }) {
  const positions = MOCK_POSITIONS;

  // Compute P&L for each position
  const positionsWithPL = positions.map(p => {
    const pl = (p.currentPrice - p.avgCost) * p.quantity * 100;
    const plPct = ((p.currentPrice - p.avgCost) / p.avgCost) * 100 * (p.quantity < 0 ? -1 : 1);
    const marketValue = p.currentPrice * Math.abs(p.quantity) * 100;
    const dte = Math.max(0, Math.ceil((p.expiration * 1000 - Date.now()) / 86400000));
    return { ...p, pl, plPct, marketValue, dte };
  });

  const totalPL = positionsWithPL.reduce((s, p) => s + p.pl, 0);
  const totalValue = positionsWithPL.reduce((s, p) => s + p.marketValue, 0);
  const totalCost = positionsWithPL.reduce((s, p) => s + (p.avgCost * Math.abs(p.quantity) * 100), 0);
  const totalPLPct = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

  // Aggregate Greeks
  const netDelta = positionsWithPL.reduce((s, p) => {
    const iv = 0.30;
    const dte = p.dte || 30;
    const g = computeGreeks(p.underlyingPrice, p.strike, dte / 365, RISK_FREE_RATE, iv, p.type);
    return s + g.delta * p.quantity * 100;
  }, 0);
  const netTheta = positionsWithPL.reduce((s, p) => {
    const iv = 0.30;
    const dte = p.dte || 30;
    const g = computeGreeks(p.underlyingPrice, p.strike, dte / 365, RISK_FREE_RATE, iv, p.type);
    return s + g.theta * p.quantity * 100;
  }, 0);
  const netGamma = positionsWithPL.reduce((s, p) => {
    const iv = 0.30;
    const dte = p.dte || 30;
    const g = computeGreeks(p.underlyingPrice, p.strike, dte / 365, RISK_FREE_RATE, iv, p.type);
    return s + g.gamma * p.quantity * 100;
  }, 0);
  const netVega = positionsWithPL.reduce((s, p) => {
    const iv = 0.30;
    const dte = p.dte || 30;
    const g = computeGreeks(p.underlyingPrice, p.strike, dte / 365, RISK_FREE_RATE, iv, p.type);
    return s + g.vega * p.quantity * 100;
  }, 0);

  // Mock trade signals for options
  const signals = [
    { id: 1, signal: 'BUY', ticker: 'AAPL', contract: '230C Mar', reason: 'IV Rank at 42% — below mean. Earnings catalyst ahead, bullish flow detected', strength: 78, time: '2h ago' },
    { id: 2, signal: 'SELL', ticker: 'SPY', contract: '590P Mar', reason: 'Short put profitable. Roll down to 580P to capture more premium decay', strength: 65, time: '4h ago' },
    { id: 3, signal: 'HOLD', ticker: 'AAPL', contract: '225C Mar', reason: 'Position up +39.7%. Let winner run — delta still favorable at 0.68', strength: 82, time: '6h ago' },
    { id: 4, signal: 'TRIM', ticker: 'NVDA', contract: '900C Apr', reason: 'IV crushed post-earnings. Take partial profits, reduce gamma exposure', strength: 71, time: '8h ago' },
  ];

  // Live VIX data from Yahoo Finance (falls back to mock if API unavailable)
  const { vix, vixChange, vixTrend, vixHistory, ivRank, ivPercentile } = useVixData();

  // Live SPY options volume from Yahoo Finance
  const spyOptionsVol = useSpyOptionsVolume();

  const volMetrics = {
    vix, vixChange, vixTrend,
    ivRank, ivPercentile,
    realizedVol: 16.8, impliedVol: 22.4,
    volSkew: -0.12, termStructure: 'contango',
  };

  const sigCol = { BUY: '#C48830', SELL: '#EF5350', HOLD: '#FFA726', TRIM: '#FFA726' };
  const sigBg = { BUY: '#FFF8EE', SELL: '#FFEBEE', HOLD: '#FFF3E0', TRIM: '#FFF3E0' };

  const fmtS = (v) => v >= 0 ? '+$' + Math.abs(v).toLocaleString() : '-$' + Math.abs(v).toLocaleString();

  return (
    <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 10 }}>

      {/* ── Unified Portfolio Card (value + sensitivity + positions) ── */}
      <div style={{ background: "#fff", borderRadius: 18, overflow: "hidden", animation: "fadeUp .4s ease .05s both" }}>
        {/* Portfolio Value + P&L */}
        <div style={{ padding: "16px 16px 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.8 }}>Options Portfolio</div>
              <div style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Instrument Serif', serif", letterSpacing: "-1px", lineHeight: 1.1, color: T.text }}>
                ${totalValue.toLocaleString()}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 700, color: totalPL >= 0 ? T.green : T.red }}>
                  {fmtS(Math.round(totalPL))}
                </span>
                <span style={{
                  fontFamily: "JetBrains Mono", fontSize: 13, fontWeight: 700,
                  color: totalPLPct >= 0 ? T.green : T.red,
                  background: totalPLPct >= 0 ? "#EDF5ED" : "#FFEBEE",
                  padding: "1px 7px", borderRadius: 6,
                }}>
                  {totalPLPct >= 0 ? "+" : ""}{totalPLPct.toFixed(2)}%
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, marginBottom: 2 }}>{positionsWithPL.length} OPEN</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.orange }}>{positionsWithPL.filter(p => p.dte <= 7).length} expiring soon</div>
            </div>
          </div>

          {/* Sensitivity Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4, marginTop: 10 }}>
            {[
              { label: 'Direction', val: netDelta.toFixed(0), good: Math.abs(netDelta) < 200, icon: 'chart-up' },
              { label: 'Time Decay', val: '$' + netTheta.toFixed(0), good: netTheta > 0, icon: 'hourglass' },
              { label: 'Momentum', val: netGamma.toFixed(1), good: netGamma > 0, icon: 'wave' },
              { label: 'Vol Impact', val: netVega.toFixed(0), good: true, icon: 'bolt' },
            ].map((m, mi) => (
              <div key={mi} style={{ background: m.good ? "#EDF5ED" : "#FFEBEE", borderRadius: 8, padding: "5px 3px", textAlign: "center" }}>
                <div style={{ marginBottom: 1 }}><Icon name={m.icon} size={10} color={m.good ? T.green : T.red} /></div>
                <div style={{ fontSize: 8, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.3 }}>{m.label}</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 13, fontWeight: 800, color: m.good ? T.green : T.red }}>{m.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Positions List */}
        <div style={{ borderTop: "1px solid " + T.border }}>
          {positionsWithPL.map((p, i) => {
            const isLong = p.quantity > 0;
            return (
              <div key={p.id} onClick={() => goToStock && goToStock(p.ticker)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", cursor: "pointer",
                  borderBottom: i < positionsWithPL.length - 1 ? "1px solid " + T.border : "none",
                  transition: "background .15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = T.bg}
                onMouseLeave={e => e.currentTarget.style.background = ""}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 800, color: T.text }}>{p.ticker}</span>
                    <span style={{
                      fontSize: 8, fontWeight: 900, padding: "1px 4px", borderRadius: 3,
                      background: p.type === 'call' ? T.green + '14' : T.red + '14',
                      color: p.type === 'call' ? T.green : T.red, textTransform: "uppercase",
                    }}>{p.type}</span>
                    <span style={{
                      fontSize: 8, fontWeight: 800, padding: "1px 4px", borderRadius: 3,
                      background: isLong ? '#EDF5ED' : '#FFEBEE', color: isLong ? T.green : T.red,
                    }}>{isLong ? 'LONG' : 'SHORT'}</span>
                  </div>
                  <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginTop: 2 }}>
                    ${p.strike} &middot; {Math.abs(p.quantity)}x &middot; Exp {new Date(p.expiration * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} <span style={{ color: p.dte <= 7 ? T.red : T.textMuted, fontWeight: p.dte <= 7 ? 800 : 600 }}>({p.dte}d)</span>
                  </div>
                  <div style={{ fontSize: 10, color: T.textDim, fontWeight: 600, marginTop: 1 }}>
                    Avg ${p.avgCost.toFixed(2)} &rarr; ${p.currentPrice.toFixed(2)}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 16, fontWeight: 800, color: p.pl >= 0 ? T.green : T.red }}>
                    {p.pl >= 0 ? '+' : ''}{p.pl >= 1000 || p.pl <= -1000 ? '$' + (p.pl / 1000).toFixed(1) + 'k' : '$' + Math.round(p.pl)}
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 800, fontFamily: "JetBrains Mono",
                    color: p.plPct >= 0 ? T.green : T.red,
                    background: p.plPct >= 0 ? '#EDF5ED' : '#FFEBEE',
                    padding: "1px 5px", borderRadius: 4, display: "inline-block", marginTop: 2,
                  }}>
                    {p.plPct >= 0 ? '+' : ''}{p.plPct.toFixed(1)}%
                  </div>
                </div>
                <span style={{ fontSize: 13, color: T.borderLight }}>&#8250;</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Market Volatility (with VIX chart + SPY volume) ── */}
      <div style={{ animation: "fadeUp .4s ease .15s both" }}>
        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 8 }}>Market Volatility</div>
        <div style={{ background: "#fff", borderRadius: 14, padding: 12, border: "1px solid " + T.border }}>

          {/* VIX with sparkline chart */}
          <div style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid " + T.border }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: .8 }}>CBOE VIX (Fear Index)</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 26, fontWeight: 900, color: T.text }}>{volMetrics.vix}</span>
                  <span style={{
                    fontFamily: "JetBrains Mono", fontSize: 13, fontWeight: 800,
                    color: volMetrics.vixChange <= 0 ? T.green : T.red,
                    background: volMetrics.vixChange <= 0 ? '#EDF5ED' : '#FFEBEE',
                    padding: "2px 5px", borderRadius: 5,
                  }}>
                    {volMetrics.vixChange >= 0 ? '+' : ''}{volMetrics.vixChange.toFixed(2)}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: volMetrics.vixTrend === 'falling' ? T.green : T.red, textTransform: "uppercase" }}>{volMetrics.vixTrend}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <div style={{ background: T.cardAlt, borderRadius: 6, padding: "3px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: T.textMuted }}>RANK</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 900, color: volMetrics.ivRank < 30 ? T.green : volMetrics.ivRank < 60 ? T.orange : T.red }}>{volMetrics.ivRank}%</div>
                </div>
                <div style={{ background: T.cardAlt, borderRadius: 6, padding: "3px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: T.textMuted }}>%ILE</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 900, color: volMetrics.ivPercentile < 30 ? T.green : volMetrics.ivPercentile < 60 ? T.orange : T.red }}>{volMetrics.ivPercentile}%</div>
                </div>
              </div>
            </div>
            {/* VIX Sparkline Chart */}
            {(() => {
              const W = 320, H = 48, pad = 2;
              const min = Math.min(...vixHistory) - 0.5;
              const max = Math.max(...vixHistory) + 0.5;
              const range = max - min;
              const pts = vixHistory.map((v, i) => ({
                x: pad + (i / (vixHistory.length - 1)) * (W - pad * 2),
                y: pad + (1 - (v - min) / range) * (H - pad * 2),
              }));
              const line = pts.map(p => `${p.x},${p.y}`).join(' ');
              const lastPt = pts[pts.length - 1];
              const areaPath = `M ${pts[0].x},${H} ${pts.map(p => `L ${p.x},${p.y}`).join(' ')} L ${lastPt.x},${H} Z`;
              const trendColor = volMetrics.vixChange <= 0 ? T.green : T.red;
              return (
                <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", marginTop: 2 }}>
                  <path d={areaPath} fill={trendColor + '10'} />
                  <polyline points={line} fill="none" stroke={trendColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx={lastPt.x} cy={lastPt.y} r="3" fill={trendColor} />
                  <text x={pad + 2} y={H - 3} fill={T.textMuted} fontSize="7" fontWeight="600">30d</text>
                  <text x={W - pad - 2} y={H - 3} fill={T.textMuted} fontSize="7" fontWeight="600" textAnchor="end">now</text>
                </svg>
              );
            })()}
          </div>

          {/* SPY Options Volume */}
          <div style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid " + T.border }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: T.text }}>
                <span style={{ fontFamily: "JetBrains Mono" }}>SPY</span> Options Volume
              </div>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 13, fontWeight: 900, color: T.text }}>
                {(spyOptionsVol.totalVol / 1e6).toFixed(1)}M
              </span>
            </div>
            <div style={{ display: "flex", gap: 3, marginBottom: 5 }}>
              <div style={{ flex: spyOptionsVol.callVol, height: 6, background: T.green, borderRadius: "3px 0 0 3px" }} />
              <div style={{ flex: spyOptionsVol.putVol, height: 6, background: T.red, borderRadius: "0 3px 3px 0" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
              <span style={{ color: T.green, fontWeight: 700 }}>Calls {(spyOptionsVol.callVol / 1e6).toFixed(1)}M ({((spyOptionsVol.callVol / spyOptionsVol.totalVol) * 100).toFixed(0)}%)</span>
              <span style={{ fontFamily: "JetBrains Mono", fontWeight: 800, color: T.textDim }}>P/C {spyOptionsVol.pcRatio.toFixed(2)}</span>
              <span style={{ color: T.red, fontWeight: 700 }}>Puts {(spyOptionsVol.putVol / 1e6).toFixed(1)}M ({((spyOptionsVol.putVol / spyOptionsVol.totalVol) * 100).toFixed(0)}%)</span>
            </div>
            <div style={{ fontSize: 10, color: T.textMuted, marginTop: 3 }}>
              vs 20d avg: <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, color: spyOptionsVol.totalVol > spyOptionsVol.avgVol ? T.orange : T.green }}>
                {spyOptionsVol.totalVol > spyOptionsVol.avgVol ? '+' : ''}{(((spyOptionsVol.totalVol - spyOptionsVol.avgVol) / spyOptionsVol.avgVol) * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Vol Metrics Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
            {[
              { label: 'Actual Swing', val: volMetrics.realizedVol + '%', good: true, icon: 'chart-bar' },
              { label: 'Expected Swing', val: volMetrics.impliedVol + '%', good: volMetrics.impliedVol < 30, icon: 'wave' },
              { label: 'Price Premium', val: (volMetrics.impliedVol - volMetrics.realizedVol).toFixed(1) + '%', good: (volMetrics.impliedVol - volMetrics.realizedVol) > 0, icon: 'ruler' },
              { label: 'Put/Call Skew', val: volMetrics.volSkew.toFixed(2), good: Math.abs(volMetrics.volSkew) < 0.2, icon: 'balance' },
              { label: 'Time Curve', val: volMetrics.termStructure, good: volMetrics.termStructure === 'contango', icon: 'hourglass' },
              { label: 'Vol Level', val: volMetrics.vix < 15 ? 'Low' : volMetrics.vix < 25 ? 'Normal' : 'High', good: volMetrics.vix < 25, icon: 'target' },
            ].map((m, mi) => (
              <div key={mi} style={{ background: m.good ? "#EDF5ED" : "#FFEBEE", borderRadius: 8, padding: "5px 4px", textAlign: "center" }}>
                <div style={{ marginBottom: 1 }}><Icon name={m.icon} size={10} color={m.good ? T.green : T.red} /></div>
                <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>{m.label}</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 800, color: m.good ? T.green : T.red }}>{m.val}</div>
              </div>
            ))}
          </div>

          {/* Expectation Match */}
          <div style={{
            marginTop: 8, padding: "7px 10px", borderRadius: 10,
            background: volMetrics.impliedVol > volMetrics.realizedVol ? '#FFF8EE' : '#FFEBEE',
            border: `1.5px solid ${volMetrics.impliedVol > volMetrics.realizedVol ? T.orange + '33' : T.red + '33'}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name={volMetrics.impliedVol > volMetrics.realizedVol ? "sparkle" : "warning"} size={11} color={volMetrics.impliedVol > volMetrics.realizedVol ? T.orange : T.red} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: volMetrics.impliedVol > volMetrics.realizedVol ? T.orange : T.red }}>
                  {volMetrics.impliedVol > volMetrics.realizedVol ? 'Options Look Expensive' : 'Options Look Cheap'}
                </div>
                <div style={{ fontSize: 10, color: T.textDim, lineHeight: 1.3, marginTop: 1 }}>
                  {volMetrics.impliedVol > volMetrics.realizedVol
                    ? `Expected swing (${volMetrics.impliedVol}%) is higher than actual (${volMetrics.realizedVol}%) by ${(volMetrics.impliedVol - volMetrics.realizedVol).toFixed(1)}pts — selling options has an edge`
                    : `Actual swing (${volMetrics.realizedVol}%) is higher than expected (${volMetrics.impliedVol}%) — buying options may be favorable`
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Trade Signals ── */}
      <div style={{ animation: "fadeUp .4s ease .25s both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif" }}>Trade Signals</span>
            <span style={{ fontSize: 12, fontWeight: 800, background: T.cardAlt, color: T.orange, padding: "2px 8px", borderRadius: 10 }}>
              {signals.filter(s => s.signal === 'BUY').length} actionable
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {signals.map(s => (
            <div key={s.id} onClick={() => goToStock && goToStock(s.ticker)} style={{
              flex: "1 1 calc(50% - 4px)", minWidth: 0, background: "#fff",
              border: "1px solid " + T.border, borderRadius: 12, padding: "8px 10px", cursor: "pointer",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <span style={{ fontSize: 12, fontWeight: 900, padding: "1px 5px", borderRadius: 4, background: sigBg[s.signal], color: sigCol[s.signal] }}>{s.signal}</span>
                <span style={{ fontSize: 11, color: T.textMuted }}>{s.time}</span>
              </div>
              <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 800, color: T.text }}>{s.ticker}</span>
                <span style={{ fontSize: 11, color: T.textDim, fontWeight: 600 }}>{s.contract}</span>
              </div>
              <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.3, marginTop: 2 }}>{s.reason.slice(0, 60)}...</div>
              <div style={{ marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ height: 3, flex: 1, background: T.border, borderRadius: 2, marginRight: 6 }}>
                  <div style={{ height: "100%", width: s.strength + "%", background: sigCol[s.signal], borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", fontWeight: 700, color: sigCol[s.signal] }}>{s.strength}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// ██  CHAIN TAB - The Core Options Chain Experience
// ══════════════════════════════════════════════════════════════
function ChainTab({ goToStock }) {
  const [ticker, setTicker] = useState('AAPL');
  const [searchInput, setSearchInput] = useState('AAPL');
  const [viewMode, setViewMode] = useState('straddle');
  const [colMode, setColMode] = useState('price');
  const [strikeFilter, setStrikeFilter] = useState('near');
  const [expandedStrike, setExpandedStrike] = useState(null);
  const [detailType, setDetailType] = useState('call');

  const {
    chain, expirations, selectedExpiration, setSelectedExpiration,
    underlyingPrice, underlyingChange, underlyingName, loading, isLive,
  } = useOptionsChain(ticker);

  const handleSearch = () => {
    const t = searchInput.trim().toUpperCase();
    if (t && /^[A-Z.]{1,6}$/.test(t)) { setTicker(t); setExpandedStrike(null); }
  };

  const allStrikes = useMemo(() =>
    [...new Set([...chain.calls.map(c => c.strike), ...chain.puts.map(p => p.strike)])].sort((a, b) => a - b),
    [chain]
  );

  const strikes = strikeFilter === 'near' && underlyingPrice > 0
    ? allStrikes.filter(s => Math.abs(s - underlyingPrice) / underlyingPrice < 0.08)
    : allStrikes;

  const callMap = useMemo(() => {
    const m = {}; chain.calls.forEach(c => { m[c.strike] = c; }); return m;
  }, [chain.calls]);

  const putMap = useMemo(() => {
    const m = {}; chain.puts.forEach(p => { m[p.strike] = p; }); return m;
  }, [chain.puts]);

  const atmStrike = strikes.length > 0 && underlyingPrice
    ? strikes.reduce((cl, s) => Math.abs(s - underlyingPrice) < Math.abs(cl - underlyingPrice) ? s : cl)
    : null;

  const atmCall = callMap[atmStrike];
  const atmPut = putMap[atmStrike];
  const ivx = ((atmCall?.impliedVolatility || 0) + (atmPut?.impliedVolatility || 0)) / 2;
  const ivRank = Math.min(99, Math.max(1, Math.round(ivx * 100 * 1.6)));

  const dte = selectedExpiration ? Math.max(1, Math.ceil((selectedExpiration * 1000 - Date.now()) / 86400000)) : 30;
  const expectedMove = underlyingPrice * ivx * Math.sqrt(dte / 365);
  const expectedHigh = underlyingPrice + expectedMove;
  const expectedLow = underlyingPrice - expectedMove;

  const expandedGreeks = useMemo(() => {
    if (!expandedStrike || !underlyingPrice) return null;
    const iv = detailType === 'call'
      ? (callMap[expandedStrike]?.impliedVolatility || ivx || 0.25)
      : (putMap[expandedStrike]?.impliedVolatility || ivx || 0.25);
    return computeGreeks(underlyingPrice, expandedStrike, dte / 365, RISK_FREE_RATE, iv, detailType);
  }, [expandedStrike, underlyingPrice, dte, detailType, callMap, putMap, ivx]);

  const formatExp = (ts) => new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const getDTE = (ts) => Math.max(0, Math.ceil((ts * 1000 - Date.now()) / 86400000));
  const fmtVol = (v) => !v ? '-' : v > 999 ? (v / 1000).toFixed(1) + 'K' : String(v);
  const fmtDelta = (d) => !d && d !== 0 ? '-' : (d >= 0 ? '' : '') + d.toFixed(2);
  const fmtIV = (iv) => !iv ? '-' : (iv * 100).toFixed(0) + '%';

  const priceHeaders = [
    { key: 'bid', label: 'Bid', color: T.green },
    { key: 'ask', label: 'Ask', color: T.red },
    { key: 'vol', label: 'Vol', color: T.textMuted },
    { key: 'oi', label: 'Open', color: T.textMuted },
  ];
  const greekHeaders = [
    { key: 'bid', label: 'Bid', color: T.green },
    { key: 'ask', label: 'Ask', color: T.red },
    { key: 'delta', label: 'Sens.', color: T.blue },
    { key: 'iv', label: 'Vol%', color: T.purple },
  ];
  const headers = colMode === 'price' ? priceHeaders : greekHeaders;

  const getCellValue = (contract, key) => {
    if (!contract) return '-';
    switch (key) {
      case 'bid': return contract.bid?.toFixed(2) || '-';
      case 'ask': return contract.ask?.toFixed(2) || '-';
      case 'vol': return fmtVol(contract.volume);
      case 'oi': return fmtVol(contract.openInterest);
      case 'delta': return fmtDelta(contract.impliedVolatility ? computeGreeks(underlyingPrice, contract.strike, dte / 365, RISK_FREE_RATE, contract.impliedVolatility, contract.type || 'call').delta : null);
      case 'iv': return fmtIV(contract.impliedVolatility);
      case 'last': return contract.lastPrice?.toFixed(2) || '-';
      default: return '-';
    }
  };

  const getCellColor = (key) => {
    switch (key) {
      case 'bid': return T.green;
      case 'ask': return T.red;
      case 'delta': return T.blue;
      case 'iv': return T.purple;
      default: return T.textDim;
    }
  };

  const singleHeaders = [
    { key: 'bid', label: 'Bid' }, { key: 'ask', label: 'Ask' }, { key: 'last', label: 'Last' },
    { key: 'vol', label: 'Vol' }, { key: 'oi', label: 'Open' }, { key: 'delta', label: 'Sens' }, { key: 'iv', label: 'Vol%' },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* ── Quote Bar ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
        background: T.card, borderBottom: `1px solid ${T.border}`,
      }}>
        <Icon name="search" size={14} color={T.textMuted} />
        <input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Symbol"
          style={{
            width: 55, padding: 0, border: "none", outline: "none",
            background: "transparent", color: T.text,
            fontSize: 15, fontWeight: 900, fontFamily: "'JetBrains Mono'",
            caretColor: T.orange,
          }}
        />
        {underlyingPrice > 0 && (
          <>
            <span style={{ fontSize: 15, fontWeight: 900, fontFamily: "'JetBrains Mono'", color: underlyingChange >= 0 ? T.green : T.red }}>
              {underlyingPrice.toFixed(2)}
            </span>
            <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "'JetBrains Mono'", color: underlyingChange >= 0 ? T.green : T.red, background: underlyingChange >= 0 ? '#EDF5ED' : '#FFEBEE', padding: "1px 5px", borderRadius: 4 }}>
              {underlyingChange >= 0 ? '+' : ''}{underlyingChange.toFixed(2)}%
            </span>
          </>
        )}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {ivx > 0 && <IVRGauge ivr={ivRank} />}
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: isLive ? T.green : T.orange, animation: isLive ? "pulse 2s infinite" : "none" }} />
            <span style={{ fontSize: 8, fontWeight: 800, color: isLive ? T.green : T.orange }}>{isLive ? 'LIVE' : 'DLY'}</span>
          </div>
        </div>
      </div>

      {/* Underlying name + expected move */}
      {underlyingPrice > 0 && (
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "4px 14px", background: T.cardAlt, borderBottom: `1px solid ${T.border}`,
          fontSize: 10, fontWeight: 600, color: T.textMuted,
        }}>
          <span>{underlyingName}</span>
          {expectedMove > 0 && (
            <span style={{ fontFamily: "'JetBrains Mono'", color: T.textDim }}>
              Expected Move: <span style={{ color: T.orange }}>&#177;${expectedMove.toFixed(2)}</span>
              <span style={{ color: T.textMuted }}> ({(expectedMove / underlyingPrice * 100).toFixed(1)}%)</span>
            </span>
          )}
        </div>
      )}

      {/* ── Expiration Pills ── */}
      {expirations.length > 0 && (
        <div className="mobile-scroll-x no-scrollbar" style={{
          display: "flex", gap: 4, padding: "8px 14px",
          background: T.card, borderBottom: `1px solid ${T.border}`,
        }}>
          {expirations.slice(0, 10).map(exp => {
            const active = selectedExpiration === exp;
            const d = getDTE(exp);
            return (
              <button key={exp} onClick={() => { setSelectedExpiration(exp); setExpandedStrike(null); }} style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "5px 10px", borderRadius: 6, flexShrink: 0,
                border: active ? `1px solid ${T.orange}` : `1px solid ${T.border}`,
                background: active ? T.orange + '15' : "transparent",
                cursor: "pointer", transition: "all 0.15s",
              }}>
                <span style={{ fontSize: 11, fontWeight: active ? 800 : 600, fontFamily: "'JetBrains Mono'", color: active ? T.orange : T.text }}>
                  {formatExp(exp)}
                </span>
                <span style={{
                  fontSize: 9, fontWeight: 800, padding: "1px 4px", borderRadius: 3,
                  background: active ? T.orange + '25' : T.surface,
                  color: active ? T.orange : T.textDim,
                }}>
                  {d}d
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Controls Row ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
        background: T.card, borderBottom: `1px solid ${T.border}`, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", border: `1px solid ${T.border}` }}>
          {['calls', 'straddle', 'puts'].map(v => (
            <button key={v} onClick={() => setViewMode(v)} style={{
              padding: "4px 10px", border: "none", cursor: "pointer",
              background: viewMode === v ? T.orange + '18' : T.cardAlt,
              color: viewMode === v ? T.orange : T.textDim,
              fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5,
              borderRight: v !== 'puts' ? `1px solid ${T.border}` : "none",
            }}>
              {v === 'straddle' ? 'All' : v}
            </button>
          ))}
        </div>

        {viewMode === 'straddle' && (
          <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", border: `1px solid ${T.border}` }}>
            {[{ id: 'price', l: 'Price' }, { id: 'greeks', l: 'Greeks' }].map(c => (
              <button key={c.id} onClick={() => setColMode(c.id)} style={{
                padding: "4px 8px", border: "none", cursor: "pointer",
                background: colMode === c.id ? T.blue + '18' : T.cardAlt,
                color: colMode === c.id ? T.blue : T.textDim,
                fontSize: 10, fontWeight: 800,
                borderRight: c.id === 'price' ? `1px solid ${T.border}` : "none",
              }}>
                {c.l}
              </button>
            ))}
          </div>
        )}

        <div style={{ marginLeft: "auto", display: "flex", borderRadius: 6, overflow: "hidden", border: `1px solid ${T.border}` }}>
          {[{ id: 'near', l: 'Near' }, { id: 'all', l: 'All' }].map(f => (
            <button key={f.id} onClick={() => setStrikeFilter(f.id)} style={{
              padding: "4px 8px", border: "none", cursor: "pointer",
              background: strikeFilter === f.id ? T.surface : T.cardAlt,
              color: strikeFilter === f.id ? T.text : T.textMuted,
              fontSize: 10, fontWeight: 700,
              borderRight: f.id === 'near' ? `1px solid ${T.border}` : "none",
            }}>
              {f.l}
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading State ── */}
      {loading && (
        <div style={{ padding: 40, textAlign: "center", background: T.card }}>
          <div style={{ animation: "spin 1s linear infinite", display: "inline-block", marginBottom: 8 }}>
            <Icon name="rotate" size={22} color={T.orange} />
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.textDim }}>Loading options chain...</div>
        </div>
      )}

      {/* ══ STRADDLE VIEW ══ */}
      {!loading && strikes.length > 0 && viewMode === 'straddle' && (
        <div style={{ background: T.bg }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 48px 1fr",
            background: T.cardAlt, borderBottom: `1px solid ${T.border}`,
          }}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${headers.length}, 1fr)`, padding: "6px 4px", textAlign: "center" }}>
              {headers.map(h => (
                <span key={h.key} style={{ fontSize: 8, fontWeight: 800, color: h.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{h.label}</span>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: T.surface, borderLeft: `1px solid ${T.border}`, borderRight: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 7, fontWeight: 900, color: T.textMuted, letterSpacing: 1.5 }}>STRIKE</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${headers.length}, 1fr)`, padding: "6px 4px", textAlign: "center" }}>
              {headers.map(h => (
                <span key={h.key} style={{ fontSize: 8, fontWeight: 800, color: h.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{h.label}</span>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 48px 1fr", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ padding: "2px 0", textAlign: "center", fontSize: 8, fontWeight: 900, color: T.green, letterSpacing: 2, background: T.green + '06' }}>CALLS</div>
            <div style={{ background: T.surface, borderLeft: `1px solid ${T.border}`, borderRight: `1px solid ${T.border}` }} />
            <div style={{ padding: "2px 0", textAlign: "center", fontSize: 8, fontWeight: 900, color: T.red, letterSpacing: 2, background: T.red + '06' }}>PUTS</div>
          </div>

          {strikes.map(strike => {
            const call = callMap[strike];
            const put = putMap[strike];
            const isATM = strike === atmStrike;
            const isITMCall = strike < underlyingPrice;
            const isITMPut = strike > underlyingPrice;
            const inEM = strike >= expectedLow && strike <= expectedHigh;
            const isExpanded = expandedStrike === strike;
            return (
              <React.Fragment key={strike}>
                <div
                  onClick={() => setExpandedStrike(isExpanded ? null : strike)}
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 48px 1fr",
                    borderBottom: `1px solid ${isExpanded ? T.orange + '40' : T.borderLight}`,
                    fontSize: 11, fontFamily: "'JetBrains Mono'",
                    cursor: "pointer",
                    background: isATM ? T.orange + '0A' : isExpanded ? T.surface + '60' : T.card,
                    transition: "background 0.1s",
                  }}
                >
                  <div style={{
                    display: "grid", gridTemplateColumns: `repeat(${headers.length}, 1fr)`,
                    padding: "7px 4px", textAlign: "center",
                    background: isITMCall ? T.green + '08' : "transparent",
                  }}>
                    {headers.map(h => (
                      <span key={h.key} style={{ color: getCellColor(h.key), fontWeight: 700, fontSize: h.key === 'vol' || h.key === 'oi' || h.key === 'iv' ? 10 : 11 }}>
                        {getCellValue(call, h.key)}
                      </span>
                    ))}
                  </div>

                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 900, fontSize: 11,
                    color: isATM ? T.orange : T.text,
                    background: isATM ? T.orange + '15' : T.surface,
                    borderLeft: `1px solid ${T.border}`, borderRight: `1px solid ${T.border}`,
                    position: "relative",
                  }}>
                    {strike}
                    {inEM && !isATM && (
                      <div style={{ position: "absolute", right: 2, top: "50%", transform: "translateY(-50%)", width: 3, height: 3, borderRadius: "50%", background: T.orange + '50' }} />
                    )}
                  </div>

                  <div style={{
                    display: "grid", gridTemplateColumns: `repeat(${headers.length}, 1fr)`,
                    padding: "7px 4px", textAlign: "center",
                    background: isITMPut ? T.red + '08' : "transparent",
                  }}>
                    {headers.map(h => (
                      <span key={h.key} style={{ color: getCellColor(h.key), fontWeight: 700, fontSize: h.key === 'vol' || h.key === 'oi' || h.key === 'iv' ? 10 : 11 }}>
                        {getCellValue(put, h.key)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ── Expanded Strike Detail ── */}
                {isExpanded && expandedGreeks && (
                  <div style={{
                    background: T.cardAlt, borderBottom: `1px solid ${T.orange + '30'}`,
                    padding: "10px 12px", animation: "fadeUp .2s ease both",
                  }}>
                    <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
                      {['call', 'put'].map(t => (
                        <button key={t} onClick={(e) => { e.stopPropagation(); setDetailType(t); }} style={{
                          flex: 1, padding: "5px 0", borderRadius: 5, border: "none", cursor: "pointer",
                          background: detailType === t ? (t === 'call' ? T.green + '18' : T.red + '18') : T.surface,
                          color: detailType === t ? (t === 'call' ? T.green : T.red) : T.textMuted,
                          fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5,
                        }}>
                          Long {t}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4, marginBottom: 8 }}>
                      {[
                        { label: 'WIN %', value: (expandedGreeks.pop * 100).toFixed(0) + '%', color: expandedGreeks.pop > 0.5 ? T.green : expandedGreeks.pop > 0.3 ? T.orange : T.red },
                        { label: 'BREAK EVEN', value: '$' + expandedGreeks.breakeven.toFixed(2), color: T.text },
                        { label: 'MAX GAIN', value: detailType === 'call' ? '\u221E' : '$' + (expandedStrike - expandedGreeks.price).toFixed(0), color: T.green },
                        { label: 'MAX LOSS', value: '$' + (expandedGreeks.price * 100).toFixed(0), color: T.red },
                      ].map(m => (
                        <div key={m.label} style={{ textAlign: "center", padding: "4px 2px", background: T.bg, borderRadius: 4, border: `1px solid ${T.border}` }}>
                          <div style={{ fontSize: 7, fontWeight: 700, color: T.textMuted, letterSpacing: 0.5 }}>{m.label}</div>
                          <div style={{ fontSize: 12, fontWeight: 900, fontFamily: "'JetBrains Mono'", color: m.color, marginTop: 1 }}>{m.value}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 3, marginBottom: 8 }}>
                      {[
                        { label: 'Direction', value: expandedGreeks.delta.toFixed(3), color: expandedGreeks.delta >= 0 ? T.green : T.red },
                        { label: 'Momentum', value: expandedGreeks.gamma.toFixed(4), color: T.blue },
                        { label: 'Time Decay', value: expandedGreeks.theta.toFixed(3), color: T.red },
                        { label: 'Vol Impact', value: expandedGreeks.vega.toFixed(3), color: T.purple },
                        { label: 'Fair Price', value: '$' + expandedGreeks.price.toFixed(2), color: T.orange },
                      ].map(g => (
                        <div key={g.label} style={{ textAlign: "center", padding: "4px 2px", background: T.bg, borderRadius: 4, border: `1px solid ${T.border}` }}>
                          <div style={{ fontSize: 6.5, fontWeight: 700, color: T.textMuted, letterSpacing: 0.3 }}>{g.label}</div>
                          <div style={{ fontSize: 10, fontWeight: 900, fontFamily: "'JetBrains Mono'", color: g.color, marginTop: 1 }}>{g.value}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: T.bg, borderRadius: 6, padding: "6px 8px", border: `1px solid ${T.border}` }}>
                      <div style={{ fontSize: 8, fontWeight: 700, color: T.textMuted, marginBottom: 4, letterSpacing: 0.5 }}>
                        PROFIT/LOSS AT EXPIRY
                      </div>
                      <PayoffDiagram
                        S={underlyingPrice} K={expandedStrike}
                        premium={expandedGreeks.price}
                        type={detailType}
                        breakeven={expandedGreeks.breakeven}
                        T={T}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}

          <div style={{
            padding: "6px 14px", background: T.cardAlt, borderTop: `1px solid ${T.border}`,
            display: "flex", gap: 12, fontSize: 8, fontWeight: 700, color: T.textMuted, alignItems: "center",
          }}>
            <span><span style={{ display: "inline-block", width: 7, height: 7, borderRadius: 2, background: T.green + '20', marginRight: 3, verticalAlign: "middle" }} />Profitable</span>
            <span><span style={{ display: "inline-block", width: 7, height: 7, borderRadius: 2, background: T.orange + '25', marginRight: 3, verticalAlign: "middle" }} />At Price</span>
            <span><span style={{ display: "inline-block", width: 4, height: 4, borderRadius: "50%", background: T.orange + '50', marginRight: 3, verticalAlign: "middle" }} />Expected</span>
            <span style={{ marginLeft: "auto", letterSpacing: 1, fontSize: 7 }}>TAP ROW FOR DETAIL</span>
          </div>
        </div>
      )}

      {/* ══ SINGLE SIDE VIEW ══ */}
      {!loading && strikes.length > 0 && viewMode !== 'straddle' && (
        <div style={{ background: T.bg }}>
          <div style={{
            display: "grid", gridTemplateColumns: "50px repeat(7, 1fr)",
            padding: "6px 4px", textAlign: "center",
            background: T.cardAlt, borderBottom: `1px solid ${T.border}`,
          }}>
            <span style={{ fontSize: 8, fontWeight: 900, color: T.textMuted, letterSpacing: 1 }}>STK</span>
            {singleHeaders.map(h => (
              <span key={h.key} style={{ fontSize: 8, fontWeight: 800, color: getCellColor(h.key), textTransform: "uppercase", letterSpacing: 0.3 }}>{h.label}</span>
            ))}
          </div>

          <div style={{
            padding: "2px 0", textAlign: "center", borderBottom: `1px solid ${T.border}`,
            fontSize: 8, fontWeight: 900, letterSpacing: 2,
            color: viewMode === 'calls' ? T.green : T.red,
            background: (viewMode === 'calls' ? T.green : T.red) + '06',
          }}>
            {viewMode.toUpperCase()}
          </div>

          {strikes.map(strike => {
            const contract = viewMode === 'calls' ? callMap[strike] : putMap[strike];
            const isATM = strike === atmStrike;
            const isITM = viewMode === 'calls' ? strike < underlyingPrice : strike > underlyingPrice;
            const isExpanded = expandedStrike === strike;
            return (
              <React.Fragment key={strike}>
                <div
                  onClick={() => setExpandedStrike(isExpanded ? null : strike)}
                  style={{
                    display: "grid", gridTemplateColumns: "50px repeat(7, 1fr)",
                    padding: "7px 4px", textAlign: "center",
                    borderBottom: `1px solid ${T.borderLight}`,
                    background: isATM ? T.orange + '0A' : isITM ? (viewMode === 'calls' ? T.green : T.red) + '06' : T.card,
                    cursor: "pointer", fontSize: 11, fontFamily: "'JetBrains Mono'",
                  }}
                >
                  <span style={{ fontWeight: 900, color: isATM ? T.orange : T.text }}>{strike}</span>
                  {singleHeaders.map(h => (
                    <span key={h.key} style={{ color: getCellColor(h.key), fontWeight: 700, fontSize: h.key === 'vol' || h.key === 'oi' || h.key === 'iv' || h.key === 'delta' ? 10 : 11 }}>
                      {getCellValue(contract ? { ...contract, type: viewMode === 'calls' ? 'call' : 'put' } : null, h.key)}
                    </span>
                  ))}
                </div>

                {isExpanded && expandedGreeks && (
                  <div style={{ background: T.cardAlt, borderBottom: `1px solid ${T.orange + '30'}`, padding: "10px 12px", animation: "fadeUp .2s ease both" }}>
                    <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
                      {['call', 'put'].map(t => (
                        <button key={t} onClick={(e) => { e.stopPropagation(); setDetailType(t); }} style={{
                          flex: 1, padding: "5px 0", borderRadius: 5, border: "none", cursor: "pointer",
                          background: detailType === t ? (t === 'call' ? T.green + '18' : T.red + '18') : T.surface,
                          color: detailType === t ? (t === 'call' ? T.green : T.red) : T.textMuted,
                          fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5,
                        }}>
                          Long {t}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4, marginBottom: 8 }}>
                      {[
                        { label: 'WIN %', value: (expandedGreeks.pop * 100).toFixed(0) + '%', color: expandedGreeks.pop > 0.5 ? T.green : expandedGreeks.pop > 0.3 ? T.orange : T.red },
                        { label: 'BREAK EVEN', value: '$' + expandedGreeks.breakeven.toFixed(2), color: T.text },
                        { label: 'MAX GAIN', value: detailType === 'call' ? '\u221E' : '$' + (expandedStrike - expandedGreeks.price).toFixed(0), color: T.green },
                        { label: 'MAX LOSS', value: '$' + (expandedGreeks.price * 100).toFixed(0), color: T.red },
                      ].map(m => (
                        <div key={m.label} style={{ textAlign: "center", padding: "4px 2px", background: T.bg, borderRadius: 4, border: `1px solid ${T.border}` }}>
                          <div style={{ fontSize: 7, fontWeight: 700, color: T.textMuted, letterSpacing: 0.5 }}>{m.label}</div>
                          <div style={{ fontSize: 12, fontWeight: 900, fontFamily: "'JetBrains Mono'", color: m.color, marginTop: 1 }}>{m.value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 3, marginBottom: 8 }}>
                      {[
                        { label: 'Direction', value: expandedGreeks.delta.toFixed(3), color: expandedGreeks.delta >= 0 ? T.green : T.red },
                        { label: 'Momentum', value: expandedGreeks.gamma.toFixed(4), color: T.blue },
                        { label: 'Time Decay', value: expandedGreeks.theta.toFixed(3), color: T.red },
                        { label: 'Vol Impact', value: expandedGreeks.vega.toFixed(3), color: T.purple },
                        { label: 'Fair Price', value: '$' + expandedGreeks.price.toFixed(2), color: T.orange },
                      ].map(g => (
                        <div key={g.label} style={{ textAlign: "center", padding: "4px 2px", background: T.bg, borderRadius: 4, border: `1px solid ${T.border}` }}>
                          <div style={{ fontSize: 6.5, fontWeight: 700, color: T.textMuted, letterSpacing: 0.3 }}>{g.label}</div>
                          <div style={{ fontSize: 10, fontWeight: 900, fontFamily: "'JetBrains Mono'", color: g.color, marginTop: 1 }}>{g.value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: T.bg, borderRadius: 6, padding: "6px 8px", border: `1px solid ${T.border}` }}>
                      <div style={{ fontSize: 8, fontWeight: 700, color: T.textMuted, marginBottom: 4, letterSpacing: 0.5 }}>PROFIT/LOSS AT EXPIRY</div>
                      <PayoffDiagram S={underlyingPrice} K={expandedStrike} premium={expandedGreeks.price} type={detailType} breakeven={expandedGreeks.breakeven} T={T} />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && strikes.length === 0 && (
        <div style={{ padding: 40, textAlign: "center", background: T.card }}>
          <Icon name="chart-bar" size={28} color={T.textMuted} />
          <div style={{ fontSize: 13, fontWeight: 700, color: T.textDim, marginTop: 8 }}>No Options Data</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginTop: 4 }}>Search for a valid symbol above</div>
        </div>
      )}

      {/* ── Trade CTA ── */}
      {underlyingPrice > 0 && !loading && (
        <div style={{ padding: "10px 14px", background: T.card, borderTop: `1px solid ${T.border}` }}>
          <button onClick={() => goToStock && goToStock(ticker)} style={{
            width: "100%", padding: "13px 0", borderRadius: 8, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, ${T.orange}, ${T.orangeBright})`,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <Icon name="chart-up" size={15} color="#fff" />
            <span style={{ fontSize: 15, fontWeight: 900, color: "#fff", letterSpacing: 1, fontFamily: "'JetBrains Mono'" }}>
              Trade {ticker}
            </span>
            <span style={{ fontSize: 13, color: "#fff9", fontWeight: 700 }}>&rsaquo;</span>
          </button>
        </div>
      )}
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// ██  MAIN OPTIONS PAGE
// ══════════════════════════════════════════════════════════════
export default function OptionsPage({ goToStock }) {
  const [activeTab, setActiveTab] = useState('positions');

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      background: T.bg, margin: "-10px -12px",
      minHeight: "calc(100% + 20px)",
    }}>

      {/* ── Sub-Tabs ── */}
      <div className="mobile-scroll-x no-scrollbar" style={{
        display: "flex", gap: 0, padding: "0 14px",
        background: T.card, borderBottom: `1px solid ${T.border}`,
      }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "9px 12px", border: "none", cursor: "pointer",
                background: "transparent", flexShrink: 0, position: "relative",
                borderBottom: active ? `2px solid ${T.orange}` : "2px solid transparent",
              }}
            >
              <Icon name={tab.icon} size={12} color={active ? T.orange : T.textMuted} />
              <span style={{
                fontSize: 11, fontWeight: active ? 800 : 600,
                color: active ? T.orange : T.textDim,
                letterSpacing: 0.3,
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {activeTab === 'positions' && <PositionsTab goToStock={goToStock} />}
        {activeTab === 'chain' && <ChainTab goToStock={goToStock} />}
        {activeTab === 'pricing' && <div style={{ padding: "10px 12px" }}><BlackScholesModel /></div>}
        {activeTab === 'simulate' && <div style={{ padding: "10px 12px" }}><MonteCarloModel /></div>}
        {activeTab === 'analysis' && <div style={{ padding: "10px 12px" }}><DistributionAnalysis /></div>}
        {activeTab === 'flow' && <div style={{ padding: "10px 12px" }}><OptionsTradeFlow /></div>}
      </div>
    </div>
  );
}

export { T };
