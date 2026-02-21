import React, { useState, useMemo, useCallback } from 'react';
import { Icon } from '../../components/Icons';
import { T } from '../OptionsPage';

function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function runMonteCarlo(S, K, TT, r, sigma, type, numPaths, numSteps) {
  const dt = TT / numSteps;
  const drift = (r - 0.5 * sigma * sigma) * dt;
  const diffusion = sigma * Math.sqrt(dt);

  const paths = [];
  const finalPrices = [];
  let payoffSum = 0;

  for (let i = 0; i < numPaths; i++) {
    let price = S;
    const path = [price];
    for (let j = 0; j < numSteps; j++) {
      price = price * Math.exp(drift + diffusion * randn());
      path.push(price);
    }
    paths.push(path);
    finalPrices.push(price);
    const payoff = type === 'call' ? Math.max(0, price - K) : Math.max(0, K - price);
    payoffSum += payoff;
  }

  const optionPrice = Math.exp(-r * TT) * (payoffSum / numPaths);
  finalPrices.sort((a, b) => a - b);
  const mean = finalPrices.reduce((s, p) => s + p, 0) / numPaths;
  const variance = finalPrices.reduce((s, p) => s + (p - mean) ** 2, 0) / numPaths;
  const stdDev = Math.sqrt(variance);
  const p5 = finalPrices[Math.floor(numPaths * 0.05)];
  const p25 = finalPrices[Math.floor(numPaths * 0.25)];
  const p50 = finalPrices[Math.floor(numPaths * 0.50)];
  const p75 = finalPrices[Math.floor(numPaths * 0.75)];
  const p95 = finalPrices[Math.floor(numPaths * 0.95)];
  const probITM = type === 'call'
    ? finalPrices.filter(p => p > K).length / numPaths
    : finalPrices.filter(p => p < K).length / numPaths;

  const bins = 30;
  const minP = finalPrices[0];
  const maxP = finalPrices[numPaths - 1];
  const binWidth = (maxP - minP) / bins;
  const histogram = Array(bins).fill(0);
  finalPrices.forEach(p => {
    const idx = Math.min(bins - 1, Math.floor((p - minP) / binWidth));
    histogram[idx]++;
  });
  const maxBin = Math.max(...histogram);

  return {
    optionPrice,
    paths: paths.slice(0, 30),
    finalPrices,
    stats: { mean, stdDev, p5, p25, p50, p75, p95, probITM },
    histogram, minP, maxP, maxBin, binWidth,
  };
}

