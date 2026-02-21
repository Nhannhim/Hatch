import React, { useState, useMemo } from 'react';
import { Icon } from '../../components/Icons';
import { T } from '../OptionsPage';

// Black-Scholes pricing formula
function normalCDF(x) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1.0 + sign * y);
}

function normalPDF(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function blackScholes(S, K, T, r, sigma, type = 'call') {
  if (T <= 0 || sigma <= 0) return { price: Math.max(0, type === 'call' ? S - K : K - S), delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 };
  const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  const Nd1 = normalCDF(d1);
  const Nd2 = normalCDF(d2);
  const Nmd1 = normalCDF(-d1);
  const Nmd2 = normalCDF(-d2);
  const nd1 = normalPDF(d1);

  let price, delta, rho;
  if (type === 'call') {
    price = S * Nd1 - K * Math.exp(-r * T) * Nd2;
    delta = Nd1;
    rho = K * T * Math.exp(-r * T) * Nd2 / 100;
  } else {
    price = K * Math.exp(-r * T) * Nmd2 - S * Nmd1;
    delta = Nd1 - 1;
    rho = -K * T * Math.exp(-r * T) * Nmd2 / 100;
  }

  const gamma = nd1 / (S * sigma * Math.sqrt(T));
  const theta = (-(S * nd1 * sigma) / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * (type === 'call' ? Nd2 : Nmd2)) / 365;
  const vega = S * nd1 * Math.sqrt(T) / 100;

  return { price, delta, gamma, theta, vega, rho };
}

const PRESETS = [
  { label: 'AAPL', S: 228.50, K: 230, T: 30, r: 4.5, sigma: 28 },
  { label: 'SPY', S: 598.30, K: 600, T: 45, r: 4.5, sigma: 15 },
  { label: 'TSLA', S: 342.10, K: 350, T: 14, r: 4.5, sigma: 52 },
  { label: 'NVDA', S: 875.20, K: 880, T: 30, r: 4.5, sigma: 45 },
];

export default function BlackScholesModel() {
  const [S, setS] = useState(228.50);
  const [K, setK] = useState(230);
  const [Tdays, setTdays] = useState(30);
  const [r, setR] = useState(4.5);
  const [sigma, setSigma] = useState(28);
  const [optType, setOptType] = useState('call');

  const result = useMemo(() => {
    return blackScholes(S, K, Tdays / 365, r / 100, sigma / 100, optType);
  }, [S, K, Tdays, r, sigma, optType]);

  const sensitivityData = useMemo(() => {
    const pts = [];
    const range = S * 0.15;
    for (let i = -10; i <= 10; i++) {
      const spot = S + (range / 10) * i;
      const res = blackScholes(spot, K, Tdays / 365, r / 100, sigma / 100, optType);
      pts.push({ spot, price: res.price, delta: res.delta });
    }
    return pts;
  }, [S, K, Tdays, r, sigma, optType]);

  const maxPrice = Math.max(...sensitivityData.map(d => d.price), 0.01);

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
        {value}{unit || ''}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* Presets */}
      <div className="mobile-scroll-x no-scrollbar" style={{ display: "flex", gap: 4 }}>
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => { setS(p.S); setK(p.K); setTdays(p.T); setR(p.r); setSigma(p.sigma); }}
            style={{
              padding: "5px 12px", borderRadius: 6, border: `1px solid ${S === p.S && K === p.K ? T.orange : T.border}`,
              background: S === p.S && K === p.K ? T.orange + '15' : T.card,
              fontSize: 11, fontWeight: 800, cursor: "pointer", color: S === p.S && K === p.K ? T.orange : T.textDim, flexShrink: 0,
            }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Option Type Toggle */}
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
      </div>

      {/* Result Card - TastyTrade dark terminal style */}
      <div style={{
        background: T.cardAlt, borderRadius: 8, padding: "14px", border: `1px solid ${T.border}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>
              THEORETICAL PRICE
            </div>
            <div style={{
              fontSize: 32, fontWeight: 900, fontFamily: "'JetBrains Mono'",
              color: T.text, letterSpacing: -1,
            }}>
              ${result.price.toFixed(2)}
            </div>
          </div>
          <div style={{ padding: "4px 8px", borderRadius: 6, background: T.orange + '15', border: `1px solid ${T.orange}30` }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: T.textMuted }}>IV INPUT</div>
            <div style={{ fontSize: 14, fontWeight: 900, fontFamily: "'JetBrains Mono'", color: T.orange }}>{sigma}%</div>
          </div>
        </div>

        {/* Greeks Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginTop: 10 }}>
          {[
            { label: 'Delta', value: result.delta.toFixed(4), color: result.delta >= 0 ? T.green : T.red },
            { label: 'Gamma', value: result.gamma.toFixed(4), color: T.blue },
            { label: 'Theta', value: result.theta.toFixed(4), color: T.red },
            { label: 'Vega', value: result.vega.toFixed(4), color: T.purple },
            { label: 'Rho', value: result.rho.toFixed(4), color: T.gold },
            { label: 'P(ITM)', value: (normalCDF(optType === 'call' ?
              (Math.log(S / K) + (r/100 + (sigma/100)**2 / 2) * (Tdays/365)) / ((sigma/100) * Math.sqrt(Tdays/365)) :
              -(Math.log(S / K) + (r/100 + (sigma/100)**2 / 2) * (Tdays/365)) / ((sigma/100) * Math.sqrt(Tdays/365))
            ) * 100).toFixed(1) + '%', color: T.orange },
          ].map(g => (
            <div key={g.label} style={{
              background: T.cardAlt, borderRadius: 6, padding: "6px 4px", textAlign: "center", border: `1px solid ${T.border}`,
            }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>{g.label}</div>
              <div style={{ fontSize: 13, fontWeight: 900, fontFamily: "'JetBrains Mono'", color: g.color }}>
                {g.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payoff / Price Sensitivity Chart */}
      <div style={{ background: T.card, borderRadius: 8, padding: "10px 12px", border: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: T.text, marginBottom: 6 }}>Price Sensitivity</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 1, height: 70 }}>
          {sensitivityData.map((d, i) => {
            const h = maxPrice > 0 ? (d.price / maxPrice) * 60 : 0;
            const isATM = Math.abs(d.spot - S) < (S * 0.015);
            return (
              <div key={i} style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: 70,
              }}>
                <div style={{
                  width: "100%", minHeight: 1, height: Math.max(1, h),
                  borderRadius: "2px 2px 0 0",
                  background: isATM
                    ? T.orange
                    : d.spot < K
                      ? (optType === 'call' ? T.red + '50' : T.green + '50')
                      : (optType === 'call' ? T.green + '50' : T.red + '50'),
                }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 700, color: T.textMuted, marginTop: 3 }}>
          <span>${(S * 0.85).toFixed(0)}</span>
          <span style={{ color: T.orange }}>ATM ${S.toFixed(0)}</span>
          <span>${(S * 1.15).toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}
