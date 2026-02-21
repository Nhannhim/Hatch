import React, { useState, useMemo } from 'react';
import { Icon } from '../../components/Icons';
import { T } from '../OptionsPage';

function generateReturnDistribution(mu, sigma, periods, numSamples) {
  const annualizedReturns = [];
  for (let i = 0; i < numSamples; i++) {
    let cumReturn = 1;
    for (let d = 0; d < periods; d++) {
      let u2 = 0, v2 = 0;
      while (u2 === 0) u2 = Math.random();
      while (v2 === 0) v2 = Math.random();
      const z2 = Math.sqrt(-2.0 * Math.log(u2)) * Math.cos(2.0 * Math.PI * v2);
      cumReturn *= (1 + mu / 252 + (sigma / Math.sqrt(252)) * z2);
    }
    annualizedReturns.push((cumReturn - 1) * 100);
  }
  annualizedReturns.sort((a, b) => a - b);
  return annualizedReturns;
}

function buildHistogram(data, bins) {
  const min = data[0];
  const max = data[data.length - 1];
  const binWidth = (max - min) / bins;
  const hist = Array(bins).fill(0);
  data.forEach(v => {
    const idx = Math.min(bins - 1, Math.floor((v - min) / binWidth));
    hist[idx]++;
  });
  return { hist, min, max, binWidth, maxBin: Math.max(...hist) };
}