export default function MonteCarloModel() {
  const [S, setS] = useState(228.50);
  const [K, setK] = useState(230);
  const [Tdays, setTdays] = useState(30);
  const [r, setR] = useState(4.5);
  const [sigma, setSigma] = useState(28);
  const [optType, setOptType] = useState('call');
  const [numPaths, setNumPaths] = useState(5000);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const runSim = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const res = runMonteCarlo(S, K, Tdays / 365, r / 100, sigma / 100, optType, numPaths, Math.min(Tdays, 60));
      setResult(res);
      setRunning(false);
    }, 50);
  }, [S, K, Tdays, r, sigma, optType, numPaths]);

  const InputRow = ({ label, value, onChange, min, max, step, unit }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
      <div style={{ width: 48, fontSize: 11, fontWeight: 700, color: T.textDim, flexShrink: 0 }}>{label}</div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        style={{ flex: 1, accentColor: T.orange, height: 3 }}
      />
      <div style={{
        minWidth: 52, padding: "3px 6px", borderRadius: 4,
        background: T.cardAlt, textAlign: "center", border: `1px solid ${T.border}`,
        fontSize: 11, fontWeight: 800, fontFamily: "'JetBrains Mono'", color: T.text,
      }}>
        {typeof value === 'number' && value >= 1000 ? (value / 1000) + 'K' : value}{unit || ''}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* Type Toggle */}
      <div style={{ display: "flex", gap: 3 }}>
        {['call', 'put'].map(t => (
          <button key={t} onClick={() => setOptType(t)} style={{
            flex: 1, padding: "7px 0", borderRadius: 6,
            border: optType === t ? `1.5px solid ${t === 'call' ? T.green : T.red}` : `1px solid ${T.border}`,
            background: optType === t ? (t === 'call' ? T.green + '15' : T.red + '15') : T.card,
            fontSize: 13, fontWeight: 800, cursor: "pointer",
            color: optType === t ? (t === 'call' ? T.green : T.red) : T.textMuted,
            textTransform: "uppercase", letterSpacing: 1,
          }}>
            {t}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div style={{ background: T.card, borderRadius: 8, padding: "10px 12px", border: `1px solid ${T.border}` }}>
        <InputRow label="Spot" value={S} onChange={setS} min={1} max={2000} step={0.5} />
        <InputRow label="Strike" value={K} onChange={setK} min={1} max={2000} step={0.5} />
        <InputRow label="DTE" value={Tdays} onChange={setTdays} min={1} max={365} step={1} unit="d" />
        <InputRow label="Rate" value={r} onChange={setR} min={0} max={15} step={0.1} unit="%" />
        <InputRow label="IV" value={sigma} onChange={setSigma} min={1} max={200} step={0.5} unit="%" />
        <InputRow label="Paths" value={numPaths} onChange={setNumPaths} min={500} max={50000} step={500} />
      </div>

      {/* Run Button - TastyTrade orange CTA */}
      <button onClick={runSim} disabled={running} style={{
        width: "100%", padding: "14px 0", borderRadius: 8,
        background: running ? T.border : `linear-gradient(135deg, ${T.orange}, ${T.orangeBright})`,
        border: "none", color: "#fff", fontSize: 14, fontWeight: 900,
        cursor: running ? "wait" : "pointer",
        letterSpacing: 1, textTransform: "uppercase",
        fontFamily: "'JetBrains Mono'",
      }}>
        {running ? "SIMULATING..." : "RUN MONTE CARLO \u203A"}
      </button>

      {result && (
        <>
          {/* Price Result - TastyTrade header bar style */}
          <div style={{
            background: T.cardAlt, borderRadius: 8, padding: "14px", border: `1px solid ${T.border}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>
                  MC OPTION PRICE
                </div>
                <div style={{ fontSize: 30, fontWeight: 900, fontFamily: "'JetBrains Mono'", color: T.text }}>
                  ${result.optionPrice.toFixed(2)}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: T.textMuted }}>POP</div>
                <div style={{
                  fontSize: 20, fontWeight: 900, fontFamily: "'JetBrains Mono'",
                  color: result.stats.probITM > 0.5 ? T.green : T.red,
                }}>
                  {(result.stats.probITM * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Percentile Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 3, marginTop: 10 }}>
              {[
                { label: '5th', value: result.stats.p5.toFixed(1) },
                { label: '25th', value: result.stats.p25.toFixed(1) },
                { label: 'Med', value: result.stats.p50.toFixed(1) },
                { label: '75th', value: result.stats.p75.toFixed(1) },
                { label: '95th', value: result.stats.p95.toFixed(1) },
              ].map(s => (
                <div key={s.label} style={{ background: T.cardAlt, borderRadius: 4, padding: "5px 2px", textAlign: "center", border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 7, fontWeight: 700, color: T.textMuted }}>{s.label}</div>
                  <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "'JetBrains Mono'", color: T.text }}>${s.value}</div>
                </div>
              ))}
            </div>

            {/* Max Profit / Max Loss bar */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 3, marginTop: 6 }}>
              <div style={{ background: T.cardAlt, borderRadius: 4, padding: "5px 4px", textAlign: "center", border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 7, fontWeight: 700, color: T.green }}>MAX PROF</div>
                <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "'JetBrains Mono'", color: T.green }}>
                  ${optType === 'call' ? (result.stats.p95 - K > 0 ? (result.stats.p95 - K).toFixed(0) : '0') : (K - result.stats.p5 > 0 ? (K - result.stats.p5).toFixed(0) : '0')}
                </div>
              </div>
              <div style={{ background: T.cardAlt, borderRadius: 4, padding: "5px 4px", textAlign: "center", border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 7, fontWeight: 700, color: T.red }}>MAX LOSS</div>
                <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "'JetBrains Mono'", color: T.red }}>
                  ${result.optionPrice.toFixed(2)}
                </div>
              </div>
              <div style={{ background: T.cardAlt, borderRadius: 4, padding: "5px 4px", textAlign: "center", border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 7, fontWeight: 700, color: T.textMuted }}>MEAN</div>
                <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "'JetBrains Mono'", color: T.text }}>${result.stats.mean.toFixed(1)}</div>
              </div>
              <div style={{ background: T.cardAlt, borderRadius: 4, padding: "5px 4px", textAlign: "center", border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 7, fontWeight: 700, color: T.textMuted }}>STD DEV</div>
                <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "'JetBrains Mono'", color: T.blue }}>${result.stats.stdDev.toFixed(1)}</div>
              </div>
            </div>
          </div>

          {/* Distribution Histogram */}
          <div style={{ background: T.card, borderRadius: 8, padding: "10px 12px", border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: T.text, marginBottom: 6 }}>
              Terminal Price Distribution
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 1, height: 70 }}>
              {result.histogram.map((count, i) => {
                const binCenter = result.minP + (i + 0.5) * result.binWidth;
                const h = result.maxBin > 0 ? (count / result.maxBin) * 60 : 0;
                const isStrike = Math.abs(binCenter - K) < result.binWidth;
                return (
                  <div key={i} style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: 70,
                  }}>
                    <div style={{
                      width: "100%", minHeight: 1, height: Math.max(1, h),
                      borderRadius: "2px 2px 0 0",
                      background: isStrike ? T.orange : binCenter < K
                        ? (optType === 'call' ? T.red + '45' : T.green + '45')
                        : (optType === 'call' ? T.green + '45' : T.red + '45'),
                    }} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 700, color: T.textMuted, marginTop: 3 }}>
              <span>${result.minP.toFixed(0)}</span>
              <span style={{ color: T.orange }}>K=${K}</span>
              <span>${result.maxP.toFixed(0)}</span>
            </div>
          </div>

          {/* Sample Paths */}
          <div style={{ background: T.card, borderRadius: 8, padding: "10px 12px", border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: T.text, marginBottom: 6 }}>
              Sample Paths ({result.paths.length}/{numPaths.toLocaleString()})
            </div>
            <svg width="100%" viewBox="0 0 380 90" style={{ overflow: "visible" }}>
              {/* Strike line */}
              <line x1="0" y1={90 - ((K - result.minP) / (result.maxP - result.minP)) * 90}
                x2="380" y2={90 - ((K - result.minP) / (result.maxP - result.minP)) * 90}
                stroke={T.orange} strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
              {/* Paths */}
              {result.paths.map((path, i) => {
                const points = path.map((p, j) => {
                  const x = (j / (path.length - 1)) * 380;
                  const y = 90 - ((p - result.minP) / (result.maxP - result.minP)) * 90;
                  return `${x},${Math.max(0, Math.min(90, y))}`;
                }).join(' ');
                const finalPrice = path[path.length - 1];
                const itm = optType === 'call' ? finalPrice > K : finalPrice < K;
                return (
                  <polyline key={i} points={points} fill="none"
                    stroke={itm ? T.green : T.red}
                    strokeWidth="0.7" opacity="0.4" />
                );
              })}
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 700, color: T.textMuted, marginTop: 3 }}>
              <span>Day 0</span>
              <span style={{ color: T.orange }}>Strike ${K}</span>
              <span>Expiry</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