export default function DistributionAnalysis() {
  const ASSETS = [
    { ticker: 'AAPL', name: 'Apple', mu: 0.25, sigma: 0.28, color: T.green },
    { ticker: 'SPY', name: 'S&P 500', mu: 0.10, sigma: 0.15, color: T.blue },
    { ticker: 'TSLA', name: 'Tesla', mu: 0.30, sigma: 0.52, color: T.red },
    { ticker: 'QQQ', name: 'Nasdaq 100', mu: 0.15, sigma: 0.20, color: T.purple },
    { ticker: 'GLD', name: 'Gold ETF', mu: 0.08, sigma: 0.15, color: T.gold },
  ];
  const [selectedAsset, setSelectedAsset] = useState(0);
  const [periods, setPeriods] = useState(30);
  const [numSamples] = useState(10000);

  const asset = ASSETS[selectedAsset];

  const analysis = useMemo(() => {
    const returns = generateReturnDistribution(asset.mu, asset.sigma, periods, numSamples);
    const { hist, min, max, binWidth, maxBin } = buildHistogram(returns, 40);
    const mean = returns.reduce((s, r) => s + r, 0) / numSamples;
    const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / numSamples;
    const stdDev = Math.sqrt(variance);
    const skewness = returns.reduce((s, r) => s + ((r - mean) / stdDev) ** 3, 0) / numSamples;
    const kurtosis = returns.reduce((s, r) => s + ((r - mean) / stdDev) ** 4, 0) / numSamples - 3;

    const var95 = returns[Math.floor(numSamples * 0.05)];
    const var99 = returns[Math.floor(numSamples * 0.01)];
    const cvar95 = returns.slice(0, Math.floor(numSamples * 0.05)).reduce((s, r) => s + r, 0) / Math.floor(numSamples * 0.05);

    const probPositive = returns.filter(r => r > 0).length / numSamples;
    const probDouble = returns.filter(r => r > 100).length / numSamples;
    const probHalf = returns.filter(r => r < -50).length / numSamples;

    return {
      returns, hist, min, max, binWidth, maxBin,
      stats: { mean, stdDev, skewness, kurtosis, var95, var99, cvar95, probPositive, probDouble, probHalf },
    };
  }, [asset, periods, numSamples]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* Asset Selector */}
      <div className="mobile-scroll-x no-scrollbar" style={{ display: "flex", gap: 4 }}>
        {ASSETS.map((a, i) => (
          <button key={a.ticker} onClick={() => setSelectedAsset(i)} style={{
            padding: "5px 12px", borderRadius: 6, flexShrink: 0,
            border: selectedAsset === i ? `1.5px solid ${a.color}` : `1px solid ${T.border}`,
            background: selectedAsset === i ? a.color + '15' : T.card,
            fontSize: 11, fontWeight: 800, cursor: "pointer", color: selectedAsset === i ? a.color : T.textDim,
          }}>
            {a.ticker}
          </button>
        ))}
      </div>

      {/* Period Selector */}
      <div style={{ display: "flex", gap: 3 }}>
        {[{ d: 7, l: '1W' }, { d: 30, l: '1M' }, { d: 90, l: '3M' }, { d: 180, l: '6M' }, { d: 252, l: '1Y' }].map(p => (
          <button key={p.d} onClick={() => setPeriods(p.d)} style={{
            flex: 1, padding: "6px 0", borderRadius: 6,
            border: periods === p.d ? `1px solid ${T.orange}` : `1px solid ${T.border}`,
            background: periods === p.d ? T.orange + '15' : T.card,
            fontSize: 11, fontWeight: 800, cursor: "pointer",
            color: periods === p.d ? T.orange : T.textDim,
          }}>
            {p.l}
          </button>
        ))}
      </div>

      {/* Histogram */}
      <div style={{ background: T.card, borderRadius: 8, padding: "10px 12px", border: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{asset.name} Returns</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.textDim }}>
              {numSamples.toLocaleString()} simulated {periods}-day periods
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 0.5, height: 80 }}>
          {analysis.hist.map((count, i) => {
            const h = analysis.maxBin > 0 ? (count / analysis.maxBin) * 70 : 0;
            const binCenter = analysis.min + (i + 0.5) * analysis.binWidth;
            const isNeg = binCenter < 0;
            const isZero = Math.abs(binCenter) < analysis.binWidth;
            return (
              <div key={i} style={{
                flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", height: 80,
              }}>
                <div style={{
                  width: "100%", minHeight: 1, height: Math.max(1, h),
                  borderRadius: "2px 2px 0 0",
                  background: isZero ? T.orange : isNeg ? T.red + '50' : asset.color + '60',
                }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 700, color: T.textMuted, marginTop: 3 }}>
          <span>{analysis.min.toFixed(0)}%</span>
          <span style={{ color: T.orange }}>0%</span>
          <span>{analysis.max.toFixed(0)}%</span>
        </div>
      </div>

      {/* Distribution Metrics */}
      <div style={{
        background: T.cardAlt, borderRadius: 8, padding: "12px", border: `1px solid ${T.border}`,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
          Distribution Metrics
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
          {[
            { label: 'Mean', value: analysis.stats.mean.toFixed(1) + '%', color: analysis.stats.mean >= 0 ? T.green : T.red },
            { label: 'Std Dev', value: analysis.stats.stdDev.toFixed(1) + '%', color: T.blue },
            { label: 'Skew', value: analysis.stats.skewness.toFixed(2), color: analysis.stats.skewness >= 0 ? T.green : T.red },
            { label: 'Kurtosis', value: analysis.stats.kurtosis.toFixed(2), color: T.purple },
            { label: 'VaR 95%', value: analysis.stats.var95.toFixed(1) + '%', color: T.red },
            { label: 'CVaR 95%', value: analysis.stats.cvar95.toFixed(1) + '%', color: T.red },
          ].map(s => (
            <div key={s.label} style={{
              background: T.cardAlt, borderRadius: 6, padding: "6px 4px", textAlign: "center", border: `1px solid ${T.border}`,
            }}>
              <div style={{ fontSize: 7, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 900, fontFamily: "'JetBrains Mono'", color: s.color }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Probability Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
        {[
          { label: 'P(Gain)', value: (analysis.stats.probPositive * 100).toFixed(1) + '%', icon: 'chart-up', color: T.green },
          { label: 'P(2x)', value: (analysis.stats.probDouble * 100).toFixed(1) + '%', icon: 'rocket', color: T.gold },
          { label: 'P(-50%)', value: (analysis.stats.probHalf * 100).toFixed(1) + '%', icon: 'chart-down', color: T.red },
        ].map(p => (
          <div key={p.label} style={{
            background: T.card, borderRadius: 8, padding: "10px 6px", textAlign: "center", border: `1px solid ${T.border}`,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6, background: p.color + '18',
              margin: "0 auto 4px", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon name={p.icon} size={12} color={p.color} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'JetBrains Mono'", color: p.color }}>{p.value}</div>
            <div style={{ fontSize: 8, fontWeight: 700, color: T.textMuted, marginTop: 2 }}>{p.label}</div>
          </div>
        ))}
      </div>

      {/* Model Parameters */}
      <div style={{ background: T.card, borderRadius: 8, padding: "10px 12px", border: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: T.text, marginBottom: 4 }}>Parameters</div>
        {[
          { label: 'Expected Return (mu)', value: (asset.mu * 100).toFixed(0) + '% ann.' },
          { label: 'Volatility (sigma)', value: (asset.sigma * 100).toFixed(0) + '% ann.' },
          { label: 'Period', value: periods + ' trading days' },
          { label: 'Samples', value: numSamples.toLocaleString() + ' paths' },
        ].map((p, i) => (
          <div key={p.label} style={{
            display: "flex", justifyContent: "space-between", padding: "5px 0",
            borderBottom: i < 3 ? `1px solid ${T.border}` : "none",
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.textDim }}>{p.label}</span>
            <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "'JetBrains Mono'", color: T.text }}>{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
