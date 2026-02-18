import React, { useState, useEffect, useRef } from "react";
import { useAuth } from './contexts/AuthContext';
import AuthPage from './components/AuthPage';
import { useAgentSystem } from './hooks/useAgentSystem';
import { Icon, EIcon, EMOJI_TO_ICON } from './components/Icons';
import { useStockPrices } from './hooks/useStockPrices';
import { useStockChart } from './hooks/useStockChart';
import { useStockDetail } from './hooks/useStockDetail';
import { useNewsStream } from './hooks/useNewsStream';
import { useCompanyNews } from './hooks/useCompanyNews';
import { PortfolioService } from './services/portfolioService';
import {
  calendarEvents,
  portfolioHistory,
  myBaskets,
  basketStocks,
  basketHistories,
  macroAlerts,
  terminalFeed,
  allInstruments,
  typeColors,
  typeLabels,
  typeIcons,
  macroScenarios,
  explorerBaskets,
  recentTrades,
  macroIndicators,
  regimes,
  detectRegime,
  currentRegime,
  portfolioRisk,
  realizedTrades,
  basketCorrelations,
  factorExposures,
  hedgeRecommendations,
  tradeSignals,
  stressScenarios,
  optimalAllocation,
  basketRiskMetrics,
  explorerRiskMetrics
} from './data/mockData';

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:wght@400;600&family=Quicksand:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;transition:all 200ms ease}
html{height:100%;background:#FFFEF9}
body{font-family:'Quicksand',sans-serif;background:#FFFEF9;color:#333334;margin:0;padding:0;width:100%;height:100%;overflow:hidden}
#root{position:fixed;top:0;left:0;right:0;bottom:0;overflow:hidden;display:flex}
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#C4883066;border-radius:3px}::-webkit-scrollbar-track{background:transparent}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes popIn{0%{opacity:0;transform:scale(0.9)}70%{transform:scale(1.03)}100%{opacity:1;transform:scale(1)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-5deg)}75%{transform:rotate(5deg)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes slideRight{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
@keyframes blink{0%,100%{box-shadow:0 0 0 0 rgba(76,175,80,0.4)}50%{box-shadow:0 0 0 8px rgba(76,175,80,0)}}
@keyframes alertProgress{0%{width:0%}100%{width:100%}}
@keyframes eggWobble{0%,100%{transform:rotate(0)}20%{transform:rotate(-8deg)}40%{transform:rotate(6deg)}60%{transform:rotate(-4deg)}80%{transform:rotate(2deg)}}
@keyframes eggGlow{0%,100%{filter:drop-shadow(0 2px 8px rgba(180,130,20,.35)) drop-shadow(0 0 0 rgba(255,215,0,0))}50%{filter:drop-shadow(0 4px 14px rgba(180,130,20,.5)) drop-shadow(0 0 10px rgba(255,223,107,.25))}}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes slideDown{from{transform:translateY(0)}to{transform:translateY(100%)}}
@keyframes eggFlipOpen{0%{transform:perspective(400px) rotateY(0deg) scale(1)}50%{transform:perspective(400px) rotateY(90deg) scale(.9)}100%{transform:perspective(400px) rotateY(180deg) scale(.75)}}
@keyframes eggFlipClose{0%{transform:perspective(400px) rotateY(180deg) scale(.75)}50%{transform:perspective(400px) rotateY(90deg) scale(.9)}100%{transform:perspective(400px) rotateY(0deg) scale(1)}}
@keyframes rayBurst{from{opacity:0;transform:translate(var(--rx),var(--ry)) scale(.3)}to{opacity:1;transform:translate(var(--tx),var(--ty)) scale(1)}}
@keyframes rayFade{from{opacity:1;transform:translate(var(--tx),var(--ty)) scale(1)}to{opacity:0;transform:translate(var(--tx),var(--ty)) scale(.8)}}
@keyframes shimmer{0%,100%{opacity:.15}50%{opacity:.35}}
@keyframes basketBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes cartPop{0%{transform:scale(1)}50%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes freshGlow{0%,100%{box-shadow:0 0 0 0 rgba(76,175,80,0.15)}50%{box-shadow:0 0 20px 4px rgba(76,175,80,0.1)}}
.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
.mobile-scroll-x{overflow-x:auto;-webkit-overflow-scrolling:touch}
.mobile-scroll-x::-webkit-scrollbar{display:none}
.mobile-scroll-x{-ms-overflow-style:none;scrollbar-width:none}
html,body{overflow-x:hidden;-webkit-tap-highlight-color:transparent}
button,input,select,textarea{-webkit-appearance:none}
img{max-width:100%;height:auto}
.web-header{height:52px;min-height:52px;background:#fff;border-bottom:1px solid #F0E6D0;display:flex;align-items:center;padding:0 16px 0 20px;z-index:100;flex-shrink:0}
.web-header-brand{display:flex;align-items:center;gap:8px;cursor:pointer;user-select:none}
.web-header-nav{display:flex;align-items:center;gap:2px;margin-left:auto}
.web-header-item{display:flex;align-items:center;gap:6px;padding:7px 14px;cursor:pointer;border-radius:8px;font-family:'Quicksand',sans-serif;font-weight:700;font-size:13px;color:#A09080;transition:all .15s;border:none;background:none;white-space:nowrap}
.web-header-item:hover{background:#FFF8EE;color:#8B6914}
.web-header-item.active{background:#FFF8EE;color:#C48830;font-weight:800}
.web-header-search{display:flex;align-items:center;gap:6px;background:#FFFDF5;border:1px solid #F0E6D0;border-radius:8px;padding:5px 12px;transition:all .2s;min-width:220px;flex:1}
.web-header-search:focus-within{border-color:#C48830;background:#fff;box-shadow:0 0 0 2px #C4883018}
.web-header-search input{border:none;outline:none;background:transparent;font-family:'Quicksand',sans-serif;font-size:12px;font-weight:600;color:#333;width:100%}
.web-header-search input::placeholder{color:#C8B898}
.web-body{display:flex;flex:1;overflow:hidden}
.web-sidebar{width:52px;min-width:52px;background:#fff;border-right:1px solid #F0E6D0;display:flex;flex-direction:column;padding:8px 0;overflow-y:auto;overflow-x:hidden;flex-shrink:0;transition:width .2s ease,min-width .2s ease}
.web-sidebar:hover{width:200px;min-width:200px}
.web-sidebar-section{padding:12px 16px 6px;font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#C8B898;white-space:nowrap;overflow:hidden;opacity:0;height:0;padding:0;margin:0;transition:all .2s ease}
.web-sidebar:hover .web-sidebar-section{opacity:1;height:auto;padding:12px 16px 6px}
.web-sidebar-item{display:flex;align-items:center;gap:10px;padding:9px 0;justify-content:center;cursor:pointer;transition:all .15s;border-left:3px solid transparent;font-family:'Quicksand',sans-serif;font-weight:700;font-size:13px;color:#A09080;white-space:nowrap;overflow:hidden}
.web-sidebar:hover .web-sidebar-item{padding:9px 20px;justify-content:flex-start}
.web-sidebar-item:hover{background:#FFFDF5;color:#8B6914}
.web-sidebar-item.active{background:#FFF8EE;color:#C48830;border-left-color:#C48830;font-weight:800}
.web-sidebar-item span{display:none}
.web-sidebar:hover .web-sidebar-item span{display:inline}
.web-right-sidebar{width:280px;min-width:280px;background:#FFFDF5;border-left:1px solid #F0E6D0;display:flex;flex-direction:column;overflow-y:auto;flex-shrink:0}
.web-right-section{padding:14px 16px;border-bottom:1px solid #F0E6D0}
.web-right-section:last-child{border-bottom:none;flex:1}
.web-right-title{font-size:11px;font-weight:800;letter-spacing:1.2px;color:#C8B898;margin-bottom:10px;font-family:'Quicksand',sans-serif}
.web-content{flex:1;overflow-y:auto;overflow-x:hidden;position:relative}
.web-content-inner{max-width:1200px;margin:0 auto;padding:24px 32px}
.explorer-card-grid{grid-template-columns:repeat(3,1fr)!important}
@media(max-width:1100px){
  .explorer-card-grid{grid-template-columns:1fr 1fr!important}
  .web-right-sidebar{width:240px;min-width:240px}
}
@media(max-width:900px){
  .web-sidebar{width:44px;min-width:44px}
  .web-sidebar:hover{width:180px;min-width:180px}
  .web-content-inner{padding:20px 24px}
  .web-right-sidebar{width:220px;min-width:220px}
}
@media(max-width:768px){
  .web-sidebar{display:none}
  .web-right-sidebar{display:none}
  .web-content-inner{padding:16px}
  .calendar-detail-grid{grid-template-columns:1fr!important}
  .calendar-sidebar{display:none!important}
}
@media(max-width:480px){
  .explorer-card-grid{grid-template-columns:1fr!important}
  .holdings-grid{grid-template-columns:1fr 1fr!important}
  .basket-metrics-grid{grid-template-columns:1fr 1fr!important}
  .trading-table-header,.trading-table-row{grid-template-columns:auto 1fr 48px 32px 34px 44px!important}
  .controls-row{flex-direction:column!important;align-items:stretch!important}
  .controls-row>div{justify-content:center!important}
}
`;

const CL = {
  sky: { a: "#2b5e49", l: "#f5f5f3" }, golden: { a: "#8b7355", l: "#faf9f7" },
  sage: { a: "#2b5e49", l: "#f5f5f3" }, plum: { a: "#5a4a3a", l: "#f8f7f5" },
  coral: { a: "#9b6b4b", l: "#faf8f6" }, terracotta: { a: "#7a5a3a", l: "#f9f8f6" },
};
const fmt = (n) => "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0 });
const fmtS = (n) => (n >= 0 ? "+" : "-") + fmt(Math.abs(n));
const fmtD = (n) => "$" + n.toFixed(2);
const pct = (n) => (n >= 0 ? "+" : "") + n.toFixed(2) + "%";

// ── Macro Dashboard Data (used by both MacroDashboardPage and IndicatorDetailPage) ──
// Helper to generate quarterly date labels going back N years from Feb '26
const _qDates = (years) => { const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; const out = []; for (let y = 2026 - years; y <= 2026; y++) for (let q = 0; q < 4; q++) { if (y === 2026 && q > 0) break; out.push(`${m[q*3]} '${String(y).slice(2)}`); } return out; };
const _mDates = (months) => { const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; const out = []; let y = 2026, mo = 1; for (let i = 0; i < months; i++) { const idx = months - 1 - i; const tm = mo - idx; const ty = y + Math.floor((tm < 0 ? tm - 11 : tm) / 12); const rm = ((tm % 12) + 12) % 12; out.push(`${m[rm]} '${String(ty).slice(2)}`); } return out; };

const macroDashboardData = [
  { id: "bls-cpi", name: "CPI (YoY)", value: 3.4, prev: 3.1, unit: "%", signal: "bearish", release: "Feb 11", freq: "Monthly", source: "BLS", weight: 0.2,
    periods: {
      "1Y": { dates: _mDates(12), data: [3.2,3.4,3.1,2.9,3.0,3.1,3.2,3.0,3.1,3.2,3.4,3.4] },
      "2Y": { dates: _mDates(24), data: [6.4,6.0,5.0,4.9,4.0,3.7,3.2,3.1,3.2,3.4,3.1,2.9,3.2,3.4,3.1,2.9,3.0,3.1,3.2,3.0,3.1,3.2,3.4,3.4] },
      "5Y": { dates: _qDates(5), data: [2.3,2.6,1.4,1.2,1.4,5.4,5.3,6.2,7.0,8.5,9.1,8.3,7.1,6.5,6.0,5.0,4.0,3.2,3.1,3.0,3.4] },
      "10Y": { dates: _qDates(10), data: [0.8,0.1,-0.1,0.2,0.7,1.0,1.3,1.6,2.1,2.1,2.3,2.4,2.9,2.4,1.5,1.8,2.3,2.6,1.4,1.2,1.4,5.4,5.3,6.2,7.0,8.5,9.1,8.3,7.1,6.5,6.0,5.0,4.0,3.2,3.1,3.0,3.2,3.0,3.1,3.2,3.4] },
    }},
  { id: "bls-corecpi", name: "Core CPI (YoY)", value: 3.9, prev: 3.9, unit: "%", signal: "bearish", release: "Feb 11", freq: "Monthly", source: "BLS", weight: 0.15,
    periods: {
      "1Y": { dates: _mDates(12), data: [3.9,4.0,3.9,3.7,3.6,3.6,3.7,3.8,3.8,3.9,3.9,3.9] },
      "2Y": { dates: _mDates(24), data: [5.5,5.3,5.1,4.8,4.5,4.3,4.1,4.0,3.9,4.0,3.9,3.7,3.9,4.0,3.9,3.7,3.6,3.6,3.7,3.8,3.8,3.9,3.9,3.9] },
      "5Y": { dates: _qDates(5), data: [2.3,1.6,1.3,1.4,3.0,4.5,4.0,6.0,6.6,6.3,5.9,5.5,5.1,4.8,4.3,3.9,3.7,3.6,3.8,3.9,3.9] },
      "10Y": { dates: _qDates(10), data: [1.6,1.8,2.0,2.2,2.1,2.2,2.1,2.2,2.3,2.4,2.2,2.3,2.2,1.9,1.7,1.7,2.3,1.6,1.3,1.4,3.0,4.5,4.0,6.0,6.6,6.3,5.9,5.5,5.1,4.8,4.3,3.9,3.7,3.6,3.8,3.8,3.7,3.8,3.9,3.9,3.9] },
    }},
  { id: "bls-nfp", name: "Nonfarm Payrolls", value: 353, prev: 333, unit: "K", signal: "bullish", release: "Feb 7", freq: "Monthly", source: "BLS", weight: 0.15,
    periods: {
      "1Y": { dates: _mDates(12), data: [216,150,256,216,150,232,165,199,333,353,353,353] },
      "2Y": { dates: _mDates(24), data: [472,326,165,281,339,209,236,187,105,150,216,150,216,150,256,216,150,232,165,199,333,353,353,353] },
      "5Y": { dates: _qDates(5), data: [225,1500,916,-306,-140,559,379,714,431,368,517,390,261,236,165,187,216,150,232,199,353] },
      "10Y": { dates: _qDates(10), data: [192,245,230,184,151,224,261,199,231,176,266,208,223,148,196,127,225,1500,916,-306,-140,559,379,714,431,368,517,390,261,236,165,187,216,150,232,199,165,199,333,353,353] },
    }},
  { id: "bls-urate", name: "Unemployment Rate", value: 3.7, prev: 3.7, unit: "%", signal: "neutral", release: "Feb 7", freq: "Monthly", source: "BLS", weight: 0.1,
    periods: {
      "1Y": { dates: _mDates(12), data: [3.6,3.7,3.8,3.7,3.6,3.7,3.7,3.7,3.7,3.7,3.7,3.7] },
      "2Y": { dates: _mDates(24), data: [3.4,3.5,3.4,3.6,3.6,3.5,3.8,3.8,3.7,3.9,3.7,3.6,3.6,3.7,3.8,3.7,3.6,3.7,3.7,3.7,3.7,3.7,3.7,3.7] },
      "5Y": { dates: _qDates(5), data: [3.5,3.5,14.7,11.1,6.7,6.3,6.0,5.4,4.8,3.9,3.6,3.5,3.4,3.5,3.6,3.8,3.7,3.7,3.6,3.7,3.7] },
      "10Y": { dates: _qDates(10), data: [5.7,5.5,5.3,5.0,5.0,4.9,4.7,4.6,4.4,4.1,4.0,3.9,3.8,3.7,3.9,3.6,3.5,3.5,14.7,11.1,6.7,6.3,6.0,5.4,4.8,3.9,3.6,3.5,3.4,3.5,3.6,3.8,3.7,3.7,3.6,3.7,3.7,3.7,3.7,3.7,3.7] },
    }},
  { id: "fred-m2", name: "Net Liquidity (M2)", value: 21.2, prev: 21.0, unit: "T", signal: "neutral", release: "Jan 28", freq: "Monthly", source: "FRED", weight: 0.1,
    periods: {
      "1Y": { dates: _mDates(12), data: [20.9,20.9,21.0,21.0,21.0,21.0,21.0,21.0,21.0,21.0,21.2,21.2] },
      "2Y": { dates: _mDates(24), data: [21.5,21.3,21.1,20.9,20.8,20.7,20.6,20.7,20.8,20.8,20.9,20.9,20.9,20.9,21.0,21.0,21.0,21.0,21.0,21.0,21.0,21.0,21.2,21.2] },
      "5Y": { dates: _qDates(5), data: [15.4,16.2,18.4,19.1,19.4,20.6,21.0,21.6,21.7,21.5,21.3,21.1,20.8,20.6,20.7,20.8,20.9,21.0,21.0,21.0,21.2] },
      "10Y": { dates: _qDates(10), data: [11.5,11.7,11.9,12.1,12.3,12.6,12.9,13.1,13.3,13.6,13.8,14.0,14.2,14.4,14.6,14.8,15.4,16.2,18.4,19.1,19.4,20.6,21.0,21.6,21.7,21.5,21.3,21.1,20.8,20.6,20.7,20.8,20.9,21.0,21.0,21.0,21.0,21.0,21.0,21.2,21.2] },
    }},
  { id: "fred-10y", name: "10Y Treasury Yield", value: 4.52, prev: 4.38, unit: "%", signal: "bearish", release: "Daily", freq: "Daily", source: "FRED", weight: 0.2,
    periods: {
      "1Y": { dates: _mDates(12), data: [4.25,4.10,3.95,4.15,4.25,4.38,4.52,4.62,4.25,4.10,4.38,4.52] },
      "2Y": { dates: _mDates(24), data: [3.45,3.70,3.80,3.95,4.05,4.28,4.57,4.88,4.73,4.62,4.25,4.10,4.25,4.10,3.95,4.15,4.25,4.38,4.52,4.62,4.25,4.10,4.38,4.52] },
      "5Y": { dates: _qDates(5), data: [1.92,0.66,0.70,0.93,1.74,1.52,1.63,1.51,2.32,2.98,3.83,4.25,3.88,4.57,4.88,4.73,4.25,3.95,4.15,4.38,4.52] },
      "10Y": { dates: _qDates(10), data: [2.17,1.73,2.14,2.27,2.40,2.33,2.35,1.79,2.68,2.86,3.05,3.23,2.69,2.01,1.92,1.88,1.92,0.66,0.70,0.93,1.74,1.52,1.63,1.51,2.32,2.98,3.83,4.25,3.88,4.57,4.88,4.73,4.25,3.95,4.15,4.25,4.10,4.15,4.25,4.38,4.52] },
    }},
];

// ── Indicator Detail Enrichment ──
const INDICATOR_DETAILS = {
  "bls-cpi": { fullName: "Consumer Price Index (Year-over-Year)", desc: "Tracks changes in consumer prices. Persistent high CPI pressures the Fed to maintain higher rates, hurting growth assets.", impactAssets: ["TLT", "GLD", "SPY"], keyLevels: { hot: 3.5, target: 2.0 }, related: ["bls-corecpi", "fred-10y", "bls-urate"], category: "Inflation", icon: "fire" },
  "bls-corecpi": { fullName: "Core CPI excl. Food & Energy (YoY)", desc: "Strips volatile food and energy prices. The Fed's preferred inflation gauge for policy decisions. Sticky readings signal persistent inflation.", impactAssets: ["TLT", "SPY", "IEF"], keyLevels: { hot: 4.0, target: 2.0 }, related: ["bls-cpi", "fred-10y", "bls-urate"], category: "Inflation", icon: "fire" },
  "bls-nfp": { fullName: "U.S. Nonfarm Payrolls (Monthly Change)", desc: "Number of jobs added/lost excluding farms. Strong readings signal economic resilience but may delay Fed cuts. Weak prints trigger risk-off.", impactAssets: ["SPY", "IWM", "TLT"], keyLevels: { strong: 300, moderate: 150, weak: 50 }, related: ["bls-urate", "bls-cpi", "fred-10y"], category: "Labor", icon: "chart-up" },
  "bls-urate": { fullName: "U.S. Unemployment Rate (U-3)", desc: "Percentage of labor force without jobs. Rising unemployment signals economic slowdown and potential Fed rate cuts.", impactAssets: ["SPY", "IWM", "XLU"], keyLevels: { full: 4.0, rising: 5.0 }, related: ["bls-nfp", "bls-cpi", "fred-m2"], category: "Labor", icon: "person" },
  "fred-m2": { fullName: "M2 Money Supply (Trillions USD)", desc: "Broad measure of money supply including cash, deposits, and money market funds. Expanding M2 fuels asset prices; contracting M2 tightens liquidity.", impactAssets: ["SPY", "BTC-USD", "GLD"], keyLevels: { expansion: 21.5, neutral: 21.0 }, related: ["bls-cpi", "fred-10y", "bls-urate"], category: "Liquidity", icon: "dollar" },
  "fred-10y": { fullName: "U.S. 10-Year Treasury Yield", desc: "Benchmark risk-free rate. Rising yields pressure equities (higher discount rate) and signal inflation expectations.", impactAssets: ["TLT", "IEF", "VNQ", "XLU"], keyLevels: { high: 5.0, elevated: 4.0, normal: 3.0 }, related: ["bls-cpi", "bls-corecpi", "fred-m2"], category: "Bonds", icon: "chart-bar" },
};

const INDICATOR_NEWS_MAP = {
  "bls-cpi": { cats: ["MACRO", "RATES"], keywords: ["CPI", "inflation", "price", "consumer"] },
  "bls-corecpi": { cats: ["MACRO", "RATES"], keywords: ["CPI", "core", "inflation", "price"] },
  "bls-nfp": { cats: ["MACRO"], keywords: ["job", "labor", "employment", "payroll", "claims", "nonfarm"] },
  "bls-urate": { cats: ["MACRO"], keywords: ["unemployment", "labor", "job", "claims"] },
  "fred-m2": { cats: ["MACRO", "RATES"], keywords: ["M2", "liquidity", "money supply", "Fed"] },
  "fred-10y": { cats: ["BONDS", "RATES"], keywords: ["yield", "treasury", "bond", "10Y", "duration"] },
};

function analyzeHistory(history) {
  const n = history.length;
  if (n < 5) return { patterns: [], trendDirection: "flat", ma5: 0, ma10: 0, maSignal: "neutral", support: 0, resistance: 0, volatility: 0, roc5: 0, streak: 0, min: 0, max: 0, range: 0, percentile: 0, avgChange: 0, trendStrength: 0, slope: 0 };
  const xMean = (n - 1) / 2;
  const yMean = history.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  history.forEach((y, x) => { num += (x - xMean) * (y - yMean); den += (x - xMean) ** 2; });
  const slope = num / den;
  const trendStrength = Math.abs(slope) / (yMean || 1);
  const trendDirection = slope > 0.005 ? "rising" : slope < -0.005 ? "falling" : "flat";
  const diffs = [];
  for (let i = 1; i < n; i++) diffs.push(history[i] - history[i - 1]);
  const volatility = Math.sqrt(diffs.reduce((s, d) => s + d * d, 0) / diffs.length);
  const avgChange = diffs.reduce((s, d) => s + Math.abs(d), 0) / diffs.length;
  const sorted = [...history].sort((a, b) => a - b);
  const support = sorted[Math.floor(n * 0.1)];
  const resistance = sorted[Math.floor(n * 0.9)];
  const current = history[n - 1];
  const posInRange = (resistance - support) ? (current - support) / (resistance - support) : 0.5;
  const ma5 = history.slice(-5).reduce((a, b) => a + b, 0) / 5;
  const ma10 = history.slice(-Math.min(10, n)).reduce((a, b) => a + b, 0) / Math.min(10, n);
  const maSignal = ma5 > ma10 + 0.01 ? "bullish" : ma5 < ma10 - 0.01 ? "bearish" : "neutral";
  const roc5 = n >= 6 ? ((current - history[n - 6]) / (history[n - 6] || 1)) * 100 : 0;
  let streak = 0;
  for (let i = n - 1; i > 0; i--) {
    if (history[i] > history[i - 1]) { if (streak >= 0) streak++; else break; }
    else if (history[i] < history[i - 1]) { if (streak <= 0) streak--; else break; }
    else break;
  }
  const patterns = [];
  if (Math.abs(streak) >= 3) patterns.push({ label: streak > 0 ? "Sustained Uptrend" : "Sustained Downtrend", type: streak > 0 ? "bullish" : "bearish" });
  if (posInRange < 0.2) patterns.push({ label: "Near Support Level", type: "bullish" });
  if (posInRange > 0.8) patterns.push({ label: "Near Resistance Level", type: "bearish" });
  if (trendStrength > 0.015) patterns.push({ label: "Strong Directional Move", type: "neutral" });
  if (volatility > avgChange * 1.5) patterns.push({ label: "Elevated Volatility", type: "bearish" });
  if (current >= Math.max(...history)) patterns.push({ label: "At Period High", type: "neutral" });
  if (current <= Math.min(...history)) patterns.push({ label: "At Period Low", type: "neutral" });
  if (maSignal === "bullish") patterns.push({ label: "MA Bullish Cross", type: "bullish" });
  if (maSignal === "bearish") patterns.push({ label: "MA Bearish Cross", type: "bearish" });
  if (Math.abs(roc5) > 5) patterns.push({ label: roc5 > 0 ? "Strong Momentum Up" : "Strong Momentum Down", type: roc5 > 0 ? "bullish" : "bearish" });
  return { slope, trendDirection, trendStrength, volatility, avgChange, support, resistance, ma5, ma10, maSignal, roc5, streak, patterns, min: Math.min(...history), max: Math.max(...history), range: Math.max(...history) - Math.min(...history), percentile: Math.round(posInRange * 100) };
}

// Stock logo component
const StockLogo = ({ ticker, size = 20 }) => (
  <img
    src={`https://financialmodelingprep.com/image-stock/${ticker}.png`}
    alt={ticker}
    style={{
      width: size,
      height: size,
      borderRadius: '4px',
      objectFit: 'cover',
      background: '#fff',
      border: '1px solid #33333420'
    }}
    onError={(e) => {
      e.target.style.display = 'none';
    }}
  />
);

function getBasketHealth(b) {
  if (b.totalPL < -1000) return { status: "critical", label: "Underperforming", icon: "warning", clr: "#EF5350", bg: "#FFEBEE", tip: "Significantly below cost basis — consider rebalancing or cutting losses." };
  if (b.totalPL < 0) return { status: "warning", label: "Below Cost", icon: "warning", clr: "#FFA726", bg: "#FFF3E0", tip: "Below cost basis — monitor closely for recovery signals." };
  if (b.change < -2) return { status: "warning", label: "Down Today", icon: "warning", clr: "#FFA726", bg: "#FFF3E0", tip: "Sharp drop today — watch for continued weakness." };
  if (b.change > 4) return { status: "hot", label: "Strong Rally", icon: "fire", clr: "#C48830", bg: "#FFF8EE", tip: "Hot streak — consider locking in partial profits." };
  if (b.change > 0 && b.totalPL > 2000) return { status: "great", label: "Outperforming", icon: "rocket", clr: "#C48830", bg: "#FFF8EE", tip: "Strong performance — Hatch is firing on all cylinders." };
  if (b.change > 0 && b.totalPL > 0) return { status: "good", label: "On Track", icon: "check-circle", clr: "#C48830", bg: "#FFF8EE", tip: "Performing well — holding steady gains." };
  return { status: "neutral", label: "Stable", icon: "minus-circle", clr: "#A09080", bg: "#fff", tip: "Holding steady — no major signals." };
}

// ═══════════════════════════ DATA ═══════════════════════════
// Note: Main data imported from ./data/mockData.js
// Keeping only app-specific data below

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

const stockYoYReturns = {
  XOM: 12.4, CVX: 8.2, GLD: 18.6, "BRK.B": 22.1, COST: 28.4,
  O: -2.8, AMT: 4.6, XLU: 6.2, TLT: -8.4, PLD: 3.1,
  JNJ: 2.8, PG: 8.4, WMT: 14.2, KO: 4.6, MCD: 9.8,
  NVDA: 142.6, AMD: 48.2, AVGO: 68.4, MSFT: 32.8, AMZN: 38.6,
  LMT: 18.4, RTX: 14.2, GD: 22.6, NOC: 16.8,
  TQQQ: 52.4, SPXL: 34.2, ARKK: -18.6, TSLA: 62.8, COIN: 88.4,
  AAPL: 24.2, GOOGL: 28.6, PEP: 3.2, MMM: 12.8,
  ENPH: -32.4, SEDG: -48.6, FSLR: 22.8, RUN: -28.4, PLUG: -54.2,
  PLTR: 124.8, PATH: -12.4, ISRG: 34.6,
  UNH: 8.4, LLY: 42.6, ABBV: 14.2, MRK: 6.8, TMO: 12.4,
};

function getRegimeRelevance(basket, regime) {
  const map = {
    reflation: { inflation: 95, rates_down: 30, recession: 20, tech_boom: 50, geopolitical: 60, bull: 55 },
    goldilocks: { inflation: 30, rates_down: 50, recession: 10, tech_boom: 90, geopolitical: 20, bull: 85 },
    stagflation: { inflation: 90, rates_down: 15, recession: 70, tech_boom: 15, geopolitical: 80, bull: 10 },
    riskoff: { inflation: 40, rates_down: 60, recession: 95, tech_boom: 10, geopolitical: 85, bull: 5 },
  };
  const regimeKey = Object.keys(regimes).find(k => regimes[k].name === regime.name) || "goldilocks";
  return (map[regimeKey] && map[regimeKey][basket.scenario]) || 40;
}

// ═══════════════════════════ SHARED COMPONENTS ═══════════════════════════

function MiniChart({ data, color, chartId, onHover }) {
  const ref = useRef(null);
  const [tip, setTip] = useState(null);
  const W = 640, H = 170, PX = 42, PY = 18;
  const vals = data.map(d => d.v);
  const mn = Math.min(...vals) * 0.95, mx = Math.max(...vals) * 1.02;
  const step = (W - PX * 2) / (data.length - 1);
  const pts = data.map((d, i) => ({ x: PX + i * step, y: PY + (1 - (d.v - mn) / (mx - mn)) * (H - PY * 2), l: d.d, v: d.v }));
  const line = pts.map((p, i) => { if (!i) return "M" + p.x + "," + p.y; const pr = pts[i - 1]; return "C" + (pr.x + step * .4) + "," + pr.y + " " + (p.x - step * .4) + "," + p.y + " " + p.x + "," + p.y; }).join(" ");
  const area = line + " L" + pts[pts.length - 1].x + "," + (H - PY) + " L" + pts[0].x + "," + (H - PY) + " Z";
  const handleMove = (clientX) => {
    const r = ref.current.getBoundingClientRect();
    const mx2 = ((clientX - r.left) / r.width) * W;
    let cl = pts[0], md = Infinity;
    pts.forEach(p => { const d = Math.abs(p.x - mx2); if (d < md) { md = d; cl = p; } });
    setTip(cl);
    if (onHover) onHover(cl);
  };
  const handleLeave = () => { setTip(null); if (onHover) onHover(null); };
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: W }}>
      <svg ref={ref} viewBox={"0 0 " + W + " " + H} style={{ width: "100%", height: "auto" }}
        onMouseMove={e => handleMove(e.clientX)}
        onTouchMove={e => { if (e.touches[0]) handleMove(e.touches[0].clientX); }}
        onMouseLeave={handleLeave}
        onTouchEnd={handleLeave}>
        <defs><linearGradient id={"g_" + chartId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.15" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
        {[0, .25, .5, .75, 1].map((p, i) => { const yy = PY + p * (H - PY * 2); const val = mx - p * (mx - mn); const label = val >= 1000 ? "$" + (val / 1000).toFixed(1) + "k" : "$" + val.toFixed(val < 10 ? 2 : 0); return <g key={i}><line x1={PX} y1={yy} x2={W - PX} y2={yy} stroke="#F0E6D0" strokeWidth=".8" /><text x={PX - 6} y={yy + 4} textAnchor="end" fill="#A09080" fontSize="9" fontFamily="JetBrains Mono">{label}</text></g>; })}
        <path d={area} fill={"url(#g_" + chartId + ")"} /><path d={line} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill="#fff" stroke={color} strokeWidth="2" />)}
        {pts.map((p, i) => <text key={"t" + i} x={p.x} y={H - 1} textAnchor="middle" fill="#A09080" fontSize="9" fontFamily="Quicksand" fontWeight="600">{p.l}</text>)}
        {tip && <g><line x1={tip.x} y1={PY} x2={tip.x} y2={H - PY} stroke={color} strokeWidth="1" strokeDasharray="4,4" opacity=".4" /><circle cx={tip.x} cy={tip.y} r="6" fill={color} stroke="#fff" strokeWidth="3" /></g>}
      </svg>
      {tip && <div style={{ position: "absolute", top: 6, right: 6, background: "#fff", borderRadius: 12, padding: "6px 12px", fontFamily: "JetBrains Mono", fontSize: 18 }}><span style={{ color: "#33333480" }}>{tip.l}</span><span style={{ marginLeft: 8, color, fontWeight: 700 }}>{fmt(tip.v)}</span></div>}
    </div>
  );
}

function StatCard({ label, value, sub, icon, color = "terracotta", delay = 0 }) {
  const c = CL[color] || CL.terracotta;
  return (
    <div style={{ background: c.l, border: "1.5px solid transparent", borderRadius: 12, padding: "8px 10px", animation: "fadeUp .5s ease " + delay + "s both", flex: "1 1 80px", minWidth: 80, transition: "all .3s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = c.a; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, color: "#33333480", textTransform: "uppercase", letterSpacing: .8, marginBottom: 2, fontWeight: 700 }}>{label}</div>
        <Icon name={icon} size={11} color={c.a} />
      </div>
      <div style={{ fontSize: 17, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: c.a }}>{value}</div>
      {sub && <div style={{ fontSize: 14, color: "#8A7040", marginTop: 1, fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

// ═══════════════════════════ CALENDAR PAGE ═══════════════════════════

function CalendarPage({ onNavigate }) {
  const [viewMonth, setViewMonth] = useState(1); // 0=Feb, 1=Mar (offset from Feb 2026)
  const [selectedDate, setSelectedDate] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" | "list"

  const months = [{ year: 2026, month: 1, label: "February 2026" }, { year: 2026, month: 2, label: "March 2026" }];
  const cur = months[viewMonth];

  // Calendar grid
  const firstDay = new Date(cur.year, cur.month, 1).getDay();
  const daysInMonth = new Date(cur.year, cur.month + 1, 0).getDate();
  const todayStr = "2026-02-06";

  const getDateStr = (day) => {
    const m = String(cur.month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return cur.year + "-" + m + "-" + d;
  };

  const getEventsForDate = (dateStr) => calendarEvents.filter(e => e.date === dateStr);

  const filteredEvents = calendarEvents.filter(e => {
    const d = new Date(e.date);
    const inMonth = d.getMonth() === cur.month && d.getFullYear() === cur.year;
    const matchType = typeFilter === "all" || e.type === typeFilter;
    return inMonth && matchType;
  }).sort((a, b) => a.date.localeCompare(b.date));

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Impact colors
  const impactColor = { high: "#EF5350", medium: "#FFA726", low: "#C48830" };
  const impactBg = { high: "#FFEBEE", medium: "#FFF3E0", low: "#FFF8EE" };

  // Upcoming from today
  const upcoming = calendarEvents.filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);

  // Count stats
  const monthEarnings = calendarEvents.filter(e => { const d = new Date(e.date); return d.getMonth() === cur.month && e.type === "earnings"; }).length;
  const monthEvents = calendarEvents.filter(e => { const d = new Date(e.date); return d.getMonth() === cur.month && e.type === "event"; }).length;
  const highImpact = calendarEvents.filter(e => { const d = new Date(e.date); return d.getMonth() === cur.month && e.impact === "high"; }).length;

  return (
    <div>
      <div style={{ marginBottom: 10, animation: "fadeUp .3s ease both" }}>
        <h1 style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>Earnings & Events Calendar</h1>
        <p style={{ color: "#33333480", fontSize: 17, marginTop: 4 }}>S&P 500 earnings, macro events & company catalysts — plan your strategy ahead</p>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10, flexWrap: "wrap", animation: "fadeUp .4s ease both" }}>
        <StatCard label="Earnings" value={monthEarnings} icon="clipboard" color="sky" />
        <StatCard label="Events" value={monthEvents} icon="pin" color="golden" />
        <StatCard label="High Impact" value={highImpact} icon="circle-red" color="coral" />
        <StatCard label="This Week" value={upcoming.filter(e => e.date <= "2026-02-13").length} icon="bolt" color="plum" />
      </div>

      {/* Controls */}
      <div className="controls-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6, animation: "fadeUp .4s ease .1s both" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setViewMonth(Math.max(0, viewMonth - 1))} disabled={viewMonth === 0}
            style={{ width: 36, height: 36, borderRadius: 12, border: "1px solid #33333440", background: "#fff", cursor: viewMonth === 0 ? "default" : "pointer", fontSize: 18, opacity: viewMonth === 0 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
          <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif", minWidth: 0, textAlign: "center", flex: "1" }}>{cur.label}</div>
          <button onClick={() => setViewMonth(Math.min(months.length - 1, viewMonth + 1))} disabled={viewMonth === months.length - 1}
            style={{ width: 36, height: 36, borderRadius: 12, border: "1px solid #33333440", background: "#fff", cursor: viewMonth === months.length - 1 ? "default" : "pointer", fontSize: 18, opacity: viewMonth === months.length - 1 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>→</button>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[{ k: "all", l: "All" }, { k: "earnings", l: "Earnings" }, { k: "event", l: "Events" }].map(f => (
            <button key={f.k} onClick={() => setTypeFilter(f.k)} style={{ padding: "7px 14px", borderRadius: 12, border: "1.5px solid " + (typeFilter === f.k ? "#C48830" : "#F0E6D0"), background: typeFilter === f.k ? "#FFF8EE" : "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "Quicksand", color: typeFilter === f.k ? "#C48830" : "#A09080" }}>{f.l}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 3, background: "#fff", borderRadius: 10, padding: 3 }}>
          {["calendar", "list"].map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: viewMode === m ? "#fff" : "transparent", fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "Quicksand", color: viewMode === m ? "#5C4A1E" : "#A09080" }}>{m === "calendar" ? "Grid" : "List"}</button>
          ))}
        </div>
      </div>

      <div className="calendar-detail-grid" style={{ display: "grid", gridTemplateColumns: selectedDate ? "1fr 360px" : "1fr", gap: 8, animation: "fadeUp .5s ease .15s both" }}>
        {/* Calendar / List View */}
        <div>
          {viewMode === "calendar" && (
            <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden" }}>
              {/* Day headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "2px solid #F0E6D0", background: "#fff" }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                  <div key={d} style={{ padding: "10px 0", textAlign: "center", fontSize: 17, fontWeight: 800, color: "#33333480", textTransform: "uppercase", letterSpacing: 1 }}>{d}</div>
                ))}
              </div>
              {/* Day cells */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={"e" + i} style={{ minHeight: 90, borderRight: "1px solid #F0E6D0", borderBottom: "1px solid #33333420" }} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = getDateStr(day);
                  const evts = getEventsForDate(dateStr).filter(e => typeFilter === "all" || e.type === typeFilter);
                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selectedDate;
                  const isWeekend = (firstDay + i) % 7 === 0 || (firstDay + i) % 7 === 6;
                  return (
                    <div key={day} onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                      style={{ minHeight: 90, padding: "6px 8px", borderRight: "1px solid #F0E6D0", borderBottom: "1px solid #33333420", cursor: "pointer", background: isSelected ? "#FFF8EE" : isToday ? "#fff" : isWeekend ? "#FFFDF5" : "#fff", transition: "background .15s", position: "relative" }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#fff"; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isToday ? "#fff" : isWeekend ? "#FFFDF5" : "#fff"; }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: isToday ? 900 : 600, fontFamily: "'Instrument Serif', serif", color: isToday ? "#C48830" : "#5C4A1E", background: isToday ? "#C48830" : "transparent", width: isToday ? 24 : "auto", height: isToday ? 24 : "auto", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", ...(isToday ? { background: "#C48830", color: "#fff", width: 24, height: 24 } : {}) }}>{day}</span>
                        {evts.length > 0 && (
                          <span style={{ fontSize: 14, fontWeight: 800, background: evts.some(e => e.impact === "high") ? "#FFEBEE" : "#FFF3E0", color: evts.some(e => e.impact === "high") ? "#EF5350" : "#FFA726", padding: "1px 6px", borderRadius: 8 }}>{evts.length}</span>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {evts.slice(0, 3).map((ev, j) => (
                          <div key={j} style={{ fontSize: 14, fontWeight: 700, padding: "2px 5px", borderRadius: 6, background: ev.type === "earnings" ? "#E3F2FD" : "#FFF3E0", color: ev.type === "earnings" ? "#42A5F5" : "#FFA726", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                            {ev.type === "earnings" ? "" : (ev.icon || "pin") + " "}{ev.ticker === "MACRO" ? ev.name.slice(0, 12) : ev.ticker}
                          </div>
                        ))}
                        {evts.length > 3 && <div style={{ fontSize: 14, color: "#33333480", fontWeight: 700, paddingLeft: 5 }}>+{evts.length - 3} more</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === "list" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {filteredEvents.map((ev, i) => {
                const dateObj = new Date(ev.date + "T12:00:00");
                const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                const dayNum = dateObj.getDate();
                const isToday = ev.date === todayStr;
                return (
                  <div key={i} onClick={() => setSelectedDate(ev.date)}
                    style={{ display: "flex", gap: 6, background: "#fff", border: "1.5px solid " + (isToday ? "#C48830" : "#F0E6D0"), borderRadius: 18, padding: "14px 18px", cursor: "pointer", transition: "all .2s", animation: "fadeUp .4s ease " + (i * .03) + "s both" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = ev.type === "earnings" ? "#42A5F5" : "#FFA726"; e.currentTarget.style.transform = "translateX(4px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = isToday ? "#C48830" : "#F0E6D0"; e.currentTarget.style.transform = ""; }}>
                    <div style={{ width: 48, textAlign: "center", flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#33333480", textTransform: "uppercase" }}>{dayName}</div>
                      <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: isToday ? "#C48830" : "#5C4A1E" }}>{dayNum}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, padding: "2px 8px", borderRadius: 8, background: ev.type === "earnings" ? "#E3F2FD" : "#FFF3E0", color: ev.type === "earnings" ? "#42A5F5" : "#FFA726", textTransform: "uppercase" }}>{ev.type === "earnings" ? "Earnings" : "Event"}</span>
                        <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 18, color: ev.type === "earnings" ? "#42A5F5" : "#FFA726" }}>{ev.ticker}</span>
                        {ev.time && <span style={{ fontSize: 14, color: "#33333480", fontWeight: 700 }}>{ev.time}</span>}
                        <span style={{ fontSize: 14, fontWeight: 800, padding: "1px 6px", borderRadius: 6, background: impactBg[ev.impact], color: impactColor[ev.impact], marginLeft: "auto" }}>{ev.impact}</span>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 17, fontFamily: "'Instrument Serif', serif" }}>{ev.name}</div>
                      <div style={{ fontSize: 17, color: "#33333480" }}>
                        {ev.type === "earnings" ? ev.quarter + " · Expected " + ev.expected : ev.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedDate && (
          <div className="calendar-sidebar" style={{ animation: "slideRight .3s ease both" }}>
            <div style={{ background: "#fff", borderRadius: 14, padding: 20, position: "sticky", top: 80 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <div>
                  <div style={{ fontSize: 17, color: "#33333480", fontWeight: 700, textTransform: "uppercase" }}>
                    {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" })}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>
                    {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                  </div>
                </div>
                <button onClick={() => setSelectedDate(null)} style={{ width: 32, height: 32, borderRadius: 10, border: "none", background: "#fff", cursor: "pointer", fontSize: 17, color: "#33333480" }}>✕</button>
              </div>

              {selectedEvents.length === 0 && (
                <div style={{ textAlign: "center", padding: "30px 0", color: "#33333480" }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}></div>
                  <div style={{ fontSize: 17, fontWeight: 600 }}>No events on this day</div>
                </div>
              )}

              {selectedEvents.map((ev, i) => (
                <div key={i} style={{ background: ev.type === "earnings" ? "#E3F2FD" : "#FFF3E0", borderRadius: 16, padding: "16px 18px", marginBottom: i < selectedEvents.length - 1 ? 10 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, padding: "2px 8px", borderRadius: 8, background: "#fff", color: ev.type === "earnings" ? "#42A5F5" : "#FFA726", textTransform: "uppercase" }}>{ev.type}</span>
                        <span style={{ fontFamily: "JetBrains Mono", fontWeight: 800, fontSize: 15 }}>{ev.ticker}</span>
                      </div>
                      <div style={{ fontWeight: 900, fontSize: 18, fontFamily: "'Instrument Serif', serif" }}>{ev.name}</div>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, padding: "3px 8px", borderRadius: 8, background: impactBg[ev.impact], color: impactColor[ev.impact] }}>{ev.impact}</span>
                  </div>
                  {ev.type === "earnings" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginTop: 8 }}>
                      <div style={{ background: "#fff", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}><div style={{ fontSize: 12, color: "#33333480", textTransform: "uppercase", fontWeight: 700 }}>Quarter</div><div style={{ fontWeight: 800, fontSize: 15, fontFamily: "'Instrument Serif', serif" }}>{ev.quarter}</div></div>
                      <div style={{ background: "#fff", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}><div style={{ fontSize: 12, color: "#33333480", textTransform: "uppercase", fontWeight: 700 }}>Expected</div><div style={{ fontWeight: 800, fontSize: 15, fontFamily: "JetBrains Mono", color: "#42A5F5" }}>{ev.expected}</div></div>
                      <div style={{ background: "#fff", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}><div style={{ fontSize: 12, color: "#33333480", textTransform: "uppercase", fontWeight: 700 }}>Timing</div><div style={{ fontWeight: 800, fontSize: 15 }}>{ev.time === "BMO" ? "Pre" : "Post"}</div></div>
                    </div>
                  )}
                  {ev.type === "event" && (
                    <div style={{ fontSize: 15, color: "#8A7040", lineHeight: 1.6, marginTop: 4 }}>{ev.desc}</div>
                  )}
                  <div style={{ fontSize: 15, color: "#33333480", marginTop: 8, fontWeight: 600 }}>Sector: {ev.sector}</div>
                  {/* Strategy hint */}
                  <div style={{ background: "#fff", borderRadius: 12, padding: "7px 10px", marginTop: 10 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#C48830", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Strategy Hint</div>
                    <div style={{ fontSize: 18, color: "#8A7040", lineHeight: 1.5 }}>
                      {ev.type === "earnings" && ev.impact === "high" && "High-impact earnings — consider straddles or position sizing before the report. Volatility typically spikes 24h prior."}
                      {ev.type === "earnings" && ev.impact === "medium" && "Monitor for sector-wide signals. This report can move peers in the same Hatch."}
                      {ev.type === "event" && ev.impact === "high" && "Major macro catalyst — review your Hatch exposure. Consider hedging or adding to macro-aligned Hatches."}
                      {ev.type === "event" && ev.impact === "medium" && "Secondary data point. Watch for trend confirmation with other recent readings."}
                      {ev.type === "event" && ev.impact === "low" && "Low direct impact but worth noting for scheduling trades."}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Events Timeline */}
      <div style={{ marginTop: 24, background: "#fff", borderRadius: 14, padding: 12, animation: "fadeUp .5s ease .2s both" }}>
        <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Instrument Serif', serif", marginBottom: 7 }}>Coming Up Next</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 6 }}>
          {upcoming.map((ev, i) => {
            const dateObj = new Date(ev.date + "T12:00:00");
            const label = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
            const isToday = ev.date === todayStr;
            return (
              <div key={i} style={{ display: "flex", gap: 6, padding: "8px 10px", borderRadius: 14, background: isToday ? "#FFF8EE" : "#FFFDF5", border: "1.5px solid " + (isToday ? "#C48830" : "#F0E6D0"), transition: "all .2s", animation: "fadeUp .4s ease " + (i * .04) + "s both" }}>
                <div style={{ width: 4, borderRadius: 2, background: ev.type === "earnings" ? "#42A5F5" : "#FFA726", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: isToday ? "#C48830" : "#A09080" }}>{isToday ? "TODAY" : label}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, padding: "1px 6px", borderRadius: 6, background: impactBg[ev.impact], color: impactColor[ev.impact] }}>{ev.impact}</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15, fontFamily: "'Instrument Serif', serif", marginTop: 2, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    {ev.type === "earnings" ? "" : (ev.icon || "pin") + " "}{ev.name}
                  </div>
                  <div style={{ fontSize: 15, color: "#33333480", marginTop: 1 }}>
                    {ev.type === "earnings" ? ev.ticker + " · " + ev.quarter + " · " + ev.expected : ev.ticker}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Calendar Widget for Dashboard
function CalendarWidget({ onViewAll }) {
  const todayStr = "2026-02-06";
  const upcoming = calendarEvents.filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "8px 10px", animation: "fadeUp .5s ease .35s both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 15 }}></span>
          <span style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif" }}>Upcoming</span>
        </div>
        <button onClick={onViewAll} style={{ background: "none", border: "none", color: "#C48830", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>See All →</button>
      </div>
      {upcoming.map((ev, i) => {
        const dateObj = new Date(ev.date + "T12:00:00");
        const label = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const isToday = ev.date === todayStr;
        return (
          <div key={i} style={{ display: "flex", gap: 6, padding: "5px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none", alignItems: "center" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: isToday ? "#FFF8EE" : "#FFFDF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: isToday ? "#C48830" : "#8A7040", flexShrink: 0, border: isToday ? "1.5px solid #C48830" : "1px solid #F0E6D0" }}>{label.split(" ")[1]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, fontFamily: "'Instrument Serif', serif", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{ev.type === "earnings" ? ev.ticker + " Earnings" : ev.name}</div>
              <div style={{ fontSize: 12, color: "#33333480" }}>{isToday ? "Today" : label}{ev.time ? " · " + ev.time : ""}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, padding: "1px 5px", borderRadius: 4, background: ev.impact === "high" ? "#FFEBEE" : "#FFF3E0", color: ev.impact === "high" ? "#EF5350" : "#FFA726", flexShrink: 0 }}>{ev.impact}</span>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════ ALERTS ═══════════════

function AlertsWidget({ alerts, onViewAll }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const sCol = { critical: "#EF5350", warning: "#FFA726", info: "#42A5F5" };
  const sBg = { critical: "#FFEBEE", warning: "#FFF3E0", info: "#E3F2FD" };
  const crit = alerts.filter(a => a.severity === "critical").length;

  const slides = alerts.slice(0, 5).map(a => ({
    ...a,
    headline: a.title === "Fed Holds Rates" ? "Fed steady — rate cuts signaled for Q2"
      : a.title === "CPI Hot at 3.4%" ? "CPI 3.4% hot — core beats, pivot delayed"
      : a.title === "China PMI at 48.1" ? "China PMI 48.1 — mfg contraction deepens"
      : a.title === "10Y Breaks 4.5%" ? "10Y above 4.5% — bond selloff hits growth"
      : a.title === "NVDA Revenue +265%" ? "NVDA +265% rev — AI capex boom continues"
      : a.icon + " " + a.title
  }));

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setActiveSlide(s => (s + 1) % slides.length), 3500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const current = slides[activeSlide] || slides[0];
  if (!current) return null;

  return (
    <div onClick={onViewAll} style={{ background: sBg[current.severity], border: `1.5px solid ${sCol[current.severity]}33`, borderRadius: 12, padding: "8px 10px", animation: "fadeUp .5s ease .3s both", cursor: "pointer", position: "relative", overflow: "hidden", transition: "all .4s ease" }}>
      {/* Top row: icon + badge + dots */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Icon name={current.icon} size={12} />
          <span style={{ fontSize: 12, fontWeight: 900, padding: "1px 6px", borderRadius: 4, background: sCol[current.severity], color: "#fff", textTransform: "uppercase" }}>{current.severity}</span>
          {crit > 1 && <span style={{ fontSize: 12, color: sCol[current.severity], fontWeight: 700 }}>{crit} alerts</span>}
        </div>
        {/* Slide dots */}
        <div style={{ display: "flex", gap: 3 }}>
          {slides.map((_, i) => (
            <div key={i} onClick={(e) => { e.stopPropagation(); setActiveSlide(i); }} style={{ width: i === activeSlide ? 12 : 5, height: 5, borderRadius: 3, background: i === activeSlide ? sCol[slides[i].severity] : sCol[slides[i].severity] + "44", transition: "all .3s", cursor: "pointer" }} />
          ))}
        </div>
      </div>
      {/* Headline */}
      <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: sCol[current.severity], lineHeight: 1.3, transition: "all .3s" }}>{current.headline}</div>
      {/* Tap hint */}
      <div style={{ fontSize: 11, color: "#33333480", marginTop: 3, fontWeight: 700 }}>Tap for details →</div>
      {/* Progress bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: sCol[current.severity] + "22" }}>
        <div style={{ height: "100%", background: sCol[current.severity], animation: "alertProgress 3.5s linear infinite", width: "100%" }} />
      </div>
    </div>
  );
}

function AlertsPage({ alerts }) {
  const [filter, setFilter] = useState("all");
  const sCol = { critical: "#EF5350", warning: "#FFA726", info: "#42A5F5" };
  const sBg = { critical: "#FFEBEE", warning: "#FFF3E0", info: "#E3F2FD" };
  const filtered = filter === "all" ? alerts : alerts.filter(a => a.severity === filter);

  return (
    <div>
      <div style={{ marginBottom: 10, animation: "fadeUp .3s ease both" }}>
        <h1 style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>Macro Alerts</h1>
        <p style={{ color: "#33333480", fontSize: 17, marginTop: 4 }}>Economic signals & live macro news feed</p>
      </div>

      {/* ── Alert Summary Cards ── */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10, flexWrap: "wrap" }}>
        {[{ k: "all", l: "All", n: alerts.length, c: "#5C4A1E", bg: "#fff" }, { k: "critical", l: "Critical", n: alerts.filter(a => a.severity === "critical").length, c: "#EF5350", bg: "#FFEBEE" }, { k: "warning", l: "Warning", n: alerts.filter(a => a.severity === "warning").length, c: "#FFA726", bg: "#FFF3E0" }, { k: "info", l: "Info", n: alerts.filter(a => a.severity === "info").length, c: "#42A5F5", bg: "#E3F2FD" }].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)} style={{ flex: "1 1 120px", padding: "12px 16px", borderRadius: 16, border: "1.5px solid " + (filter === f.k ? f.c : "transparent"), background: f.bg, cursor: "pointer", textAlign: "left" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: f.c }}>{f.l}</div>
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: f.c }}>{f.n}</div>
          </button>
        ))}
      </div>

      {/* ── Active Alerts ── */}
      {filtered.map((a, i) => (
        <div key={a.id} style={{ background: "#fff", borderRadius: 14, padding: "18px 22px", marginBottom: 12, borderLeft: "4px solid " + sCol[a.severity], animation: "fadeUp .4s ease " + (i * .05) + "s both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Icon name={a.icon} size={12} />
            <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 18, fontFamily: "'Instrument Serif', serif" }}>{a.title}</div></div>
            <span style={{ fontSize: 14, fontWeight: 800, background: sBg[a.severity], color: sCol[a.severity], padding: "3px 10px", borderRadius: 10 }}>{a.severity.toUpperCase()}</span>
            <span style={{ fontSize: 17, color: "#33333480" }}>{a.time} ago</span>
          </div>
          <div style={{ fontSize: 15, color: "#8A7040", lineHeight: 1.6 }}>{a.summary}</div>
        </div>
      ))}

    </div>
  );
}

// ═══════════════ CREATE BASKET MODAL ═══════════════

function CreateBasketModal({ onClose, onCreate }) {
  const [name, setName] = useState(""); const [icon, setIcon] = useState("basket"); const [strat, setStrat] = useState("Custom");
  const [search, setSearch] = useState(""); const [typeF, setTypeF] = useState("all"); const [selected, setSelected] = useState([]); const [step, setStep] = useState(1);
  const [directions, setDirections] = useState({});
  const filtered = allInstruments.filter(i => (typeF === "all" || i.type === typeF) && (!search || i.ticker.toLowerCase().includes(search.toLowerCase()) || i.name.toLowerCase().includes(search.toLowerCase())));
  const toggle = (inst) => { if (selected.find(s => s.ticker === inst.ticker)) { setSelected(selected.filter(s => s.ticker !== inst.ticker)); } else { setSelected([...selected, inst]); setDirections(d => ({ ...d, [inst.ticker]: "long" })); } };
  const flipDir = (ticker) => { setDirections(d => ({ ...d, [ticker]: d[ticker] === "long" ? "short" : "long" })); };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(45,32,22,.4)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "calc(100% - 24px)", maxWidth: 360, maxHeight: "90vh", overflow: "auto", animation: "popIn .4s ease" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "2px solid #F0E6D0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 18 }}></span><div><div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>Create Your Own Hatch</div><div style={{ fontSize: 17, color: "#33333480" }}>Step {step}/2</div></div></div>
          <button onClick={onClose} style={{ background: "#fff", border: "none", width: 32, height: 32, borderRadius: 10, cursor: "pointer", fontSize: 17, color: "#33333480" }}>✕</button>
        </div>
        <div style={{ padding: "18px 24px" }}>
          {step === 1 && (<div>
            <div style={{ marginBottom: 8 }}><label style={{ fontSize: 15, fontWeight: 800, color: "#33333480", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. My Growth Picks" style={{ width: "100%", padding: "12px 16px", borderRadius: 14, border: "1px solid #33333440", fontSize: 17, fontWeight: 700, fontFamily: "'Instrument Serif', serif", outline: "none", background: "#FFFDF5" }} onFocus={e => e.target.style.borderColor = "#C48830"} onBlur={e => e.target.style.borderColor = "#F0E6D0"} /></div>
            <div style={{ marginBottom: 8 }}><label style={{ fontSize: 15, fontWeight: 800, color: "#33333480", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Icon</label><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{["basket","target","diamond","crystal-ball","eagle","wave","mountain","palette","star","fire","rainbow","clover"].map(e => (<button key={e} onClick={() => setIcon(e)} style={{ width: 40, height: 40, borderRadius: 12, border: "1.5px solid " + (icon === e ? "#C48830" : "#F0E6D0"), background: icon === e ? "#FFF8EE" : "#fff", fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={e} size={16} /></button>))}</div></div>
            <div style={{ marginBottom: 10 }}><label style={{ fontSize: 15, fontWeight: 800, color: "#33333480", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Strategy</label><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{["Custom","Growth","Income","Defensive","Momentum","Global Macro","Multi-Asset","Long/Short","Speculative"].map(s => (<button key={s} onClick={() => setStrat(s)} style={{ padding: "6px 14px", borderRadius: 12, border: "1.5px solid " + (strat === s ? "#C48830" : "#F0E6D0"), background: strat === s ? "#FFF8EE" : "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "Quicksand", color: strat === s ? "#C48830" : "#8A7040" }}>{s}</button>))}</div></div>
            <button onClick={() => { if (name.trim()) setStep(2); }} disabled={!name.trim()} style={{ width: "100%", padding: 14, background: name.trim() ? "linear-gradient(135deg,#C48830,#EF5350)" : "#F0E6D0", color: name.trim() ? "#fff" : "#A09080", border: "none", borderRadius: 16, fontSize: 17, fontWeight: 900, cursor: name.trim() ? "pointer" : "default", fontFamily: "'Instrument Serif', serif" }}>Next: Add Instruments →</button>
          </div>)}
          {step === 2 && (<div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "7px 10px", background: "#fff", borderRadius: 14, marginBottom: 7 }}>
              <Icon name={icon} size={18} color="#C48830" /><div><div style={{ fontWeight: 800, fontFamily: "'Instrument Serif', serif" }}>{name}</div><div style={{ fontSize: 17, color: "#33333480" }}>{strat} · {selected.length} selected</div></div>
              <button onClick={() => setStep(1)} style={{ marginLeft: "auto", fontSize: 17, color: "#C48830", fontWeight: 800, background: "none", border: "none", cursor: "pointer" }}>Edit ←</button>
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stocks, options, futures, crypto..." style={{ width: "100%", padding: "10px 16px 10px 38px", borderRadius: 14, border: "1px solid #33333440", fontSize: 15, fontWeight: 600, fontFamily: "Quicksand", outline: "none", background: "#FFFDF5", marginBottom: 10 }} />
            <div style={{ display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap" }}>
              {[{ k: "all", l: "All" }, { k: "equity", l: "Stocks" }, { k: "option", l: "Options" }, { k: "future", l: "Futures" }, { k: "bond", l: "Bonds" }, { k: "forex", l: "FX" }, { k: "crypto", l: "Crypto" }].map(f => (
                <button key={f.k} onClick={() => setTypeF(f.k)} style={{ padding: "5px 12px", borderRadius: 10, border: "1.5px solid " + (typeF === f.k ? "#C48830" : "#F0E6D0"), background: typeF === f.k ? "#FFF8EE" : "#fff", fontSize: 17, fontWeight: 700, cursor: "pointer", color: typeF === f.k ? "#C48830" : "#A09080" }}>{f.l}</button>
              ))}
            </div>
            {selected.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10, padding: "8px 12px", background: "#FFF8EE", borderRadius: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#C48830", alignSelf: "center" }}>Selected:</span>
              {selected.map(s => { const d = directions[s.ticker] || "long"; return (
                <div key={s.ticker} style={{ display: "flex", alignItems: "center", gap: 2, padding: "2px 4px 2px 8px", borderRadius: 8, background: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "JetBrains Mono" }}>
                  <span style={{ color: d === "short" ? "#EF5350" : "#C48830" }}>{s.ticker}</span>
                  <button onClick={(e) => { e.stopPropagation(); flipDir(s.ticker); }} style={{ padding: "1px 4px", borderRadius: 4, border: "none", background: d === "short" ? "#FFEBEE" : "#FFF8EE", color: d === "short" ? "#EF5350" : "#C48830", fontSize: 12, fontWeight: 900, cursor: "pointer" }}>{d === "short" ? "S" : "L"}</button>
                  <button onClick={() => toggle(s)} style={{ background: "none", border: "none", fontSize: 15, cursor: "pointer", color: "#33333480", padding: 0 }}>×</button>
                </div>);
              })}
            </div>}
            <div style={{ maxHeight: 200, overflow: "auto", borderRadius: 14, border: "1px solid #33333440" }}>
              {filtered.map((inst, i) => { const sel = !!selected.find(s => s.ticker === inst.ticker); const tc = typeColors[inst.type] || "#A09080"; return (
                <div key={inst.ticker} onClick={() => toggle(inst)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderBottom: i < filtered.length - 1 ? "1px solid #F0E6D0" : "none", cursor: "pointer", background: sel ? "#FFF8EE" : "transparent", transition: "background .15s" }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.background = "#fff"; }} onMouseLeave={e => { if (!sel) e.currentTarget.style.background = "transparent"; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", border: "1.5px solid " + (sel ? "#C48830" : "#F0E6D0"), background: sel ? "#C48830" : "transparent" }} />
                    <div><div style={{ display: "flex", gap: 6, alignItems: "center" }}><span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 18 }}>{inst.ticker}</span><span style={{ fontSize: 12, fontWeight: 800, background: tc + "22", color: tc, padding: "1px 6px", borderRadius: 6, textTransform: "uppercase" }}>{typeLabels[inst.type]}</span></div><div style={{ fontSize: 17, color: "#33333480" }}>{inst.name}</div></div>
                  </div>
                  <div style={{ textAlign: "right" }}><div style={{ fontFamily: "JetBrains Mono", fontWeight: 600, fontSize: 18 }}>{inst.price > 1000 ? fmt(inst.price) : fmtD(inst.price)}</div><div style={{ fontSize: 15, fontWeight: 700, color: inst.change >= 0 ? "#5B8C5A" : "#EF5350" }}>{inst.change >= 0 ? "+" : ""}{inst.change}%</div></div>
                </div>); })}
            </div>
            <button onClick={() => { if (selected.length > 0) { onCreate({ name, icon, strategy: strat, instruments: selected }); onClose(); } }} disabled={!selected.length}
              style={{ width: "100%", marginTop: 14, padding: 14, background: selected.length ? "linear-gradient(135deg,#C48830,#5B9B5E)" : "#F0E6D0", color: selected.length ? "#fff" : "#A09080", border: "none", borderRadius: 16, fontSize: 17, fontWeight: 900, cursor: selected.length ? "pointer" : "default", fontFamily: "'Instrument Serif', serif" }}>
              Create with {selected.length} Instrument{selected.length !== 1 ? "s" : ""}
            </button>
          </div>)}
        </div>
      </div>
    </div>
  );
}

// ═══════════════ BASKET DETAIL ═══════════════

function BasketDetail({ basket, onBack, onGoToStock }) {
  const c = CL[basket.color] || CL.terracotta;
  const stocks = basketStocks[basket.id] || [];
  const history = basketHistories[basket.id] || [];
  const [editMode, setEditMode] = useState(null);
  const [showMetrics, setShowMetrics] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const tv = stocks.reduce((s, st) => s + st.shares * st.current, 0);
  const tc = stocks.reduce((s, st) => s + st.shares * st.avgCost, 0);
  const tp = tv - tc;
  const dp = stocks.reduce((s, st) => s + st.shares * st.current * (st.change / 100), 0);
  const rm = basketRiskMetrics[basket.id];

  if (selectedStock) {
    return <StockDetailPage stock={selectedStock} basketName={basket.name} onBack={() => setSelectedStock(null)} onGoToStock={onGoToStock} />;
  }

  return (
    <div style={{ animation: "slideRight .4s ease both" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <button onClick={onBack} style={{ background: "#fff", borderRadius: 12, width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>←</button>
        <Icon name={basket.icon} size={36} />
        <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>{basket.name}</div><div style={{ fontSize: 18, color: "#33333480" }}>{basket.strategy} · {stocks.length} instruments</div></div>
        {rm && <button onClick={() => setShowMetrics(!showMetrics)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 14, border: "1.5px solid " + (showMetrics ? c.a : "#F0E6D0"), background: showMetrics ? c.l : "#fff", cursor: "pointer", fontSize: 17, fontWeight: 800, fontFamily: "Quicksand", color: showMetrics ? c.a : "#8A7040", transition: "all .2s" }}>
          {showMetrics ? "Holdings" : "Risk Metrics"}
        </button>}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        <StatCard label="Value" value={fmt(tv)} icon={basket.icon} color={basket.color} /><StatCard label="Total P&L" value={fmtS(tp)} sub={pct((tp / tc) * 100)} icon={tp >= 0 ? "chart-up" : "chart-down"} color={tp >= 0 ? "sage" : "coral"} /><StatCard label="Today" value={fmtS(dp)} icon="bolt" color={dp >= 0 ? "sage" : "coral"} /><StatCard label="Cost" value={fmt(tc)} icon="money" color="golden" />
      </div>
      <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 10 }}><div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 7 }}>Performance</div><MiniChart data={history} color={c.a} chartId={"d_" + basket.id} /></div>

      {/* ── Risk Metrics Panel ── */}
      {showMetrics && rm ? (
        <div style={{ animation: "fadeUp .3s ease both", marginBottom: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 6 }}>
            {/* Key Ratios */}
            <div style={{ background: "#fff", borderRadius: 10, padding: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 3 }}>Key Ratios</div>
              {[
                { label: "Sharpe", val: rm.sharpe.toFixed(2), good: rm.sharpe > 1 },
                { label: "Sortino", val: rm.sortino.toFixed(2), good: rm.sortino > 1 },
                { label: "Treynor", val: rm.treynor.toFixed(1), good: rm.treynor > 5 },
                { label: "Info", val: rm.infoRatio.toFixed(2), good: rm.infoRatio > 0.5 },
                { label: "Alpha", val: (rm.alpha >= 0 ? "+" : "") + rm.alpha.toFixed(1) + "%", good: rm.alpha > 0 },
                { label: "Calmar", val: (Math.abs(tp / tc * 100) / Math.abs(rm.maxDD)).toFixed(2), good: true },
              ].map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none" }}>
                  <div style={{ fontWeight: 700, fontSize: 12, fontFamily: "'Instrument Serif', serif" }}>{m.label}</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 700, color: m.good ? "#5B8C5A" : "#EF5350" }}>{m.val}</div>
                </div>
              ))}
            </div>
            {/* Risk Profile */}
            <div style={{ background: "#fff", borderRadius: 10, padding: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 3 }}>Risk Profile</div>
              {[
                { label: "Beta", val: rm.beta.toFixed(2), good: rm.beta < 1.3, bar: rm.beta / 2 },
                { label: "Vol", val: rm.volatility.toFixed(1) + "%", good: rm.volatility < 20, bar: rm.volatility / 50 },
                { label: "Max DD", val: rm.maxDD.toFixed(1) + "%", good: rm.maxDD > -15, bar: Math.abs(rm.maxDD) / 50 },
                { label: "Trk Err", val: rm.trackError.toFixed(1) + "%", good: true, bar: rm.trackError / 25 },
              ].map((m, i) => (
                <div key={i} style={{ padding: "3px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 12, fontFamily: "'Instrument Serif', serif" }}>{m.label}</span>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 700, color: m.good ? "#5B8C5A" : "#EF5350" }}>{m.val}</span>
                  </div>
                  <div style={{ height: 3, background: "#FFF5E6", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: Math.min(m.bar * 100, 100) + "%", background: m.good ? "#5B8C5A" : "#EF5350", borderRadius: 2, transition: "width .5s" }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 5, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                <div style={{ background: rm.upCapture > 100 ? "#FFF8EE" : "#FFF3E0", borderRadius: 6, padding: "4px 6px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#33333480", textTransform: "uppercase" }}>Up Cap</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 700, color: rm.upCapture > 100 ? "#C48830" : "#FFA726" }}>{rm.upCapture}%</div>
                </div>
                <div style={{ background: rm.downCapture < 100 ? "#EDF5ED" : "#FFEBEE", borderRadius: 6, padding: "4px 6px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#33333480", textTransform: "uppercase" }}>Dn Cap</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 700, color: rm.downCapture < 100 ? "#5B8C5A" : "#EF5350" }}>{rm.downCapture}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* ── Asset Composition Bar ── */}
          {(() => {
            const assetCounts = {};
            const longCount = stocks.filter(s => (s.dir || "long") === "long").length;
            const shortCount = stocks.filter(s => s.dir === "short").length;
            stocks.forEach(s => { const a = s.asset || "equity"; assetCounts[a] = (assetCounts[a] || 0) + 1; });
            const total = stocks.length;
            return (
              <div style={{ background: "#fff", borderRadius: 18, padding: "14px 18px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Instrument Serif', serif" }}>Asset Composition</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: "#FFF8EE", color: "#C48830" }}>LONG {longCount}</span>
                    {shortCount > 0 && <span style={{ fontSize: 14, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: "#FFEBEE", color: "#EF5350" }}>SHORT {shortCount}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 1, marginBottom: 8 }}>
                  {Object.entries(assetCounts).map(([type, count]) => (
                    <div key={type} style={{ flex: count, background: typeColors[type] || "#A09080", transition: "flex .5s" }} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {Object.entries(assetCounts).map(([type, count]) => (
                    <div key={type} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: typeColors[type] || "#A09080" }} />
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#8A7040" }}>{typeLabels[type] || type} ({count})</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <button onClick={() => setEditMode(editMode === "rebalance" ? null : "rebalance")} style={{ flex: 1, padding: "8px 10px", borderRadius: 14, border: "1.5px solid " + (editMode === "rebalance" ? c.a : "#F0E6D0"), background: editMode === "rebalance" ? c.l : "#fff", cursor: "pointer", fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif" }}>Rebalance</button>
            <button onClick={() => setEditMode(editMode === "add" ? null : "add")} style={{ flex: 1, padding: "8px 10px", borderRadius: 14, border: "1.5px solid " + (editMode === "add" ? c.a : "#F0E6D0"), background: editMode === "add" ? c.l : "#fff", cursor: "pointer", fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif" }}>Add</button>
          </div>
          {editMode && <div style={{ background: c.l, border: "1.5px solid " + c.a, borderRadius: 14, padding: "8px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", animation: "popIn .3s ease" }}>
            <span style={{ fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: c.a, fontSize: 14 }}>Tap a stock below to {editMode}</span>
            <div style={{ display: "flex", gap: 4 }}><button onClick={() => setEditMode(null)} style={{ padding: "5px 10px", borderRadius: 8, border: "none", background: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 15 }}>Cancel</button><button onClick={() => setEditMode(null)} style={{ padding: "5px 10px", borderRadius: 8, border: "none", background: c.a, color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 15 }}>Apply</button></div>
          </div>}
          <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "8px 12px", borderBottom: "1.5px solid #F0E6D0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: "#333334" }}>Holdings</span>
              <span style={{ fontSize: 12, color: "#33333480", fontWeight: 600 }}>{stocks.length} instruments</span>
            </div>
            {stocks.map((st, i) => {
              const pl = (st.current - st.avgCost) * st.shares * ((st.dir || "long") === "short" ? -1 : 1);
              const plPct = ((st.current - st.avgCost) / st.avgCost * 100) * ((st.dir || "long") === "short" ? -1 : 1);
              const sparkData = genSparkline(st.avgCost, st.current, st.ticker, st._sparkCloses);
              const sparkColor = st.change >= 0 ? "#5B8C5A" : "#EF5350";
              return (
              <div key={st.ticker + i} onClick={() => setSelectedStock(st)} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
                borderBottom: i < stocks.length - 1 ? "1px solid #F0E6D0" : "none",
                cursor: "pointer", transition: "background .15s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#FFFDF5"} onMouseLeave={e => e.currentTarget.style.background = ""}>
                {/* Left: logo + name + ticker */}
                <StockLogo ticker={st.ticker} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: "#333334", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{st.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
                    <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", color: "#33333480", fontWeight: 600 }}>{st.ticker}</span>
                    <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", color: "#33333480" }}>·</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#33333480" }}>{st.shares} shares</span>
                  </div>
                </div>
                {/* Center: sparkline */}
                <div style={{ width: 60, flexShrink: 0 }}>
                  <SparkSVG data={sparkData} color={sparkColor} />
                </div>
                {/* Right: price + P&L */}
                <div style={{ textAlign: "right", minWidth: 70, flexShrink: 0 }}>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 800, color: "#333334" }}>
                    ${st.current >= 1000 ? st.current.toLocaleString() : st.current.toFixed(2)}
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 3, marginTop: 1 }}>
                    <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", fontWeight: 700, color: pl >= 0 ? "#5B8C5A" : "#EF5350" }}>
                      {pl >= 0 ? "+" : ""}{pl >= 1000 || pl <= -1000 ? (pl / 1000).toFixed(1) + "k" : Math.round(pl)}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: "1px 4px", borderRadius: 3, background: (plPct >= 0 ? "#5B8C5A" : "#EF5350") + "14", color: plPct >= 0 ? "#5B8C5A" : "#EF5350" }}>
                      {plPct >= 0 ? "+" : ""}{plPct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                {/* Arrow */}
                <span style={{ fontSize: 15, color: "#D0C8B8", marginLeft: 2 }}>›</span>
              </div>
            ); })}
          </div>

          {/* ── Portfolio Risk Metrics ── */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 7 }}>Portfolio Risk Metrics</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 8 }}>
              {[
                { label: "Sharpe", val: portfolioRisk.sharpe.toFixed(2), good: portfolioRisk.sharpe > 1, icon: "ruler" },
                { label: "Beta", val: portfolioRisk.beta.toFixed(2), good: portfolioRisk.beta < 1.3, icon: "chart-bar" },
                { label: "Vol", val: portfolioRisk.volatility.toFixed(1) + "%", good: portfolioRisk.volatility < 20, icon: "wave" },
                { label: "Max DD", val: portfolioRisk.maxDrawdown.toFixed(1) + "%", good: portfolioRisk.maxDrawdown > -15, icon: "chart-down" },
                { label: "VaR 95%", val: fmtS(portfolioRisk.var95), good: false, icon: "warning" },
                { label: "Calmar", val: portfolioRisk.calmar.toFixed(2), good: portfolioRisk.calmar > 1, icon: "target" },
              ].map((m, mi) => (
                <div key={mi} style={{ background: "#fff", borderRadius: 8, padding: "6px 6px", textAlign: "center", border: "1px solid #F0E6D0" }}>
                  <div style={{ marginBottom: 1 }}><Icon name={m.icon} size={11} color={m.good ? "#5B8C5A" : "#EF5350"} /></div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#33333480", textTransform: "uppercase" }}>{m.label}</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 800, color: m.good ? "#5B8C5A" : "#EF5350" }}>{m.val}</div>
                </div>
              ))}
            </div>

            {/* ── Portfolio Allocation Pie Chart (3D Interactive) ── */}
            {(() => {
              const allStocks = myBaskets.flatMap(b => (basketStocks[b.id] || []).filter(s => s.asset === "equity").map(s => ({ ...s, basket: b.name })));
              const totalVal = allStocks.reduce((sum, s) => sum + s.current * s.shares, 0);
              const holdings = allStocks.reduce((acc, s) => {
                const existing = acc.find(h => h.ticker === s.ticker);
                if (existing) { existing.value += s.current * s.shares; }
                else { acc.push({ ticker: s.ticker, name: s.name, value: s.current * s.shares }); }
                return acc;
              }, []).sort((a, b) => b.value - a.value);
              const slices = holdings.map(h => ({ ...h, pct: (h.value / totalVal) * 100 }));
              const pieColors = ["#C48830","#5B8C5A","#42A5F5","#EF5350","#AB47BC","#FFA726","#26A69A","#7E57C2","#EF6C00","#5C6BC0","#8D6E63","#78909C","#D4E157","#EC407A"];
              const hhi = slices.reduce((sum, s) => sum + Math.pow(s.pct, 2), 0);
              const maxHHI = 10000;
              const minHHI = maxHHI / slices.length;
              const diversScore = Math.max(0, Math.min(100, ((maxHHI - hhi) / (maxHHI - minHHI)) * 100));
              const divLabel = diversScore > 70 ? "Well Diversified" : diversScore > 40 ? "Moderate" : "Concentrated";
              const divColor = diversScore > 70 ? "#5B8C5A" : diversScore > 40 ? "#FFA726" : "#EF5350";

              // 3D pie: ellipse-based for perspective
              const cx = 100, cy = 85, rx = 85, ry = 50, depth = 18;
              let cumAngle = 0;
              const arcs = slices.map((s, i) => {
                const angle = (s.pct / 100) * 360;
                const startAngle = cumAngle;
                const midAngle = cumAngle + angle / 2;
                cumAngle += angle;
                const startRad = (startAngle - 90) * Math.PI / 180;
                const endRad = (cumAngle - 90) * Math.PI / 180;
                const midRad = (midAngle - 90) * Math.PI / 180;
                const largeArc = angle > 180 ? 1 : 0;
                const x1 = cx + rx * Math.cos(startRad);
                const y1 = cy + ry * Math.sin(startRad);
                const x2 = cx + rx * Math.cos(endRad);
                const y2 = cy + ry * Math.sin(endRad);
                // Top face path
                const topD = `M${cx},${cy} L${x1},${y1} A${rx},${ry} 0 ${largeArc},1 ${x2},${y2} Z`;
                // Side face (3D depth) — only render for slices with visible bottom edge
                const sideD = `M${x1},${y1} A${rx},${ry} 0 ${largeArc},1 ${x2},${y2} L${x2},${y2 + depth} A${rx},${ry} 0 ${largeArc},0 ${x1},${y1 + depth} Z`;
                return { ...s, color: pieColors[i % pieColors.length], topD, sideD, startAngle, midAngle, endAngle: cumAngle, midRad };
              });

              // Darken color for 3D side
              const darken = (hex, amt) => {
                const num = parseInt(hex.slice(1), 16);
                const r = Math.max(0, (num >> 16) - amt);
                const g = Math.max(0, ((num >> 8) & 0xFF) - amt);
                const b = Math.max(0, (num & 0xFF) - amt);
                return `rgb(${r},${g},${b})`;
              };

              return (
                <PieChartInteractive arcs={arcs} slices={slices} cx={cx} cy={cy} rx={rx} ry={ry} depth={depth}
                  darken={darken} divColor={divColor} divLabel={divLabel} diversScore={diversScore} totalVal={totalVal} />
              );
            })()}

            <div style={{ padding: "6px 8px", background: "#fff", borderRadius: 8, border: "1px solid #F0E6D0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, fontFamily: "'Instrument Serif', serif" }}>Concentration</div>
                <div style={{ fontSize: 11, color: "#8A7040" }}>Top: {portfolioRisk.topHolding.ticker} ({portfolioRisk.topHolding.pct}%)</div>
              </div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700, color: "#EF5350" }}>{portfolioRisk.sectorConcentration}%</div>
            </div>
          </div>

          {/* ── Per-Basket Risk Metrics ── */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 7 }}>Per-Hatch Metrics</div>
            <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #F0E6D0" }}>
              <div className="basket-metrics-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr .7fr .7fr .7fr", padding: "6px 10px", background: "#FFFDF5", fontSize: 11, fontWeight: 800, color: "#33333480", textTransform: "uppercase", letterSpacing: .5, borderBottom: "1.5px solid #F0E6D0" }}>
                <div>Basket</div><div>Sharpe</div><div>Beta</div><div>Alpha</div>
              </div>
              {myBaskets.map((mb, mi) => { const brm = basketRiskMetrics[mb.id]; if (!brm) return null; return (
                <div key={mb.id} style={{ display: "grid", gridTemplateColumns: "1.4fr .7fr .7fr .7fr", padding: "6px 10px", borderBottom: mi < myBaskets.length - 1 ? "1px solid #F0E6D0" : "none", fontSize: 15, alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}><Icon name={mb.icon} size={9} /><span style={{ fontWeight: 700, fontFamily: "'Instrument Serif', serif", fontSize: 12 }}>{mb.name}</span></div>
                  <div style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 14, color: brm.sharpe > 1 ? "#C48830" : "#FFA726" }}>{brm.sharpe.toFixed(2)}</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontWeight: 600, fontSize: 14, color: brm.beta < 1.3 ? "#5B8C5A" : "#EF5350" }}>{brm.beta.toFixed(2)}</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 14, color: brm.alpha > 0 ? "#5B8C5A" : "#EF5350" }}>{brm.alpha > 0 ? "+" : ""}{brm.alpha.toFixed(1)}%</div>
                </div>); })}
            </div>
          </div>

          {/* ── Factor Exposures ── */}
          <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginTop: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 7 }}>Factor Exposures</div>
            {factorExposures.map((f, fi) => {
              const overweight = f.exposure > f.benchmark;
              return (
                <div key={fi} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0", borderTop: fi > 0 ? "1px solid #F0E6D020" : "none" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#333334", width: 55 }}>{f.factor}</span>
                  <div style={{ flex: 1, position: "relative", height: 8, background: "#F5F0E8", borderRadius: 4 }}>
                    <div style={{ position: "absolute", left: (f.benchmark * 100) + "%", top: 0, bottom: 0, width: 1.5, background: "#A0908066", zIndex: 1 }} />
                    <div style={{ height: "100%", width: (f.exposure * 100) + "%", background: overweight ? "#C48830" : "#5B8C5A", borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", fontWeight: 800, color: overweight ? "#C48830" : "#5B8C5A", minWidth: 24, textAlign: "right" }}>{(f.exposure * 100).toFixed(0)}%</span>
                </div>
              );
            })}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: 11, color: "#33333480" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 8, height: 2, background: "#A0908066", borderRadius: 1 }} /><span>Benchmark</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 8, height: 4, background: "#C48830", borderRadius: 1 }} /><span>Overweight</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 8, height: 4, background: "#5B8C5A", borderRadius: 1 }} /><span>Underweight</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════ STOCK DETAIL PAGE (Robinhood-style) ═══════════════

function genStockHistory(avgCost, current, ticker) {
  const pts = [];
  const months = ["Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb"];
  const range = current - avgCost;
  for (let i = 0; i < 12; i++) {
    const progress = i / 11;
    const noise = (Math.sin(i * 2.3 + ticker.charCodeAt(0)) * 0.15 + Math.cos(i * 1.7) * 0.1);
    const v = avgCost + range * (progress * 0.7 + progress * progress * 0.3) + avgCost * noise;
    pts.push({ d: months[i], v: Math.max(v, avgCost * 0.6) });
  }
  pts[pts.length - 1].v = current;
  return pts;
}

function genSparkline(avgCost, current, ticker, realSparkCloses) {
  // Use real intraday data from Yahoo Finance if available
  if (realSparkCloses && realSparkCloses.length > 2) {
    return realSparkCloses;
  }
  // Fallback: synthetic sparkline
  const pts = [];
  for (let i = 0; i < 20; i++) {
    const progress = i / 19;
    const range = current - avgCost;
    const noise = Math.sin(i * 2.1 + (ticker.charCodeAt(0) || 65)) * 0.08 * avgCost;
    pts.push(avgCost + range * progress + noise);
  }
  pts[pts.length - 1] = current;
  return pts;
}

function SparkSVG({ data, color, w = 60, h = 20 }) {
  if (!data || data.length < 2) return null;
  const mn = Math.min(...data), mx = Math.max(...data);
  const range = mx - mn || 1;
  const pts = data.map((v, i) => (i / (data.length - 1)) * w + "," + ((1 - (v - mn) / range) * h)).join(" ");
  return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

// ═══════════════ STANDALONE STOCK PAGE (Yahoo Finance) ═══════════════

// Build ticker→name lookup from all known data sources
const TICKER_NAME_MAP = {};
allInstruments.forEach(i => { if (i.ticker && i.name) TICKER_NAME_MAP[i.ticker] = i.name; });
Object.values(basketStocks).flat().forEach(s => { if (s.ticker && s.name) TICKER_NAME_MAP[s.ticker] = s.name; });

function StockPage({ ticker, onBack, onNavigate }) {
  const [period, setPeriod] = useState("1Y");
  const [orderType, setOrderType] = useState(null);
  const [shares, setShares] = useState(1);

  // Fetch detailed summary from Yahoo Finance
  const { summary, isLoading: summaryLoading } = useStockDetail(ticker);

  // Fetch company-specific news from Finnhub
  const { news: companyNews } = useCompanyNews(ticker);

  // Fetch chart data
  const periodMap = { "1D": { range: "1d", interval: "5m" }, "1W": { range: "5d", interval: "15m" }, "1M": { range: "1mo", interval: "1d" }, "3M": { range: "3mo", interval: "1d" }, "1Y": { range: "1y", interval: "1d" }, "ALL": { range: "max", interval: "1wk" } };
  const chartParams = periodMap[period] || periodMap["1Y"];
  const { chartData, isLoading: chartLoading } = useStockChart(ticker, chartParams.range, chartParams.interval);

  // Convert chart data to MiniChart format
  const history = React.useMemo(() => {
    if (chartData?.closes?.length > 0) {
      const full = [];
      for (let i = 0; i < chartData.closes.length; i++) {
        const c = chartData.closes[i];
        if (c == null) continue;
        const ts = chartData.timestamps[i];
        const date = ts ? new Date(ts * 1000) : null;
        let label = "";
        if (date) {
          if (period === "1D") label = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
          else if (period === "1W") label = date.toLocaleDateString("en-US", { weekday: "short" });
          else label = date.toLocaleDateString("en-US", { month: "short", day: period === "ALL" ? undefined : "numeric" });
        }
        full.push({ d: label, v: c });
      }
      if (full.length <= 24) return full;
      const step = (full.length - 1) / 19;
      const sampled = [];
      for (let i = 0; i < 20; i++) sampled.push(full[Math.round(i * step)]);
      return sampled;
    }
    return null;
  }, [chartData, period]);

  // Find if user holds this stock in any basket
  const holdings = [];
  myBaskets.forEach(b => {
    const stocks = basketStocks[b.id] || [];
    stocks.forEach(s => {
      if (s.ticker === ticker) holdings.push({ ...s, basketName: b.name, basketIcon: b.icon, basketColor: b.color, basketId: b.id });
    });
  });

  // Resolve name
  const stockName = TICKER_NAME_MAP[ticker] || ticker;
  const price = summary?.price || chartData?.meta?.regularMarketPrice || 0;
  const prevClose = summary?.previousClose || chartData?.meta?.previousClose || price;
  const change = summary?.change || (price - prevClose);
  const changePct = summary?.changePercent || (prevClose ? ((price - prevClose) / prevClose) * 100 : 0);
  const isUp = changePct >= 0;
  const color = isUp ? "#5B8C5A" : "#EF5350";

  // Volume formatting
  const fmtVol = (v) => {
    if (!v) return "—";
    if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
    if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
    if (v >= 1e3) return (v / 1e3).toFixed(1) + "K";
    return v.toLocaleString();
  };

  const loading = summaryLoading && !summary;

  return (
    <div style={{ animation: "slideRight .3s ease both" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <button onClick={onBack} style={{ background: "#fff", borderRadius: 10, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>←</button>
        <StockLogo ticker={ticker} size={40} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: "#333334" }}>{stockName}</div>
          <div style={{ fontSize: 14, color: "#33333480", fontFamily: "JetBrains Mono" }}>{ticker}{summary?.exchange ? " · " + summary.exchange : ""}</div>
        </div>
        {holdings.length > 0 && <div style={{ padding: "3px 8px", borderRadius: 6, background: "#FFF8EE", border: "1px solid #C4883033" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#C48830" }}>IN PORTFOLIO</span>
        </div>}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ background: "#fff", borderRadius: 16, padding: "40px 14px", textAlign: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 30, marginBottom: 6, animation: "spin 1s linear infinite", display: "inline-block" }}>
            <Icon name="rotate" size={20} color="#C48830" />
          </div>
          <div style={{ fontSize: 15, color: "#A09080", fontWeight: 700 }}>Loading {ticker} data from Yahoo Finance...</div>
        </div>
      )}

      {/* Price Hero */}
      {(price > 0 || !loading) && <div style={{ background: "#fff", borderRadius: 16, padding: "14px 14px 10px", marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 42, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: "#333334", letterSpacing: "-1px" }}>
              ${price >= 1000 ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : price.toFixed(2)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700, color }}>{isUp ? "▲" : "▼"} {isUp ? "+" : ""}{changePct.toFixed(2)}%</span>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700, color, background: color + "12", padding: "2px 6px", borderRadius: 5 }}>{isUp ? "+" : ""}{change.toFixed(2)}</span>
              <span style={{ fontSize: 12, color: "#33333480" }}>Today</span>
            </div>
          </div>
          {summary?.rsi != null && (
            <div style={{ textAlign: "center", padding: "4px 8px", borderRadius: 8, background: summary.rsi > 70 ? "#FFEBEE" : summary.rsi < 30 ? "#EDF5ED" : "#FFF8EE" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#33333480", textTransform: "uppercase" }}>RSI</div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 800, color: summary.rsi > 70 ? "#EF5350" : summary.rsi < 30 ? "#5B8C5A" : "#C48830" }}>{summary.rsi}</div>
            </div>
          )}
        </div>

        {/* Chart */}
        <div style={{ margin: "12px 0 6px", position: "relative" }}>
          {chartLoading && <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,253,245,0.7)", zIndex: 2, borderRadius: 8 }}><span style={{ fontSize: 14, color: "#A09080", fontWeight: 700 }}>Loading chart...</span></div>}
          {history ? (
            <MiniChart data={history} color={color} chartId={"stockpage_" + ticker.replace(/[^a-zA-Z]/g, "") + "_" + period} />
          ) : !chartLoading ? (
            <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: "#A09080", fontSize: 15 }}>No chart data available</div>
          ) : null}
        </div>

        {/* Period selector */}
        <div style={{ display: "flex", gap: 1, background: "#FFFDF5", borderRadius: 8, padding: 2, width: "fit-content" }}>
          {["1D", "1W", "1M", "3M", "1Y", "ALL"].map(t => (
            <button key={t} onClick={() => setPeriod(t)} style={{ padding: "3px 8px", borderRadius: 6, border: "none", background: period === t ? "#fff" : "transparent", color: period === t ? "#C48830" : "#A09080", fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: period === t ? "0 1px 4px rgba(0,0,0,.06)" : "none" }}>{t}</button>
          ))}
        </div>
      </div>}

      {/* Key Stats */}
      {summary && <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 8 }}>Key Stats</div>
        {[
          { label: "Prev Close", val: "$" + (summary.previousClose || 0).toFixed(2) },
          { label: "Day Range", val: "$" + (summary.dayLow || 0).toFixed(2) + " — $" + (summary.dayHigh || 0).toFixed(2) },
          { label: "52W High", val: summary.high52w ? "$" + summary.high52w.toFixed(2) : "—" },
          { label: "52W Low", val: summary.low52w ? "$" + summary.low52w.toFixed(2) : "—" },
          { label: "Volume", val: fmtVol(summary.volume) },
          { label: "Avg Volume", val: fmtVol(summary.avgVolume) },
          { label: "Volatility", val: summary.volatility ? summary.volatility.toFixed(1) + "%" : "—" },
          { label: "Max Drawdown", val: summary.maxDrawdown ? summary.maxDrawdown.toFixed(1) + "%" : "—" },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none" }}>
            <span style={{ fontSize: 14, color: "#33333480", fontWeight: 600 }}>{s.label}</span>
            <span style={{ fontSize: 14, fontFamily: "JetBrains Mono", fontWeight: 700, color: "#333334" }}>{s.val}</span>
          </div>
        ))}
      </div>}

      {/* Technical Indicators */}
      {summary && (summary.sma50 || summary.sma200 || summary.rsi) && <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 8 }}>Technical Indicators</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {summary.sma50 && (
            <div style={{ background: price > summary.sma50 ? "#EDF5ED" : "#FFEBEE", borderRadius: 8, padding: "7px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#33333480", textTransform: "uppercase" }}>SMA 50</div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 800, color: price > summary.sma50 ? "#5B8C5A" : "#EF5350" }}>${summary.sma50.toFixed(0)}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: price > summary.sma50 ? "#5B8C5A" : "#EF5350" }}>{price > summary.sma50 ? "Above" : "Below"}</div>
            </div>
          )}
          {summary.sma200 && (
            <div style={{ background: price > summary.sma200 ? "#EDF5ED" : "#FFEBEE", borderRadius: 8, padding: "7px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#33333480", textTransform: "uppercase" }}>SMA 200</div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 800, color: price > summary.sma200 ? "#5B8C5A" : "#EF5350" }}>${summary.sma200.toFixed(0)}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: price > summary.sma200 ? "#5B8C5A" : "#EF5350" }}>{price > summary.sma200 ? "Above" : "Below"}</div>
            </div>
          )}
          {summary.rsi != null && (
            <div style={{ background: summary.rsi > 70 ? "#FFEBEE" : summary.rsi < 30 ? "#EDF5ED" : "#FFF8EE", borderRadius: 8, padding: "7px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#33333480", textTransform: "uppercase" }}>RSI (14)</div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 800, color: summary.rsi > 70 ? "#EF5350" : summary.rsi < 30 ? "#5B8C5A" : "#C48830" }}>{summary.rsi}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: summary.rsi > 70 ? "#EF5350" : summary.rsi < 30 ? "#5B8C5A" : "#C48830" }}>{summary.rsi > 70 ? "Overbought" : summary.rsi < 30 ? "Oversold" : "Neutral"}</div>
            </div>
          )}
        </div>
        {/* 52W Range Bar */}
        {summary.high52w && summary.low52w && price > 0 && <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: 11, color: "#33333480", fontWeight: 600 }}>52 Week Range</span>
          </div>
          <div style={{ position: "relative", height: 8, background: "#F5F0E8", borderRadius: 4 }}>
            <div style={{ position: "absolute", left: 0, height: "100%", width: Math.min(((price - summary.low52w) / (summary.high52w - summary.low52w)) * 100, 100) + "%", background: "linear-gradient(90deg, #EF5350, #FFA726, #5B8C5A)", borderRadius: 4 }} />
            <div style={{ position: "absolute", left: Math.min(((price - summary.low52w) / (summary.high52w - summary.low52w)) * 100, 100) + "%", top: -3, width: 14, height: 14, borderRadius: "50%", background: "#fff", border: "2px solid #C48830", transform: "translateX(-50%)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
            <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: "#EF5350", fontWeight: 700 }}>${summary.low52w.toFixed(0)}</span>
            <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: "#5B8C5A", fontWeight: 700 }}>${summary.high52w.toFixed(0)}</span>
          </div>
        </div>}
      </div>}

      {/* Performance Returns */}
      {summary?.returns && Object.keys(summary.returns).length > 0 && <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 8 }}>Performance</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {Object.entries(summary.returns).map(([key, val]) => (
            <div key={key} style={{ background: val >= 0 ? "#EDF5ED" : "#FFEBEE", borderRadius: 8, padding: "7px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#33333480", textTransform: "uppercase" }}>{key}</div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 800, color: val >= 0 ? "#5B8C5A" : "#EF5350" }}>{val >= 0 ? "+" : ""}{val.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>}

      {/* Portfolio Holdings */}
      {holdings.length > 0 && <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 8 }}>Your Holdings</div>
        {holdings.map((h, i) => {
          const pl = (h.current - h.avgCost) * h.shares * ((h.dir || "long") === "short" ? -1 : 1);
          const plPct = ((h.current - h.avgCost) / h.avgCost * 100) * ((h.dir || "long") === "short" ? -1 : 1);
          const c = CL[h.basketColor] || CL.terracotta;
          return (
            <div key={i} style={{ padding: "8px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Icon name={h.basketIcon} size={12} color={c.a} />
                  <span style={{ fontSize: 14, fontWeight: 800, color: c.a }}>{h.basketName}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 4px", borderRadius: 3, background: h.dir === "short" ? "#FFEBEE" : "#FFF8EE", color: h.dir === "short" ? "#EF5350" : "#C48830" }}>{(h.dir || "long").toUpperCase()}</span>
                </div>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 700, color: pl >= 0 ? "#5B8C5A" : "#EF5350" }}>{pl >= 0 ? "+" : ""}{plPct.toFixed(1)}%</span>
              </div>
              <div className="holdings-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4 }}>
                {[
                  { label: "Shares", val: h.shares.toString() },
                  { label: "Avg Cost", val: "$" + h.avgCost.toFixed(2) },
                  { label: "Mkt Val", val: "$" + (h.current * h.shares >= 1000 ? ((h.current * h.shares) / 1000).toFixed(1) + "k" : (h.current * h.shares).toFixed(0)) },
                  { label: "P&L", val: (pl >= 0 ? "+" : "") + "$" + Math.abs(Math.round(pl)).toLocaleString() },
                ].map((m, mi) => (
                  <div key={mi} style={{ background: "#FFFDF5", borderRadius: 6, padding: "4px 5px" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#33333480", textTransform: "uppercase" }}>{m.label}</div>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 800, color: "#333334" }}>{m.val}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>}

      {/* Buy / Sell */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          <button onClick={() => setOrderType(orderType === "buy" ? null : "buy")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: orderType === "buy" ? "#5B8C5A" : "#EDF5ED", color: orderType === "buy" ? "#fff" : "#5B8C5A", fontSize: 17, fontWeight: 900, cursor: "pointer", fontFamily: "'Instrument Serif', serif" }}>Buy</button>
          <button onClick={() => setOrderType(orderType === "sell" ? null : "sell")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: orderType === "sell" ? "#EF5350" : "#FFEBEE", color: orderType === "sell" ? "#fff" : "#EF5350", fontSize: 17, fontWeight: 900, cursor: "pointer", fontFamily: "'Instrument Serif', serif" }}>Sell</button>
        </div>
        {orderType && price > 0 && (
          <div style={{ animation: "fadeUp .2s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#33333480" }}>Shares</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => setShares(Math.max(1, shares - 1))} style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid #33333440", background: "#fff", cursor: "pointer", fontSize: 18, fontWeight: 700, color: "#EF5350", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 21, fontWeight: 900, color: "#333334", minWidth: 24, textAlign: "center" }}>{shares}</span>
                <button onClick={() => setShares(shares + 1)} style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid #33333440", background: "#fff", cursor: "pointer", fontSize: 18, fontWeight: 700, color: "#5B8C5A", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#33333480" }}>Market Price</span>
              <span style={{ fontSize: 14, fontFamily: "JetBrains Mono", fontWeight: 700 }}>${price.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid #33333420" }}>
              <span style={{ fontSize: 12, color: "#33333480" }}>Est. Total</span>
              <span style={{ fontSize: 17, fontFamily: "'Instrument Serif', serif", fontWeight: 900, color: "#333334" }}>${(price * shares).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <button style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: orderType === "buy" ? "linear-gradient(135deg,#5B8C5A,#4CAF50)" : "linear-gradient(135deg,#EF5350,#E53935)", color: "#fff", fontSize: 17, fontWeight: 900, cursor: "pointer", fontFamily: "'Instrument Serif', serif" }}>
              {orderType === "buy" ? "Buy" : "Sell"} {shares} {shares === 1 ? "Share" : "Shares"}
            </button>
          </div>
        )}
      </div>

      {/* Related News (live from Finnhub, fallback to mock) */}
      {(() => {
        const related = companyNews.length > 0
          ? companyNews.slice(0, 3)
          : terminalFeed.filter(n => n.assets && n.assets.includes(ticker)).slice(0, 3);
        if (related.length === 0) return null;
        return (
          <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 8 }}>Related News</div>
            {related.map((n, i) => (
              <div key={n.id} style={{ padding: "6px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#333334", lineHeight: 1.3 }}>{n.headline}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 3, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#33333480" }}>{n.time}</span>
                  <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 4px", borderRadius: 3, background: n.impact === "bullish" ? "#EDF5ED" : n.impact === "bearish" ? "#FFEBEE" : "#FFF8EE", color: n.impact === "bullish" ? "#5B8C5A" : n.impact === "bearish" ? "#EF5350" : "#C48830" }}>{(n.impact || "mixed").toUpperCase()}</span>
                  {n.move && <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", fontWeight: 700, color: n.move.startsWith("+") ? "#5B8C5A" : "#EF5350" }}>{n.move}</span>}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Upcoming Events */}
      {(() => {
        const events = calendarEvents.filter(e => e.ticker === ticker).slice(0, 3);
        if (events.length === 0) return null;
        return (
          <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 8 }}>Upcoming Events</div>
            {events.map((e, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: e.type === "earnings" ? "#FFF8EE" : "#EDF5ED", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#33333480" }}>{e.date.split("-")[1] === "02" ? "FEB" : "MAR"}</span>
                  <span style={{ fontSize: 17, fontWeight: 900, color: "#333334", fontFamily: "'Instrument Serif', serif" }}>{parseInt(e.date.split("-")[2])}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#333334" }}>{e.name}</div>
                  <div style={{ fontSize: 11, color: "#33333480" }}>{e.type === "earnings" ? `${e.quarter} · ${e.time} · Est. ${e.expected}` : e.desc}</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 5px", borderRadius: 4, background: e.impact === "high" ? "#FFEBEE" : e.impact === "medium" ? "#FFF3E0" : "#FFF8EE", color: e.impact === "high" ? "#EF5350" : e.impact === "medium" ? "#FFA726" : "#C48830" }}>{e.impact.toUpperCase()}</span>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}

function StockDetailPage({ stock, basketName, onBack, onGoToStock }) {
  const [period, setPeriod] = useState("1Y");
  const [orderType, setOrderType] = useState(null);
  const [shares, setShares] = useState(1);

  // Map period selector to Yahoo Finance range/interval
  const periodMap = { "1D": { range: "1d", interval: "5m" }, "1W": { range: "5d", interval: "15m" }, "1M": { range: "1mo", interval: "1d" }, "3M": { range: "3mo", interval: "1d" }, "1Y": { range: "1y", interval: "1d" }, "ALL": { range: "max", interval: "1wk" } };
  const isQuotable = /^[A-Z.]{1,6}$/.test(stock.ticker);
  const chartParams = periodMap[period] || periodMap["1Y"];
  const { chartData, isLoading: chartLoading } = useStockChart(
    isQuotable ? stock.ticker : null, chartParams.range, chartParams.interval
  );

  // Convert Yahoo Finance chart data to MiniChart format [{d, v}]
  const history = React.useMemo(() => {
    if (chartData?.closes?.length > 0) {
      // Build full data array
      const full = [];
      for (let i = 0; i < chartData.closes.length; i++) {
        const c = chartData.closes[i];
        if (c == null) continue;
        const ts = chartData.timestamps[i];
        const date = ts ? new Date(ts * 1000) : null;
        let label = "";
        if (date) {
          if (period === "1D") label = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
          else if (period === "1W") label = date.toLocaleDateString("en-US", { weekday: "short" });
          else label = date.toLocaleDateString("en-US", { month: "short", day: period === "ALL" ? undefined : "numeric" });
        }
        full.push({ d: label, v: c });
      }
      // Downsample to ~20 points for clean chart rendering
      if (full.length <= 24) return full;
      const step = (full.length - 1) / 19;
      const sampled = [];
      for (let i = 0; i < 20; i++) {
        sampled.push(full[Math.round(i * step)]);
      }
      return sampled;
    }
    // Fallback to synthetic data
    return genStockHistory(stock.avgCost, stock.current, stock.ticker);
  }, [chartData, period, stock.avgCost, stock.current, stock.ticker]);

  // Extract real stats from chart meta
  const chartMeta = chartData?.meta || {};

  const pl = (stock.current - stock.avgCost) * stock.shares * ((stock.dir || "long") === "short" ? -1 : 1);
  const plPct = ((stock.current - stock.avgCost) / stock.avgCost * 100) * ((stock.dir || "long") === "short" ? -1 : 1);
  const marketVal = stock.current * stock.shares;
  const costBasis = stock.avgCost * stock.shares;
  const isUp = stock.change >= 0;
  const plUp = pl >= 0;
  const color = isUp ? "#5B8C5A" : "#EF5350";

  return (
    <div style={{ animation: "slideRight .3s ease both" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <button onClick={onBack} style={{ background: "#fff", borderRadius: 10, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>←</button>
        <StockLogo ticker={stock.ticker} size={40} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: "#333334" }}>{stock.name}</div>
          <div style={{ fontSize: 14, color: "#33333480", fontFamily: "JetBrains Mono" }}>{stock.ticker} · {basketName}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: (stock.dir === "short" ? "#FFEBEE" : "#FFF8EE"), color: (stock.dir === "short" ? "#EF5350" : "#C48830"), textTransform: "uppercase" }}>{stock.dir || "long"}</div>
        </div>
      </div>

      {/* Price hero */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "14px 14px 10px", marginBottom: 8 }}>
        <div style={{ fontSize: 42, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: "#333334", letterSpacing: "-1px" }}>${stock.current >= 1000 ? stock.current.toLocaleString() : stock.current.toFixed(2)}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          <span style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700, color }}>{isUp ? "▲" : "▼"} {isUp ? "+" : ""}{stock.change}%</span>
          <span style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700, color, background: color + "12", padding: "2px 6px", borderRadius: 5 }}>{isUp ? "+" : ""}{(stock.current * stock.change / 100).toFixed(2)}</span>
          <span style={{ fontSize: 12, color: "#33333480" }}>Today</span>
        </div>
        <div style={{ margin: "12px 0 6px", position: "relative" }}>
          {chartLoading && <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,253,245,0.7)", zIndex: 2, borderRadius: 8 }}><span style={{ fontSize: 14, color: "#A09080", fontWeight: 700 }}>Loading chart...</span></div>}
          <MiniChart data={history} color={color} chartId={"stock_" + stock.ticker.replace(/[^a-zA-Z]/g, "") + "_" + period} />
        </div>
        <div style={{ display: "flex", gap: 1, background: "#FFFDF5", borderRadius: 8, padding: 2, width: "fit-content" }}>
          {["1D","1W","1M","3M","1Y","ALL"].map(t => <button key={t} onClick={() => setPeriod(t)} style={{ padding: "3px 8px", borderRadius: 6, border: "none", background: period === t ? "#fff" : "transparent", color: period === t ? "#C48830" : "#A09080", fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: period === t ? "0 1px 4px rgba(0,0,0,.06)" : "none" }}>{t}</button>)}
        </div>
      </div>

      {/* Your Position */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>Your Position</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[
            { label: "Shares", value: stock.shares.toString(), color: "#333334" },
            { label: "Market Value", value: "$" + (marketVal >= 1000 ? (marketVal / 1000).toFixed(2) + "k" : marketVal.toFixed(0)), color: "#333334" },
            { label: "Avg Cost", value: "$" + (stock.avgCost >= 1000 ? stock.avgCost.toLocaleString() : stock.avgCost.toFixed(2)), color: "#33333480" },
            { label: "Cost Basis", value: "$" + (costBasis >= 1000 ? (costBasis / 1000).toFixed(2) + "k" : costBasis.toFixed(0)), color: "#33333480" },
            { label: "Total Return", value: (plUp ? "+" : "") + "$" + Math.abs(Math.round(pl)).toLocaleString(), color: plUp ? "#5B8C5A" : "#EF5350" },
            { label: "Return %", value: (plUp ? "+" : "") + plPct.toFixed(2) + "%", color: plUp ? "#5B8C5A" : "#EF5350" },
          ].map((m, i) => (
            <div key={i} style={{ background: "#FFFDF5", borderRadius: 8, padding: "7px 8px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#33333480", textTransform: "uppercase" }}>{m.label}</div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 800, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Stats */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 8 }}>Key Stats</div>
        {[
          { label: "Prev Close", val: "$" + (stock._prevClose || stock.current).toFixed(2) },
          { label: "Day High", val: "$" + (stock._dayHigh || stock.current).toFixed(2) },
          { label: "Day Low", val: "$" + (stock._dayLow || stock.current).toFixed(2) },
          { label: "52W High", val: chartMeta.fiftyTwoWeekHigh ? "$" + chartMeta.fiftyTwoWeekHigh.toFixed(2) : "—" },
          { label: "52W Low", val: chartMeta.fiftyTwoWeekLow ? "$" + chartMeta.fiftyTwoWeekLow.toFixed(2) : "—" },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none" }}>
            <span style={{ fontSize: 14, color: "#33333480", fontWeight: 600 }}>{s.label}</span>
            <span style={{ fontSize: 14, fontFamily: "JetBrains Mono", fontWeight: 700, color: "#333334" }}>{s.val}</span>
          </div>
        ))}
      </div>

      {/* Buy / Sell Actions */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          <button onClick={() => setOrderType(orderType === "buy" ? null : "buy")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: orderType === "buy" ? "#5B8C5A" : "#EDF5ED", color: orderType === "buy" ? "#fff" : "#5B8C5A", fontSize: 17, fontWeight: 900, cursor: "pointer", fontFamily: "'Instrument Serif', serif" }}>Buy</button>
          <button onClick={() => setOrderType(orderType === "sell" ? null : "sell")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: orderType === "sell" ? "#EF5350" : "#FFEBEE", color: orderType === "sell" ? "#fff" : "#EF5350", fontSize: 17, fontWeight: 900, cursor: "pointer", fontFamily: "'Instrument Serif', serif" }}>Sell</button>
        </div>
        {orderType && (
          <div style={{ animation: "fadeUp .2s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#33333480" }}>Shares</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => setShares(Math.max(1, shares - 1))} style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid #33333440", background: "#fff", cursor: "pointer", fontSize: 18, fontWeight: 700, color: "#EF5350", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 21, fontWeight: 900, color: "#333334", minWidth: 24, textAlign: "center" }}>{shares}</span>
                <button onClick={() => setShares(shares + 1)} style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid #33333440", background: "#fff", cursor: "pointer", fontSize: 18, fontWeight: 700, color: "#5B8C5A", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#33333480" }}>Market Price</span>
              <span style={{ fontSize: 14, fontFamily: "JetBrains Mono", fontWeight: 700 }}>${stock.current.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid #33333420" }}>
              <span style={{ fontSize: 12, color: "#33333480" }}>Est. Total</span>
              <span style={{ fontSize: 17, fontFamily: "'Instrument Serif', serif", fontWeight: 900, color: "#333334" }}>${(stock.current * shares).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <button style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: orderType === "buy" ? "linear-gradient(135deg,#5B8C5A,#4CAF50)" : "linear-gradient(135deg,#EF5350,#E53935)", color: "#fff", fontSize: 17, fontWeight: 900, cursor: "pointer", fontFamily: "'Instrument Serif', serif" }}>
              {orderType === "buy" ? "cart" : "upload"} {orderType === "buy" ? "Buy" : "Sell"} {shares} {shares === 1 ? "Share" : "Shares"}
            </button>
          </div>
        )}
      </div>

      {/* Full Details Button */}
      {onGoToStock && /^[A-Z.]{1,6}$/.test(stock.ticker) && (
        <button onClick={() => onGoToStock(stock.ticker)} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1.5px solid #C4883044", background: "#FFF8EE", color: "#C48830", fontSize: 15, fontWeight: 900, cursor: "pointer", fontFamily: "'Instrument Serif', serif", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Icon name="chart-bar" size={12} color="#C48830" /> View Full Stock Page →
        </button>
      )}
    </div>
  );
}

// ═══════════════ AI EXECUTION AGENT ═══════════════

function AIAgent({ onNotify, onNavigate, agentInsights, isOpen, onClose }) {
  const [mode, setMode] = useState("closed"); // "closed" | "chat" | "closing"
  useEffect(() => { if (isOpen && mode === "closed") setMode("chat"); }, [isOpen]);
  const closeChat = () => { setMode("closing"); setTimeout(() => { setMode("closed"); if (onClose) onClose(); }, 350); };
  const [chatMode, setChatMode] = useState("agent"); // "agent" | "plan" | "ask"
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [executedActions, setExecutedActions] = useState(new Set());
  const [chatTopic, setChatTopic] = useState(null);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  const scrollBottom = () => { setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, 50); };

  const portfolioContext = () => {
    const tv = myBaskets.reduce((s, b) => s + b.value, 0);
    const tc = myBaskets.reduce((s, b) => s + b.costBasis, 0);
    const tp = tv - tc;
    const dp = myBaskets.reduce((s, b) => s + b.dayPL, 0);
    return `PORTFOLIO SNAPSHOT (as of Feb 6, 2026):
Total Value: $${tv.toLocaleString()} | Cost Basis: $${tc.toLocaleString()} | Total P&L: ${tp >= 0 ? "+" : "-"}$${Math.abs(tp).toLocaleString()} | Today: ${dp >= 0 ? "+" : "-"}$${Math.abs(dp).toLocaleString()}

BASKETS:
${myBaskets.map(b => {
  const rm = basketRiskMetrics[b.id];
  const health = getBasketHealth(b);
  return `- ${b.icon} ${b.name} (${b.strategy}): Value $${b.value.toLocaleString()}, Change ${b.change}%, P&L ${b.totalPL >= 0 ? "+" : ""}$${b.totalPL.toLocaleString()}, Allocation ${b.allocation}%, Health: ${health.label}${rm ? `, Sharpe ${rm.sharpe}, Beta ${rm.beta}, Alpha ${rm.alpha}%, Vol ${rm.volatility}%, MaxDD ${rm.maxDD}%` : ""}
  Holdings: ${(basketStocks[b.id] || []).map(s => `${s.ticker} (${s.shares} shares @ $${s.avgCost} → $${s.current}, ${s.change >= 0 ? "+" : ""}${s.change}%)`).join(", ")}`;
}).join("\n")}

MACRO REGIME: ${(agentInsights?.regime || currentRegime).name} (${(agentInsights?.regime || currentRegime).confidence}% confidence) — ${(agentInsights?.regime || currentRegime).desc}
Playbook: ${(agentInsights?.regime || currentRegime).playbook}

KEY INDICATORS: ${macroIndicators.map(i => `${i.name}: ${i.value}${i.unit} (${i.signal})`).join(", ")}

PORTFOLIO RISK: Sharpe ${portfolioRisk.sharpe}, Beta ${portfolioRisk.beta}, Vol ${portfolioRisk.volatility}%, MaxDD ${portfolioRisk.maxDrawdown}%, VaR95 -$${Math.abs(portfolioRisk.var95)}, Concentration: ${portfolioRisk.sectorConcentration}% (top: ${portfolioRisk.topHolding.ticker} at ${portfolioRisk.topHolding.pct}%)

ACTIVE SIGNALS: ${(agentInsights?.signals || tradeSignals).map(s => `${s.signal} ${s.ticker} — ${s.reason} (${s.strength}%)`).join("; ")}

HEDGE RECOMMENDATIONS: ${(agentInsights?.hedges || hedgeRecommendations).map(h => `${h.action} ${h.instrument} — ${h.desc} (${h.priority})`).join("; ")}

OPTIMAL ALLOCATION (for ${(agentInsights?.regime || currentRegime).name}): ${optimalAllocation.map(a => `${a.basket}: ${a.current}% → ${a.optimal}% (${a.delta > 0 ? "+" : ""}${a.delta}%)`).join(", ")}`;
  };

  const openChat = (topic, prompt) => {
    setChatTopic(topic);
    setMode("chat");
    setMessages([]);
    setTimeout(() => inputRef.current?.focus(), 200);
    if (prompt) sendMessage(prompt);
  };

  const modeSystemPrompts = {
    agent: `You are the AI Execution Agent for Hatch, a macro-driven portfolio management platform. You TAKE ACTIONS autonomously. Analyze data, make decisions, and execute trades.

${portfolioContext()}

BEHAVIOR:
- Be decisive and action-oriented. Don't just suggest — DO.
- Automatically include ACTION blocks for every recommendation.
- Execute multi-step strategies: analyze → decide → act.
- Reference live portfolio data, macro regime, and risk metrics.
- Keep responses under 200 words. Be direct like a trading terminal.

ACTION FORMAT (include on its own line):
[ACTION:TYPE:DETAILS:LABEL]
TYPE: REBALANCE, BUY, SELL, TRIM, HEDGE, ROTATE, ANALYZE
Include multiple actions when needed.`,

    plan: `You are the AI Planning Agent for Hatch. You CREATE DETAILED PLANS but do NOT execute. You outline step-by-step strategies for user approval.

${portfolioContext()}

BEHAVIOR:
- Structure responses as numbered plans with clear steps.
- For each step, explain the WHY, WHAT, and EXPECTED OUTCOME.
- Include risk considerations and alternative approaches.
- Use data from the portfolio to make plans specific and quantified.
- End with a summary: estimated impact, timeline, and risks.
- Do NOT include ACTION blocks — plans are for review, not execution.
- Keep responses under 300 words. Use bullet points and structure.`,

    ask: `You are the AI Research Assistant for Hatch. You ANSWER QUESTIONS and provide analysis. You do NOT suggest trades or actions unless explicitly asked.

${portfolioContext()}

BEHAVIOR:
- Focus on education, explanation, and analysis.
- Explain market concepts, portfolio metrics, and macro trends.
- Reference the user's actual portfolio data when relevant.
- Be conversational but precise with numbers.
- Do NOT include ACTION blocks — this is informational only.
- Keep responses under 250 words. Be clear and helpful.`
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    scrollBottom();

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1200,
          system: modeSystemPrompts[chatMode],
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const aiText = data.content?.map(c => c.text || "").join("\n") || "I couldn't process that request. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: aiText }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error — I'm unable to reach the AI service right now. Please check your connection and try again." }]);
    }
    setLoading(false);
    scrollBottom();
  };

  const executeAction = (action, idx) => {
    setExecutedActions(prev => new Set([...prev, idx]));
    onNotify("\u2713 " + action.label + " — executed");
  };

  const parseMessage = (text) => {
    const parts = [];
    const lines = text.split("\n");
    let currentText = [];
    lines.forEach(line => {
      const actionMatch = line.match(/\[ACTION:(\w+):([^:]+):([^\]]+)\]/);
      if (actionMatch) {
        if (currentText.length > 0) { parts.push({ type: "text", content: currentText.join("\n") }); currentText = []; }
        parts.push({ type: "action", actionType: actionMatch[1], details: actionMatch[2], label: actionMatch[3] });
      } else { currentText.push(line); }
    });
    if (currentText.length > 0) parts.push({ type: "text", content: currentText.join("\n") });
    return parts;
  };

  const formatText = (text) => {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} style={{ fontWeight: 800, color: "#333334" }}>{part.slice(2, -2)}</strong>;
      return part;
    });
  };

  // Menu items with sun-ray positions (fan upward from center egg)
  const menuItems = [
    { icon: "chart-pie", label: "Portfolio", color: "#C48830", angle: 220, dist: 115, prompt: "Give me a full analysis of my portfolio — what's working, what's not, and what I should do about it given the current macro regime." },
    { icon: "trending-up", label: "Trades", color: "#5B8C5A", angle: 252, dist: 110, prompt: "Create a specific rebalance plan for my portfolio based on the current macro regime. Show me exactly what % to shift and why." },
    { icon: "message-circle", label: "Chat", color: "#D4A03C", angle: 270, dist: 120, prompt: null },
    { icon: "globe", label: "Macro", color: "#42A5F5", angle: 288, dist: 110, prompt: "What's the macro outlook right now? How should I position my portfolio for the next 3-6 months?" },
    { icon: "shield", label: "Risk", color: "#AB47BC", angle: 320, dist: 115, prompt: "What hedges should I put on right now given the macro environment? Be specific about instruments, sizing, and cost." },
  ];

  // Compute x,y from angle+distance for sun-ray positioning
  const rayPos = (angle, dist) => ({
    tx: Math.cos(angle * Math.PI / 180) * dist + "px",
    ty: Math.sin(angle * Math.PI / 180) * dist + "px",
  });

  // Auto-close menu after 4 seconds
  const menuTimer = useRef(null);
  const [menuClosing, setMenuClosing] = useState(false);
  useEffect(() => {
    if (mode === "menu") {
      setMenuClosing(false);
      menuTimer.current = setTimeout(() => {
        setMenuClosing(true);
        setTimeout(() => setMode("closed"), 400);
      }, 4000);
    }
    return () => { if (menuTimer.current) clearTimeout(menuTimer.current); };
  }, [mode]);

  const handleMenuClick = (item) => {
    if (menuTimer.current) clearTimeout(menuTimer.current);
    openChat(item.label, item.prompt);
  };

  // Golden Egg SVG — clean bright warm 3D gold
  const GoldenEgg = ({ size = 56 }) => (
    <svg width={size} height={size * 1.25} viewBox="0 0 56 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="eggBase" cx="50%" cy="38%" r="62%" fx="48%" fy="34%">
          <stop offset="0%" stopColor="#FFE07A" />
          <stop offset="25%" stopColor="#F0C048" />
          <stop offset="50%" stopColor="#DDA630" />
          <stop offset="75%" stopColor="#C08A20" />
          <stop offset="100%" stopColor="#9A6A14" />
        </radialGradient>
        <radialGradient id="eggHighlight" cx="55%" cy="22%" r="40%" fx="53%" fy="18%">
          <stop offset="0%" stopColor="#FFF4C8" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#FFE78A" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#F0C048" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="eggLeftDark" cx="10%" cy="50%" r="42%">
          <stop offset="0%" stopColor="#8A6010" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8A6010" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="eggRightEdge" cx="92%" cy="45%" r="32%">
          <stop offset="0%" stopColor="#9A6A14" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#9A6A14" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="eggBottom" cx="50%" cy="92%" r="38%">
          <stop offset="0%" stopColor="#7A5510" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#7A5510" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="28" cy="37" rx="22" ry="28" fill="url(#eggBase)" />
      <ellipse cx="28" cy="37" rx="22" ry="28" fill="url(#eggLeftDark)" />
      <ellipse cx="28" cy="37" rx="22" ry="28" fill="url(#eggRightEdge)" />
      <ellipse cx="28" cy="37" rx="22" ry="28" fill="url(#eggBottom)" />
      <ellipse cx="28" cy="37" rx="22" ry="28" fill="url(#eggHighlight)" />
      <ellipse cx="30" cy="23" rx="8" ry="8" fill="#FFF4C8" opacity="0.25" />
    </svg>
  );

  const GoldenEggSmall = ({ size = 20 }) => (
    <svg width={size} height={size * 1.25} viewBox="0 0 56 70" fill="none">
      <defs>
        <radialGradient id="eggSm" cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#FFE07A" />
          <stop offset="35%" stopColor="#DDA630" />
          <stop offset="70%" stopColor="#C08A20" />
          <stop offset="100%" stopColor="#9A6A14" />
        </radialGradient>
        <radialGradient id="eggSmHi" cx="55%" cy="22%" r="38%">
          <stop offset="0%" stopColor="#FFF4C8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#F0C048" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="28" cy="37" rx="22" ry="28" fill="url(#eggSm)" />
      <ellipse cx="28" cy="37" rx="22" ry="28" fill="url(#eggSmHi)" />
    </svg>
  );

  return (
    <>
      {/* Chat Panel */}
      {(mode === "chat" || mode === "closing") && (() => {
        const modeConfig = {
          agent: { icon: "bolt", label: "Agent", color: "#C48830", desc: "Autonomous execution", placeholder: "Tell Hatch what to do..." },
          plan: { icon: "compass", label: "Plan", color: "#AB47BC", desc: "Strategy before action", placeholder: "What should we plan?" },
          ask: { icon: "search", label: "Ask", color: "#26A69A", desc: "Research & learn", placeholder: "Ask anything..." },
        };
        const mc = modeConfig[chatMode];
        return (
        <div style={{ position: "fixed", bottom: 16, left: 62, width: 380, height: 520, background: "#fff", zIndex: 310, display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,.15)", border: "1px solid #F0E6D0", animation: `${mode === "closing" ? "slideDown" : "slideUp"} .35s cubic-bezier(.22,.68,.36,1) forwards` }}>
          {/* Header */}
          <div style={{ padding: "10px 16px", borderBottom: "1px solid #F0F0F0", background: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
              <GoldenEggSmall size={18} />
              <span style={{ fontSize: 16, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: "#2C2C2C" }}>Hatch AI</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: mc.color, background: mc.color + "14", padding: "2px 8px", borderRadius: 10, fontFamily: "Quicksand" }}>{mc.label}</span>
            </div>
            <button onClick={() => { setMessages([]); setChatTopic(null); setExecutedActions(new Set()); }}
              style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #E8E8E8", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="plus" size={13} color="#888" />
            </button>
            <button onClick={closeChat}
              style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "#f5f5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="chevron-down" size={14} color="#888" />
            </button>
          </div>

          {/* Messages area */}
          <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Welcome screen */}
            {messages.length === 0 && !loading && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "20px 0" }}>
                <GoldenEggSmall size={44} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: "#2C2C2C", marginBottom: 4 }}>What can I help with?</div>
                  <div style={{ fontSize: 13, color: "#999" }}>Choose a mode to get started</div>
                </div>

                {/* Mode selector cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", maxWidth: 340 }}>
                  {[
                    { id: "agent", icon: "bolt", label: "Agent", desc: "Analyze & execute trades autonomously", color: "#C48830", examples: ["Rebalance for macro", "Best trades now"] },
                    { id: "plan", icon: "compass", label: "Plan", desc: "Step-by-step strategy for review", color: "#AB47BC", examples: ["Q1 strategy", "Sector rotation"] },
                    { id: "ask", icon: "search", label: "Ask", desc: "Research, insights & education", color: "#26A69A", examples: ["Why Sharpe low?", "Macro regime"] },
                  ].map(m => (
                    <button key={m.id} onClick={() => { setChatMode(m.id); setTimeout(() => inputRef.current?.focus(), 100); }}
                      style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 12, border: chatMode === m.id ? `2px solid ${m.color}` : "1.5px solid #E8E8E8", background: chatMode === m.id ? m.color + "08" : "#fff", cursor: "pointer", textAlign: "left", transition: "all .15s" }}
                      onMouseEnter={e => { if (chatMode !== m.id) e.currentTarget.style.borderColor = m.color + "50"; }}
                      onMouseLeave={e => { if (chatMode !== m.id) e.currentTarget.style.borderColor = "#E8E8E8"; }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: chatMode === m.id ? m.color : m.color + "14", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}>
                        <Icon name={m.icon} size={13} color={chatMode === m.id ? "#fff" : m.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#2C2C2C", fontFamily: "Quicksand", marginBottom: 1 }}>{m.label}</div>
                        <div style={{ fontSize: 12, color: "#777", lineHeight: 1.3 }}>{m.desc}</div>
                        <div style={{ display: "flex", gap: 3, marginTop: 4, flexWrap: "wrap" }}>
                          {m.examples.map((ex, i) => (
                            <span key={i} onClick={e => { e.stopPropagation(); setChatMode(m.id); sendMessage(ex); }}
                              style={{ fontSize: 11, padding: "2px 6px", borderRadius: 6, background: m.color + "10", color: m.color, fontWeight: 700, cursor: "pointer", fontFamily: "Quicksand" }}>{ex}</span>
                          ))}
                        </div>
                      </div>
                      {chatMode === m.id && <div style={{ width: 6, height: 6, borderRadius: "50%", background: m.color, flexShrink: 0, marginTop: 3 }} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((msg, mi) => (
              <div key={mi} style={{ display: "flex", gap: 8, justifyContent: msg.role === "user" ? "flex-end" : "flex-start", animation: "fadeUp .2s ease both" }}>
                {msg.role !== "user" && (
                  <div style={{ width: 24, height: 30, display: "flex", alignItems: "flex-start", justifyContent: "center", flexShrink: 0, paddingTop: 2 }}>
                    <GoldenEggSmall size={16} />
                  </div>
                )}
                <div style={{ maxWidth: "80%", borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: "8px 12px", background: msg.role === "user" ? "#2C2C2C" : "#F7F7F8", color: msg.role === "user" ? "#fff" : "#2C2C2C", fontSize: 13, lineHeight: 1.5 }}>
                  {msg.role === "user" ? msg.content : (
                    <div>
                      {parseMessage(msg.content).map((part, pi) => {
                        if (part.type === "text") return <div key={pi} style={{ whiteSpace: "pre-wrap" }}>{formatText(part.content)}</div>;
                        const actionIdx = mi + "_" + pi;
                        const executed = executedActions.has(actionIdx);
                        const aCol = { REBALANCE: "#FFA726", BUY: "#26A69A", SELL: "#EF5350", TRIM: "#FFA726", HEDGE: "#AB47BC", ROTATE: "#42A5F5", ANALYZE: "#C48830" };
                        return (
                          <button key={pi} onClick={() => !executed && executeAction(part, actionIdx)}
                            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", margin: "6px 0", padding: "8px 10px", borderRadius: 10, border: `1.5px solid ${executed ? "#26A69A" : "#E8E8E8"}`, background: executed ? "#F0FFF4" : "#fff", cursor: executed ? "default" : "pointer", transition: "all .2s", textAlign: "left" }}>
                            <div style={{ width: 26, height: 26, borderRadius: 8, background: executed ? "#26A69A" : (aCol[part.actionType] || "#C48830"), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 17, fontWeight: 900, flexShrink: 0 }}>
                              {executed ? "\u2713" : part.actionType.charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 15, fontWeight: 800, color: "#2C2C2C" }}>{executed ? "Done: " : ""}{part.label}</div>
                              <div style={{ fontSize: 14, color: "#888" }}>{part.details}</div>
                            </div>
                            {!executed && <span style={{ fontSize: 14, fontWeight: 800, color: aCol[part.actionType] || "#C48830", whiteSpace: "nowrap" }}>Run</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 8, padding: "4px 0", animation: "fadeUp .2s ease both" }}>
                <div style={{ width: 24, height: 30, display: "flex", alignItems: "flex-start", justifyContent: "center", flexShrink: 0, paddingTop: 2 }}><GoldenEggSmall size={16} /></div>
                <div style={{ background: "#F7F7F8", borderRadius: "14px 14px 14px 4px", padding: "12px 16px", display: "flex", gap: 4, alignItems: "center" }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: mc.color, animation: `pulse 1.2s ease ${i * 0.15}s infinite` }} />)}
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid #F0F0F0", background: "#fff" }}>
            {/* Mode switcher pills */}
            <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
              {[
                { id: "agent", icon: "bolt", label: "Agent", color: "#C48830" },
                { id: "plan", icon: "compass", label: "Plan", color: "#AB47BC" },
                { id: "ask", icon: "search", label: "Ask", color: "#26A69A" },
              ].map(m => (
                <button key={m.id} onClick={() => setChatMode(m.id)}
                  style={{ padding: "4px 10px", borderRadius: 16, border: chatMode === m.id ? `1.5px solid ${m.color}` : "1.5px solid #E8E8E8", background: chatMode === m.id ? m.color + "10" : "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", color: chatMode === m.id ? m.color : "#888", display: "flex", alignItems: "center", gap: 3, fontFamily: "Quicksand", transition: "all .15s" }}>
                  <Icon name={m.icon} size={9} color={chatMode === m.id ? m.color : "#aaa"} /> {m.label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                  placeholder={mc.placeholder}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 18, border: "1.5px solid #E8E8E8", fontSize: 13, fontFamily: "Quicksand", outline: "none", background: "#F7F7F8", boxSizing: "border-box" }}
                  onFocus={e => { e.target.style.borderColor = mc.color; e.target.style.background = "#fff"; }}
                  onBlur={e => { e.target.style.borderColor = "#E8E8E8"; e.target.style.background = "#F7F7F8"; }} />
              </div>
              <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
                style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: loading || !input.trim() ? "#E8E8E8" : mc.color, color: "#fff", cursor: loading || !input.trim() ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .15s" }}>
                <Icon name="send" size={12} color="#fff" />
              </button>
            </div>
          </div>
        </div>
        );
      })()}
    </>
  );
}

// ═══════════════ MACRO TIDES DATA ═══════════════

const tideAssets = [
  // Above the tide (expensive / elevated / overheated)
  { id:"ai_semis", name:"AI & Semis", ticker:"NVDA/AMD/AVGO", type:"equity", level:82, fair:45, icon:"bolt", color:"#AB47BC", desc:"AI hype has pushed semiconductor valuations to extreme levels. P/E ratios 2-3x historical norms.", cascade:["value_stocks","bonds","gold"], cascadeDir:"up" },
  { id:"us_mega", name:"US Mega-Cap Tech", ticker:"AAPL/MSFT/GOOGL", type:"equity", level:71, fair:50, icon:"laptop", color:"#42A5F5", desc:"Concentration at all-time highs. Top 7 stocks = 30%+ of S&P 500.", cascade:["intl_equities","small_caps","em_equities"], cascadeDir:"up" },
  { id:"us_rates", name:"US Interest Rates", ticker:"Fed Funds 5.25%", type:"macro", level:78, fair:40, icon:"bank", color:"#EF5350", desc:"Rates at 23-year highs. When the tide pulls back here, duration assets and rate-sensitive sectors surge.", cascade:["reits","growth","bonds","emerging"], cascadeDir:"up" },
  { id:"us_dollar", name:"US Dollar (DXY)", ticker:"DXY 104.2", type:"forex", level:68, fair:50, icon:"dollar", color:"#C48830", desc:"Strong dollar crushing EM returns and commodity demand. A reversal lifts global risk assets.", cascade:["gold","em_equities","commodities"], cascadeDir:"up" },
  { id:"oil", name:"Crude Oil", ticker:"CL $85.40", type:"future", level:64, fair:48, icon:"oil-barrel", color:"#5C4A1E", desc:"Above long-term equilibrium on supply cuts. Vulnerable to demand slowdown.", cascade:["airlines","consumer","transports"], cascadeDir:"up" },
  { id:"credit_spreads", name:"Credit Spreads", ticker:"HY OAS", type:"bond", level:35, fair:50, icon:"clipboard", color:"#FFA726", desc:"Spreads tight — markets pricing no recession. Complacency risk if growth slows.", cascade:["treasuries","gold","cash"], cascadeDir:"up" },

  // Below the tide (cheap / depressed / unloved)
  { id:"value_stocks", name:"Value / Small-Cap", ticker:"IWM/IWD", type:"equity", level:28, fair:50, icon:"tag", color:"#C48830", desc:"Deepest discount to growth in 25 years. Mean reversion historically powerful.", cascade:["us_mega","ai_semis"], cascadeDir:"down" },
  { id:"intl_equities", name:"International Equities", ticker:"EFA/VEU", type:"equity", level:22, fair:48, icon:"globe", color:"#42A5F5", desc:"Europe and Japan trading at 40%+ discount to US on P/E. Currency tailwind if USD weakens.", cascade:["us_mega","us_dollar"], cascadeDir:"down" },
  { id:"bonds", name:"Long-Duration Bonds", ticker:"TLT/ZB", type:"bond", level:18, fair:50, icon:"building", color:"#C48830", desc:"Worst drawdown in bond history. When rates fall, these assets see the largest gains.", cascade:["us_rates"], cascadeDir:"down" },
  { id:"reits", name:"REITs", ticker:"VNQ/O/AMT", type:"equity", level:24, fair:45, icon:"home", color:"#FFA726", desc:"Rate-crushed sector. Historically first to recover when Fed pivots.", cascade:["us_rates"], cascadeDir:"down" },
  { id:"gold", name:"Gold & Precious Metals", ticker:"GLD/GC $2,185", type:"future", level:55, fair:50, icon:"gold-medal", color:"#FFA726", desc:"Near fair value but poised to break out on rate cuts and de-dollarization.", cascade:["us_dollar","us_rates"], cascadeDir:"down" },
  { id:"em_equities", name:"Emerging Markets", ticker:"EEM/VWO", type:"equity", level:20, fair:50, icon:"globe-asia", color:"#C48830", desc:"Beaten down by strong dollar and China weakness. Deep value if macro shifts.", cascade:["us_dollar","us_rates"], cascadeDir:"down" },
  { id:"clean_energy", name:"Clean Energy", ticker:"ICLN/TAN", type:"equity", level:14, fair:42, icon:"seedling", color:"#C48830", desc:"Down 60%+ from highs. Rate-sensitive long-duration growth. Maximum pain territory.", cascade:["us_rates","oil"], cascadeDir:"down" },
  { id:"commodities", name:"Broad Commodities", ticker:"DBC/GSG", type:"future", level:32, fair:50, icon:"pickaxe", color:"#C48830", desc:"Below long-term average. Supply underinvestment creates setup for next cycle.", cascade:["us_dollar"], cascadeDir:"down" },
];

// Map macro regime to a tide level: where the "water" naturally sits given current conditions
const regimeTideMap = {
  Goldilocks: 55,    // Slightly elevated — calm waters, everything looks fair
  Reflation: 65,     // Rising tide — risk assets pumped, cheap stuff stays submerged
  Stagflation: 30,   // Tide drains out — everything exposed, nothing safe
  "Risk-Off": 35,    // Receding tide — flight to safety, risk assets sink
};

function MacroTidesPage() {
  const regimeTide = regimeTideMap[currentRegime.name] || 50;
  const [tideLevel, setTideLevel] = useState(regimeTide);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const tideShift = (tideLevel - 50) / 50;

  const getAdjustedLevel = (asset) => {
    const base = asset.level;
    if (tideShift < 0 && base > 50) return base + tideShift * (base - 50) * 1.4;
    if (tideShift < 0 && base <= 50) return base - tideShift * (50 - base) * 0.9;
    if (tideShift > 0 && base > 50) return Math.min(98, base + tideShift * (100 - base) * 0.6);
    if (tideShift > 0 && base <= 50) return Math.max(2, base - tideShift * base * 0.7);
    return base;
  };

  const waterPct = 50 - tideShift * 18;
  const selected = selectedAsset ? tideAssets.find(a => a.id === selectedAsset) : null;
  const cascadeTargets = selected ? tideAssets.filter(a => (selected.cascade || []).includes(a.id)) : [];
  const aboveAssets = tideAssets.filter(a => getAdjustedLevel(a) > 50);
  const belowAssets = tideAssets.filter(a => getAdjustedLevel(a) <= 50);

  return (
    <div>
      <div style={{ marginBottom: 8, animation: "fadeUp .3s ease both" }}>
        <h1 style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>Macro Tides</h1>
        <p style={{ color: "#33333480", fontSize: 15, marginTop: 3 }}>The waterline reflects the current <span style={{ color: currentRegime.color, fontWeight: 800 }}>{currentRegime.name}</span> regime. What's above is overvalued. What's submerged is cheap. Drag to simulate scenarios.</p>
      </div>

      {/* ── Current Regime Status ── */}
      <div style={{ background: currentRegime.bg, border: `1.5px solid ${currentRegime.color}33`, borderRadius: 18, padding: "14px 18px", marginBottom: 8, animation: "fadeUp .35s ease .05s both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: currentRegime.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name={currentRegime.icon} size={18} color={currentRegime.color} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: currentRegime.color }}>{currentRegime.name}</span>
                <span style={{ fontSize: 12, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: "#fff", color: currentRegime.color, border: `1px solid ${currentRegime.color}33` }}>ACTIVE REGIME</span>
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "JetBrains Mono", color: currentRegime.color + "aa" }}>{currentRegime.confidence}% confidence</span>
              </div>
              <div style={{ fontSize: 15, color: "#33333480", marginTop: 2, lineHeight: 1.4 }}>{currentRegime.desc}</div>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 8 }}>
          {macroIndicators.filter(i => ["gdp", "cpi", "pmi", "vix"].includes(i.id)).map(ind => (
            <div key={ind.id} style={{ background: "#fff", borderRadius: 12, padding: "8px 10px", textAlign: "center", border: "1px solid #33333410" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#33333480", textTransform: "uppercase", marginBottom: 3 }}>{ind.name}</div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 20, fontWeight: 700, color: ind.signal === "bullish" ? "#5B8C5A" : ind.signal === "bearish" ? "#EF5350" : "#FFA726" }}>
                {ind.value}{ind.unit}
              </div>
              <div style={{ fontSize: 12, color: "#33333460", marginTop: 2 }}>
                prev {ind.prev}{ind.unit} <span style={{ color: ind.trend === "up" ? "#5B8C5A" : ind.trend === "down" ? "#EF5350" : "#FFA726", fontWeight: 700 }}>{ind.trend === "up" ? "▲" : ind.trend === "down" ? "▼" : "—"}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "8px 12px", background: "#fff", borderRadius: 12, border: `1px solid ${currentRegime.color}22` }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: currentRegime.color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Playbook</div>
          <div style={{ fontSize: 15, color: "#5A4A3A", lineHeight: 1.5 }}>{currentRegime.playbook}</div>
        </div>
      </div>

      {/* ── Tide Controller ── */}
      <div style={{ background: "#fff", borderRadius: 18, padding: "16px 22px", marginBottom: 8, animation: "fadeUp .4s ease .1s both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}></span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif" }}>Tide Control</div>
              <div style={{ fontSize: 15, color: "#33333480" }}>Regime sets the baseline. Drag to simulate scenarios from here.</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 17, fontWeight: 800, padding: "4px 12px", borderRadius: 10, background: tideLevel < 35 ? "#FFEBEE" : tideLevel > 65 ? "#FFF8EE" : "#FFF3E0", color: tideLevel < 35 ? "#EF5350" : tideLevel > 65 ? "#C48830" : "#FFA726" }}>
              {tideLevel < 25 ? "Crash" : tideLevel < 40 ? "Correction" : tideLevel > 75 ? "FOMO" : tideLevel > 60 ? "Risk-On" : "Current"}
            </span>
            <button onClick={() => setTideLevel(regimeTide)} style={{ padding: "4px 10px", borderRadius: 8, border: "1px solid #F0E6D0", background: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", color: "#8A7040" }}>Reset to Regime</button>
          </div>
        </div>
        <div style={{ position: "relative", height: 38, display: "flex", alignItems: "center" }}>
          <div style={{ position: "absolute", left: 0, right: 0, height: 10, borderRadius: 5, background: "linear-gradient(90deg, #EF5350 0%, #EF5350 20%, #FFA726 35%, #F0E6D0 50%, #FFA726 65%, #C48830 80%, #C48830 100%)" }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 2, height: 18, background: "#8A7040", borderRadius: 1, zIndex: 1 }} />
          <input type="range" min="0" max="100" value={tideLevel}
            onChange={e => setTideLevel(Number(e.target.value))}
            style={{ position: "relative", width: "100%", height: 38, appearance: "none", background: "transparent", cursor: "pointer", zIndex: 2, WebkitAppearance: "none", outline: "none" }} />
          <style>{`input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#C48830,#EF5350);border:3px solid #fff;box-shadow:0 2px 10px rgba(212,113,78,.4);cursor:grab}input[type=range]::-webkit-slider-thumb:active{cursor:grabbing;transform:scale(1.15)}`}</style>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#33333480", marginTop: 3 }}>
          <span>Tide pulls back</span><span style={{ color: currentRegime.color, fontWeight: 900 }}>▼ {currentRegime.name}</span><span>Everything pumps</span>
        </div>
      </div>

      {/* ── The Ocean ── */}
      <div style={{ position: "relative", background: "linear-gradient(180deg, #F0F4FA 0%, #E8EEF8 " + waterPct + "%, #D4E4F4 " + (waterPct + 2) + "%, #C4D8EC " + (waterPct + 20) + "%, #B0CCE4 100%)", border: "1px solid #33333440", borderRadius: 14, overflow: "hidden", marginBottom: 8, animation: "fadeUp .4s ease .15s both", minHeight: 440 }}>

        {/* Zone labels */}
        <div style={{ position: "absolute", top: 10, left: 16, fontSize: 15, fontWeight: 800, color: "#EF5350", opacity: 0.6, textTransform: "uppercase", letterSpacing: 1, zIndex: 2 }}>▲ Above Tide — Expensive / Overvalued</div>
        <div style={{ position: "absolute", bottom: 10, left: 16, fontSize: 15, fontWeight: 800, color: "#fff", opacity: 0.7, textTransform: "uppercase", letterSpacing: 1, zIndex: 2 }}>▼ Below Tide — Cheap / Undervalued</div>

        {/* Animated waterline — colored by macro regime */}
        <div style={{ position: "absolute", left: 0, right: 0, top: waterPct + "%", height: 3, zIndex: 10, transition: "top .5s ease" }}>
          <div style={{ height: 2, background: `linear-gradient(90deg, ${currentRegime.color}44, ${currentRegime.color}, ${currentRegime.color}44)`, borderRadius: 1 }} />
          <div style={{ position: "absolute", left: 16, top: -10, display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: currentRegime.color, background: currentRegime.bg, padding: "2px 8px", borderRadius: 6, border: `1px solid ${currentRegime.color}33`, letterSpacing: 0.5, textTransform: "uppercase" }}>
              {currentRegime.name} Regime
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: currentRegime.color + "cc", maxWidth: 200, lineHeight: 1.2 }}>
              {currentRegime.desc.split("—")[0].trim()}
            </div>
          </div>
          <div style={{ position: "absolute", right: 16, top: -10, display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: currentRegime.color, animation: "pulse 2s ease infinite" }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: currentRegime.color, fontFamily: "JetBrains Mono" }}>{currentRegime.confidence}% conf.</span>
          </div>
        </div>

        {/* Wave decoration SVG — tinted by regime */}
        <svg style={{ position: "absolute", left: 0, right: 0, top: `calc(${waterPct}% - 6px)`, height: 30, zIndex: 5, pointerEvents: "none", transition: "top .5s ease" }} viewBox="0 0 400 30" preserveAspectRatio="none">
          <path d={"M0,8 " + Array.from({length: 41}, (_, i) => `Q${i * 10 + 5},${8 + Math.sin(i * 0.8) * 4} ${(i + 1) * 10},8`).join(" ") + " V30 H0 Z"} fill={currentRegime.color + "18"} />
          <path d={"M0,11 " + Array.from({length: 41}, (_, i) => `Q${i * 10 + 5},${11 + Math.sin(i * 0.6 + 2) * 3} ${(i + 1) * 10},11`).join(" ") + " V30 H0 Z"} fill={currentRegime.color + "12"} />
        </svg>

        {/* Above-water assets */}
        <div style={{ position: "relative", zIndex: 8, padding: "32px 16px 14px", minHeight: `calc(${waterPct}% - 12px)`, display: "flex", flexWrap: "wrap", alignContent: "flex-end", gap: 8, justifyContent: "center" }}>
          {aboveAssets.sort((a, b) => getAdjustedLevel(b) - getAdjustedLevel(a)).map((asset) => {
            const adj = getAdjustedLevel(asset);
            const deviation = adj - 50;
            const isSel = selectedAsset === asset.id;
            const isCascade = selected && (selected.cascade || []).includes(asset.id);
            return (
              <div key={asset.id} onClick={() => setSelectedAsset(isSel ? null : asset.id)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 12px", borderRadius: 16, background: isSel ? asset.color + "22" : "#fff", border: `2px solid ${isSel ? asset.color : isCascade ? "#C48830" : "#F0E6D0"}`, cursor: "pointer", transition: "all .4s ease", transform: `translateY(${Math.max(0, 50 - deviation) * 0.6}px)`, minWidth: 60, boxShadow: isSel ? `0 4px 16px ${asset.color}33` : "0 2px 8px rgba(0,0,0,.04)" }}
                onMouseEnter={e => { e.currentTarget.style.transform = `translateY(${Math.max(0, 50 - deviation) * 0.6 - 4}px)`; e.currentTarget.style.boxShadow = `0 6px 20px ${asset.color}22`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = `translateY(${Math.max(0, 50 - deviation) * 0.6}px)`; e.currentTarget.style.boxShadow = isSel ? `0 4px 16px ${asset.color}33` : "0 2px 8px rgba(0,0,0,.04)"; }}>
                <Icon name={asset.icon} size={12} />
                <div style={{ fontWeight: 800, fontSize: 15, fontFamily: "'Instrument Serif', serif", textAlign: "center", color: "#333334" }}>{asset.name}</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 700, color: "#EF5350" }}>{Math.round(adj)}</div>
                <div style={{ height: 4, width: 40, borderRadius: 2, background: "#FFF5E6", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: Math.min(adj, 100) + "%", background: adj > 70 ? "#EF5350" : "#FFA726", borderRadius: 2, transition: "width .5s" }} />
                </div>
                {isCascade && <div style={{ fontSize: 11, fontWeight: 900, color: selected.cascadeDir === "up" ? "#5B8C5A" : "#EF5350", background: selected.cascadeDir === "up" ? "#EDF5ED" : "#FFEBEE", padding: "1px 6px", borderRadius: 6 }}>{selected.cascadeDir === "up" ? "▲ RISES" : "▼ FALLS"}</div>}
              </div>
            );
          })}
        </div>

        {/* Below-water assets */}
        <div style={{ position: "relative", zIndex: 8, padding: "14px 16px 32px", display: "flex", flexWrap: "wrap", alignContent: "flex-start", gap: 8, justifyContent: "center" }}>
          {belowAssets.sort((a, b) => getAdjustedLevel(b) - getAdjustedLevel(a)).map((asset) => {
            const adj = getAdjustedLevel(asset);
            const depth = 50 - adj;
            const isSel = selectedAsset === asset.id;
            const isCascade = selected && (selected.cascade || []).includes(asset.id);
            return (
              <div key={asset.id} onClick={() => setSelectedAsset(isSel ? null : asset.id)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 12px", borderRadius: 16, background: isSel ? asset.color + "22" : "rgba(255,255,255,.85)", border: `2px solid ${isSel ? asset.color : isCascade ? "#C48830" : "rgba(255,255,255,.4)"}`, cursor: "pointer", transition: "all .4s ease", transform: `translateY(${Math.min(depth * 0.5, 30)}px)`, minWidth: 60, backdropFilter: "blur(4px)", boxShadow: isSel ? `0 4px 16px ${asset.color}33` : "none" }}
                onMouseEnter={e => { e.currentTarget.style.transform = `translateY(${Math.min(depth * 0.5, 30) - 4}px)`; e.currentTarget.style.background = "rgba(255,255,255,.95)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = `translateY(${Math.min(depth * 0.5, 30)}px)`; e.currentTarget.style.background = isSel ? asset.color + "22" : "rgba(255,255,255,.85)"; }}>
                <Icon name={asset.icon} size={12} />
                <div style={{ fontWeight: 800, fontSize: 15, fontFamily: "'Instrument Serif', serif", textAlign: "center", color: "#333334" }}>{asset.name}</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 700, color: "#C48830" }}>{Math.round(adj)}</div>
                <div style={{ height: 4, width: 40, borderRadius: 2, background: "rgba(255,255,255,.5)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: Math.min(adj, 100) + "%", background: adj < 25 ? "#C48830" : "#FFA726", borderRadius: 2, transition: "width .5s" }} />
                </div>
                {isCascade && <div style={{ fontSize: 11, fontWeight: 900, color: selected.cascadeDir === "up" ? "#5B8C5A" : "#EF5350", background: selected.cascadeDir === "up" ? "#EDF5ED" : "#FFEBEE", padding: "1px 6px", borderRadius: 6 }}>{selected.cascadeDir === "up" ? "▲ RISES" : "▼ FALLS"}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Selected Asset Detail + Cascade Effects ── */}
      {selected && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8, animation: "fadeUp .3s ease both" }}>
          {/* Left: Asset Deep Dive */}
          <div style={{ background: "#fff", border: `2px solid ${selected.color}33`, borderRadius: 14, padding: 12 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: selected.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={selected.icon} size={24} color={selected.color} /></div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>{selected.name}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 15, fontFamily: "JetBrains Mono", color: "#33333480" }}>{selected.ticker}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, padding: "1px 6px", borderRadius: 4, background: (typeColors[selected.type] || "#A09080") + "22", color: typeColors[selected.type] || "#A09080", textTransform: "uppercase" }}>{typeLabels[selected.type] || selected.type}</span>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 18, color: "#6B5A2E", lineHeight: 1.6, marginBottom: 7, padding: "7px 10px", background: "#FFFDF5", borderRadius: 12 }}>{selected.desc}</div>

            {/* Thermometer */}
            <div style={{ marginBottom: 7 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#33333480" }}>VALUATION THERMOMETER</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: selected.level > 50 ? "#EF5350" : "#C48830" }}>{selected.level > 65 ? "Overheated" : selected.level > 50 ? "Elevated" : selected.level > 35 ? "Fair Zone" : "Deep Value"}</span>
              </div>
              <div style={{ height: 28, background: "linear-gradient(90deg, #C48830 0%, #FFA726 40%, #EF5350 70%, #C94040 100%)", borderRadius: 14, position: "relative", overflow: "visible", border: "1px solid #33333440" }}>
                <div style={{ position: "absolute", left: selected.fair + "%", top: -6, bottom: -6, width: 2, background: "#8A7040", zIndex: 2, borderRadius: 1 }}>
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", fontSize: 11, fontWeight: 800, color: "#8A7040", whiteSpace: "nowrap" }}>Fair</div>
                </div>
                <div style={{ position: "absolute", left: `calc(${Math.min(Math.round(getAdjustedLevel(selected)), 96)}% - 12px)`, top: "50%", transform: "translateY(-50%)", width: 24, height: 24, borderRadius: "50%", background: "#fff", border: `3px solid ${selected.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, fontFamily: "JetBrains Mono", color: selected.color, boxShadow: `0 2px 8px ${selected.color}44`, transition: "left .5s ease", zIndex: 3 }}>
                  {Math.round(getAdjustedLevel(selected))}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "#33333480", marginTop: 4 }}>
                <span>Deep Value</span><span>Fair</span><span>Rich</span><span>Extreme</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
              <div style={{ background: selected.level > 50 ? "#FFEBEE" : "#FFF8EE", borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#33333480", textTransform: "uppercase" }}>Current</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 700, color: selected.level > 50 ? "#EF5350" : "#C48830" }}>{selected.level}</div>
              </div>
              <div style={{ background: "#fff", borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#33333480", textTransform: "uppercase" }}>Fair Value</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 700, color: "#FFA726" }}>{selected.fair}</div>
              </div>
              <div style={{ background: "#E3F2FD", borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#33333480", textTransform: "uppercase" }}>Tide-Adjusted</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 700, color: "#42A5F5" }}>{Math.round(getAdjustedLevel(selected))}</div>
              </div>
            </div>
          </div>

          {/* Right: Cascade Effects */}
          <div style={{ background: "#fff", borderRadius: 14, padding: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 17 }}></span>
              <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Instrument Serif', serif" }}>When This Tide Rolls Over</div>
            </div>
            <div style={{ fontSize: 17, color: "#33333480", marginBottom: 7, lineHeight: 1.5 }}>
              If <span style={{ fontWeight: 800, color: selected.color }}>{selected.name}</span> {selected.level > 50 ? "crashes down from " + selected.level + " toward fair value" : "recovers from " + selected.level + " toward fair value"}, these assets get pushed {selected.cascadeDir === "up" ? "upward" : "downward"}:
            </div>
            {cascadeTargets.length > 0 ? cascadeTargets.map((target) => {
              const tAdj = Math.round(getAdjustedLevel(target));
              const diff = tAdj - target.level;
              const goesUp = selected.cascadeDir === "up";
              return (
                <div key={target.id} onClick={() => setSelectedAsset(target.id)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 14, marginBottom: 6, cursor: "pointer", background: goesUp ? "#EDF5ED" : "#FFEBEE", border: `1.5px solid ${goesUp ? "#5B8C5A" : "#EF5350"}22`, transition: "all .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = target.color; e.currentTarget.style.transform = "translateX(4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.transform = ""; }}>
                  <Icon name={target.icon} size={12} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 18, fontFamily: "'Instrument Serif', serif" }}>{target.name}</div>
                    <div style={{ fontSize: 15, color: "#8A7040" }}>{target.ticker}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700, color: goesUp ? "#5B8C5A" : "#EF5350" }}>
                      {goesUp ? "▲" : "▼"}{diff !== 0 ? (diff > 0 ? " +" : " ") + diff : ""}
                    </div>
                    <div style={{ fontSize: 14, color: "#33333480" }}>{target.level} → {tAdj}</div>
                  </div>
                </div>
              );
            }) : (
              <div style={{ textAlign: "center", padding: 30, color: "#33333480", fontSize: 18 }}>Move the tide slider to see cascade effects</div>
            )}

            {cascadeTargets.length > 0 && (
              <div style={{ marginTop: 10, padding: "7px 10px", background: "#fff", borderRadius: 12, border: "1px solid #F0E6D0" }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#C48830", marginBottom: 2 }}>Inverse Correlation</div>
                <div style={{ fontSize: 15, color: "#8A7040", lineHeight: 1.5 }}>
                  {selected.name} going {selected.level > 50 ? "down" : "up"} historically pushes {cascadeTargets.map(t => t.name).join(", ")} in the opposite direction. Drag the tide slider left to simulate.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── All Assets Ranked Table ── */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 12, animation: "fadeUp .4s ease .25s both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
          <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Instrument Serif', serif" }}>Full Tide Map — Ranked by Elevation</div>
          <div style={{ fontSize: 15, color: "#33333480" }}>Tap any row to see cascade</div>
        </div>
        <div className="mobile-scroll-x" style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #F0E6D0" }}>
          <div className="tide-table-header" style={{ display: "grid", gridTemplateColumns: "1.2fr .6fr .4fr .4fr .4fr .6fr", padding: "6px 10px", background: "#fff", borderBottom: "2px solid #F0E6D0", fontSize: 14, fontWeight: 800, color: "#33333480", textTransform: "uppercase", letterSpacing: .5 }}>
            <div>Asset</div><div>Instrument</div><div>Level</div><div>Fair</div><div>Gap</div><div style={{ textAlign: "right" }}>Tide Effect</div>
          </div>
          {[...tideAssets].sort((a, b) => getAdjustedLevel(b) - getAdjustedLevel(a)).map((asset, i) => {
            const adj = Math.round(getAdjustedLevel(asset));
            const gap = asset.level - asset.fair;
            const effect = adj - asset.level;
            const isSel = selectedAsset === asset.id;
            const isAbove = adj > 50;
            return (
              <div key={asset.id} className="tide-table-row" onClick={() => setSelectedAsset(isSel ? null : asset.id)}
                style={{ display: "grid", gridTemplateColumns: "1.2fr .6fr .4fr .4fr .4fr .6fr", padding: "6px 10px", borderBottom: i < tideAssets.length - 1 ? "1px solid #F0E6D0" : "none", alignItems: "center", cursor: "pointer", background: isSel ? asset.color + "12" : "transparent", transition: "background .2s" }}
                onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "#fff"; }} onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name={asset.icon} size={10} />
                  <div>
                    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                      <span style={{ fontWeight: 800, fontSize: 18, fontFamily: "'Instrument Serif', serif" }}>{asset.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 900, padding: "1px 5px", borderRadius: 4, background: isAbove ? "#FFEBEE" : "#FFF8EE", color: isAbove ? "#EF5350" : "#C48830" }}>{isAbove ? "ABOVE" : "BELOW"}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, padding: "1px 5px", borderRadius: 4, background: (typeColors[asset.type] || "#A09080") + "18", color: typeColors[asset.type] || "#A09080", textTransform: "uppercase" }}>{typeLabels[asset.type] || asset.type}</span>
                  </div>
                </div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, color: "#33333480" }}>{asset.ticker}</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700, color: adj > 60 ? "#EF5350" : adj < 35 ? "#C48830" : "#FFA726" }}>{adj}</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 17, color: "#33333480" }}>{asset.fair}</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 700, color: gap > 10 ? "#EF5350" : gap < -10 ? "#C48830" : "#FFA726" }}>{gap > 0 ? "+" : ""}{gap}</div>
                <div style={{ textAlign: "right" }}>
                  {effect !== 0 ? (
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 18, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: effect > 0 ? "#EDF5ED" : "#FFEBEE", color: effect > 0 ? "#5B8C5A" : "#EF5350" }}>{effect > 0 ? "▲ +" + effect : "▼ " + effect}</span>
                  ) : (
                    <span style={{ fontSize: 15, color: "#33333480" }}>—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}



// ═══════════════ MY BASKETS PAGE ═══════════════

const macroProducts = [
  // Equities (just a few index-level)
  { id:"sp500", ticker:"ES", name:"S&P 500 Futures", cat:"Equities", price:5248.50, change:0.42, ytd:8.2, icon:"chart-up", color:"#42A5F5" },
  { id:"nasdaq", ticker:"NQ", name:"Nasdaq 100 Futures", cat:"Equities", price:18420, change:0.68, ytd:12.4, icon:"laptop", color:"#AB47BC" },
  // Rates & Bonds
  { id:"ust10y", ticker:"ZN", name:"10Y Treasury Note", cat:"Rates", price:110.25, change:-0.34, ytd:-4.8, icon:"building", color:"#C48830" },
  { id:"ust30y", ticker:"ZB", name:"30Y Treasury Bond", cat:"Rates", price:118.40, change:-0.62, ytd:-8.2, icon:"bank", color:"#EF5350" },
  { id:"tlt", ticker:"TLT", name:"20+ Year Treasury ETF", cat:"Rates", price:92.40, change:-0.58, ytd:-6.4, icon:"clipboard", color:"#C48830" },
  // Commodities - Energy
  { id:"crude", ticker:"CL", name:"WTI Crude Oil", cat:"Energy", price:87.20, change:2.40, ytd:14.6, icon:"oil-barrel", color:"#5C4A1E" },
  { id:"natgas", ticker:"NG", name:"Natural Gas", cat:"Energy", price:3.42, change:3.20, ytd:-12.8, icon:"fire", color:"#FFA726" },
  { id:"brent", ticker:"BZ", name:"Brent Crude", cat:"Energy", price:91.40, change:2.10, ytd:16.2, icon:"gas-pump", color:"#8A7040" },
  // Precious Metals
  { id:"gold", ticker:"GC", name:"Gold Futures", cat:"Metals", price:2186, change:0.30, ytd:6.2, icon:"gold-medal", color:"#FFA726" },
  { id:"silver", ticker:"SI", name:"Silver Futures", cat:"Metals", price:24.82, change:0.65, ytd:2.8, icon:"silver-medal", color:"#A09080" },
  { id:"copper", ticker:"HG", name:"Copper Futures", cat:"Metals", price:4.12, change:1.20, ytd:8.4, icon:"diamond-orange", color:"#C48830" },
  // Currencies
  { id:"dxy", ticker:"DXY", name:"US Dollar Index", cat:"Currency", price:104.80, change:0.38, ytd:3.2, icon:"dollar", color:"#C48830" },
  { id:"eurusd", ticker:"EUR/USD", name:"Euro / Dollar", cat:"Currency", price:1.0840, change:-0.18, ytd:-2.8, icon:"flag-eu", color:"#42A5F5" },
  { id:"usdjpy", ticker:"USD/JPY", name:"Dollar / Yen", cat:"Currency", price:151.20, change:0.40, ytd:5.6, icon:"flag-jp", color:"#EF5350" },
  { id:"gbpusd", ticker:"GBP/USD", name:"Pound / Dollar", cat:"Currency", price:1.2680, change:-0.12, ytd:-1.4, icon:"flag-gb", color:"#AB47BC" },
  // Agriculture
  { id:"wheat", ticker:"ZW", name:"Wheat Futures", cat:"Agriculture", price:5.86, change:-1.20, ytd:-18.4, icon:"wheat", color:"#FFA726" },
  { id:"corn", ticker:"ZC", name:"Corn Futures", cat:"Agriculture", price:4.52, change:-0.80, ytd:-14.2, icon:"corn", color:"#C48830" },
  // Crypto
  { id:"btc", ticker:"BTC", name:"Bitcoin", cat:"Crypto", price:62500, change:4.60, ytd:48.2, icon:"bitcoin", color:"#FFA726" },
  // Volatility
  { id:"vix", ticker:"VIX", name:"Volatility Index", cat:"Volatility", price:18.40, change:1.20, ytd:-8.6, icon:"bolt", color:"#EF5350" },
];

const macroCorrelations = [
  // ═══ SEESAW PAIRS — strong inverse relationships (hedges) ═══
  { a:"sp500", b:"vix", corr:-0.85, desc:"When stocks drop, fear surges. VIX is the classic equity hedge." },
  { a:"sp500", b:"ust10y", corr:-0.52, desc:"Risk-off: money flows from equities into safe-haven bonds." },
  { a:"sp500", b:"gold", corr:-0.35, desc:"Gold rises when equity confidence fades — flight to safety." },
  { a:"nasdaq", b:"ust30y", corr:-0.58, desc:"Tech is long-duration — crushed by rising rates, boosted by falling rates." },
  { a:"nasdaq", b:"vix", corr:-0.82, desc:"High-beta tech amplifies fear. Nasdaq falls harder, VIX spikes harder." },
  { a:"crude", b:"natgas", corr:0.32, desc:"Energy siblings but loosely coupled — different supply dynamics." },
  { a:"crude", b:"sp500", corr:0.42, desc:"Moderate positive — oil rises with growth expectations." },
  { a:"dxy", b:"gold", corr:-0.72, desc:"Dollar strength crushes gold. Dollar weakness = gold rallies." },
  { a:"dxy", b:"eurusd", corr:-0.95, desc:"Near-perfect inverse. Dollar up = Euro down by definition." },
  { a:"dxy", b:"btc", corr:-0.48, desc:"Crypto trades as an anti-dollar asset. DXY down = BTC up." },
  { a:"dxy", b:"copper", corr:-0.45, desc:"Strong dollar pressures commodity demand globally." },
  { a:"gold", b:"ust10y", corr:-0.55, desc:"Gold competes with bonds for safe-haven flows. Rising yields = gold pressure." },
  { a:"gold", b:"btc", corr:0.38, desc:"Both seen as 'alternative stores of value' — loosely correlated." },
  { a:"gold", b:"silver", corr:0.88, desc:"Precious metals move in tandem. Silver is leveraged gold." },
  { a:"crude", b:"eurusd", corr:0.45, desc:"Crude priced in USD — weaker dollar lifts oil in other currencies." },
  { a:"crude", b:"wheat", corr:0.35, desc:"Energy costs drive agricultural inputs — fertilizer, transport." },
  { a:"ust10y", b:"ust30y", corr:0.92, desc:"Long-end of the curve moves together. 30Y more volatile." },
  { a:"ust10y", b:"tlt", corr:0.95, desc:"TLT tracks long treasuries directly — near-perfect correlation." },
  { a:"sp500", b:"copper", corr:0.62, desc:"'Dr. Copper' — copper predicts economic growth like equities." },
  { a:"sp500", b:"btc", corr:0.55, desc:"Risk-on asset class — BTC trades with growth momentum." },
  { a:"nasdaq", b:"btc", corr:0.62, desc:"Tech-heavy risk appetite drives both. 'Leveraged beta' correlation." },
  { a:"vix", b:"gold", corr:0.42, desc:"Fear drives both — VIX spikes and gold catches safe-haven bids." },
  { a:"vix", b:"ust10y", corr:0.48, desc:"Flight to quality — fear pushes money into bonds, yields drop." },
  { a:"usdjpy", b:"sp500", corr:0.45, desc:"Risk-on: Yen weakens as carry trades and equity appetite grow." },
  { a:"usdjpy", b:"gold", corr:-0.40, desc:"Yen and gold are competing safe havens." },
  { a:"copper", b:"silver", corr:0.52, desc:"Both industrial metals with partial overlap in demand drivers." },
  { a:"wheat", b:"corn", corr:0.78, desc:"Agricultural grains — weather, planting cycles, and subsidies link them." },
  { a:"brent", b:"crude", corr:0.96, desc:"Same commodity, different delivery. Near-perfect correlation." },
  { a:"eurusd", b:"gbpusd", corr:0.82, desc:"European currencies share dollar-denominated risk." },
  { a:"natgas", b:"wheat", corr:0.28, desc:"Energy inputs to farming create loose linkage." },
  { a:"btc", b:"vix", corr:-0.38, desc:"Risk-on/risk-off — crypto drops when volatility spikes." },
  { a:"crude", b:"usdjpy", corr:0.35, desc:"Higher oil = weaker yen (Japan imports energy)." },
  { a:"tlt", b:"sp500", corr:-0.48, desc:"Classic 60/40 diversifier. Bonds buffer equity drawdowns." },
  { a:"tlt", b:"gold", corr:0.32, desc:"Both benefit from rate-cut expectations and risk-off flows." },
  { a:"gbpusd", b:"gold", corr:0.28, desc:"Both inversely related to dollar strength." },
];

const catConfig = {
  Equities: { color: "#42A5F5", icon: "chart-up" },
  Rates: { color: "#C48830", icon: "building" },
  Energy: { color: "#333334", icon: "oil-barrel" },
  Metals: { color: "#FFA726", icon: "gold-medal" },
  Currency: { color: "#C48830", icon: "currency" },
  Agriculture: { color: "#C48830", icon: "wheat" },
  Crypto: { color: "#FFA726", icon: "bitcoin" },
  Volatility: { color: "#EF5350", icon: "bolt" },
};

function MyBasketsPage({ onSelectBasket }) {
  const [selectedPair, setSelectedPair] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [corrThreshold, setCorrThreshold] = useState(0.3);
  const [catFilter, setCatFilter] = useState("ALL");
  const [seesawPair, setSeesawPair] = useState({ a: "sp500", b: "vix" });

  // Portfolio stats
  const totalValue = myBaskets.reduce((s, b) => s + b.value, 0);
  const totalPL = myBaskets.reduce((s, b) => s + (b.value - b.costBasis), 0);
  const totalDayPL = myBaskets.reduce((s, b) => s + b.dayPL, 0);

  // Seesaw logic
  const seesawA = macroProducts.find(p => p.id === seesawPair.a);
  const seesawB = macroProducts.find(p => p.id === seesawPair.b);
  const seesawCorr = macroCorrelations.find(c => (c.a === seesawPair.a && c.b === seesawPair.b) || (c.a === seesawPair.b && c.b === seesawPair.a));
  const corrVal = seesawCorr ? (seesawCorr.a === seesawPair.a ? seesawCorr.corr : seesawCorr.corr) : 0;

  // Seesaw tilt: based on YTD returns
  const returnA = seesawA ? seesawA.ytd : 0;
  const returnB = seesawB ? seesawB.ytd : 0;
  const tiltDeg = Math.max(-22, Math.min(22, (returnA - returnB) * 0.5));

  // Network layout
  const W = 820, H = 560, CX = W / 2, CY = H / 2;
  const cats = [...new Set(macroProducts.map(p => p.cat))];
  const catAngles = {};
  cats.forEach((c, i) => { catAngles[c] = (i / cats.length) * Math.PI * 2 - Math.PI / 2; });

  const nodePos = {};
  const catGroups = {};
  cats.forEach(c => { catGroups[c] = []; });
  macroProducts.forEach(p => { catGroups[p.cat].push(p); });

  Object.entries(catGroups).forEach(([cat, products]) => {
    const angle = catAngles[cat];
    const cx = CX + Math.cos(angle) * 185;
    const cy = CY + Math.sin(angle) * 185;
    const spread = 32 + products.length * 12;
    products.forEach((p, i) => {
      const subAngle = (i / Math.max(products.length, 1)) * Math.PI * 2 + angle;
      const r = products.length === 1 ? 0 : spread * 0.55;
      nodePos[p.id] = { x: cx + Math.cos(subAngle) * r, y: cy + Math.sin(subAngle) * r, ...p };
    });
  });

  const filteredProducts = catFilter === "ALL" ? macroProducts : macroProducts.filter(p => p.cat === catFilter);
  const visibleCorrs = macroCorrelations.filter(c =>
    Math.abs(c.corr) >= corrThreshold &&
    nodePos[c.a] && nodePos[c.b] &&
    (catFilter === "ALL" || macroProducts.find(p => p.id === c.a)?.cat === catFilter || macroProducts.find(p => p.id === c.b)?.cat === catFilter)
  );

  const nodeCorrs = selectedNode ? macroCorrelations.filter(c =>
    (c.a === selectedNode || c.b === selectedNode) && Math.abs(c.corr) >= 0.15
  ).sort((a, b) => Math.abs(b.corr) - Math.abs(a.corr)) : [];

  // Top hedges (strongest inverse)
  const topHedges = [...macroCorrelations].filter(c => c.corr < -0.3).sort((a, b) => a.corr - b.corr).slice(0, 8);

  return (
    <div>
      <div style={{ marginBottom: 8, animation: "fadeUp .3s ease both" }}>
        <h1 style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>My Baskets & Macro Map</h1>
        <p style={{ color: "#33333480", fontSize: 15, marginTop: 3 }}>Portfolio overview, macro product correlations & hedging seesaw</p>
      </div>

      {/* ── Portfolio Summary ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(100px,1fr))", gap: 6, marginBottom: 6, animation: "fadeUp .4s ease .05s both" }}>
        {[
          { label: "Portfolio", val: "$" + (totalValue / 1000).toFixed(1) + "k", color: "#333334", bg: "#fff" },
          { label: "Total P&L", val: (totalPL >= 0 ? "+" : "") + "$" + (totalPL / 1000).toFixed(1) + "k", color: totalPL >= 0 ? "#5B8C5A" : "#EF5350", bg: totalPL >= 0 ? "#EDF5ED" : "#FFEBEE" },
          { label: "Day P&L", val: (totalDayPL >= 0 ? "+" : "") + "$" + totalDayPL.toLocaleString(), color: totalDayPL >= 0 ? "#5B8C5A" : "#EF5350", bg: totalDayPL >= 0 ? "#EDF5ED" : "#FFEBEE" },
          { label: "Baskets", val: myBaskets.length, color: "#AB47BC", bg: "#F0E8F5" },
          { label: "Macro Products", val: macroProducts.length, color: "#42A5F5", bg: "#E3F2FD" },
          { label: "Hedge Pairs", val: macroCorrelations.filter(c => c.corr < -0.3).length, color: "#EF5350", bg: "#FFEBEE" },
        ].map((m, i) => (
          <div key={i} style={{ background: m.bg, borderRadius: 16, padding: "8px 10px", textAlign: "center", animation: "fadeUp .4s ease " + (i * .03) + "s both" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#33333480", textTransform: "uppercase", letterSpacing: .5 }}>{m.label}</div>
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 700, color: m.color, marginTop: 2 }}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* ── Basket Cards ── */}
      {(() => { const _macroMaxChg = Math.max(...myBaskets.map(b => b.change)); const _macroMaxRet = Math.max(...myBaskets.filter(b => b.costBasis > 0).map(b => b.totalPL / b.costBasis)); return <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6, marginBottom: 8, animation: "fadeUp .4s ease .08s both" }}>
        {myBaskets.map(b => { const clr = CL[b.color] || CL.terracotta; const retPct = b.costBasis > 0 ? b.totalPL / b.costBasis : 0; const isHighestReturn = retPct === _macroMaxRet && _macroMaxRet > 0; const isTrendiest = b.change === _macroMaxChg && _macroMaxChg > 0; return (
          <div key={b.id} onClick={() => onSelectBasket && onSelectBasket(b)} style={{ background: isHighestReturn ? "#FFFDF0" : "#fff", border: `1px solid ${isHighestReturn ? "#DAA52066" : "#33333440"}`, borderRadius: 18, padding: "8px 10px", cursor: "pointer", transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = isHighestReturn ? "#DAA520" : clr.a; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = isHighestReturn ? "#DAA52066" : "#F0E6D0"; e.currentTarget.style.transform = ""; }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              {isHighestReturn ? <Icon name="egg" size={14} color="#DAA520" /> : <Icon name={b.icon} size={12} />}
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: isHighestReturn ? "#B8860B" : undefined }}>{b.name}</div>
                <div style={{ fontSize: 14, color: "#33333480" }}>{(basketStocks[b.id] || []).length} positions · {b.strategy}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 18, fontWeight: 700, color: isHighestReturn ? "#DAA520" : undefined }}>${(b.value / 1000).toFixed(1)}k</div>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>{isTrendiest && !isHighestReturn && <Icon name="fire" size={12} color="#FF6B35" />}<span style={{ fontFamily: "JetBrains Mono", fontSize: 18, fontWeight: 700, color: isHighestReturn ? "#DAA520" : b.change >= 0 ? "#5B8C5A" : "#EF5350" }}>{b.change >= 0 ? "+" : ""}{b.change}%</span></div>
            </div>
            <div style={{ height: 4, background: "#FFF5E6", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: b.allocation + "%", background: clr.a, borderRadius: 2 }} />
            </div>
          </div>); })}
      </div>; })()}

      {/* ═══════════════ HEDGING SEESAW ═══════════════ */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "10px 22px 18px", marginBottom: 8, animation: "fadeUp .4s ease .12s both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>Hedging Seesaw</div>
            <div style={{ fontSize: 17, color: "#33333480", marginTop: 2 }}>When one side weighs down, the other lifts up — pick any pair to visualize</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 800, padding: "4px 10px", borderRadius: 8, background: corrVal < -0.5 ? "#FFF8EE" : corrVal < 0 ? "#FFF3E0" : "#FFEBEE", color: corrVal < -0.5 ? "#C48830" : corrVal < 0 ? "#FFA726" : "#EF5350" }}>
              ρ = {corrVal.toFixed(2)} · {corrVal < -0.6 ? "Strong Hedge" : corrVal < -0.3 ? "Moderate Hedge" : corrVal < 0 ? "Weak Hedge" : corrVal < 0.3 ? "Weak +" : "Correlated"}
            </span>
          </div>
        </div>

        {/* Pair selectors */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px", maxWidth: 260 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#33333480", textTransform: "uppercase", marginBottom: 4, textAlign: "center" }}>LEFT SIDE</div>
            <select value={seesawPair.a} onChange={e => setSeesawPair(p => ({ ...p, a: e.target.value }))}
              style={{ width: "100%", padding: "7px 10px", borderRadius: 12, border: "1.5px solid #42A5F544", fontSize: 15, fontWeight: 700, fontFamily: "Quicksand", outline: "none", background: "#E3F2FD", color: "#333334", cursor: "pointer" }}>
              {macroProducts.map(p => <option key={p.id} value={p.id}>{p.ticker} — {p.name}</option>)}
            </select>
          </div>
          <div style={{ fontSize: 18, color: "#33333480", fontWeight: 900 }}>⟺</div>
          <div style={{ flex: "1 1 200px", maxWidth: 260 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#33333480", textTransform: "uppercase", marginBottom: 4, textAlign: "center" }}>RIGHT SIDE</div>
            <select value={seesawPair.b} onChange={e => setSeesawPair(p => ({ ...p, b: e.target.value }))}
              style={{ width: "100%", padding: "7px 10px", borderRadius: 12, border: "1.5px solid #EF535044", fontSize: 15, fontWeight: 700, fontFamily: "Quicksand", outline: "none", background: "#FFEBEE", color: "#333334", cursor: "pointer" }}>
              {macroProducts.map(p => <option key={p.id} value={p.id}>{p.ticker} — {p.name}</option>)}
            </select>
          </div>
        </div>

        {/* Quick pair presets */}
        <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap", marginBottom: 8 }}>
          {[
            { a:"sp500", b:"vix", label:"S&P vs VIX" },
            { a:"dxy", b:"gold", label:"Dollar vs Gold" },
            { a:"nasdaq", b:"ust30y", label:"Tech vs Bonds" },
            { a:"sp500", b:"ust10y", label:"Stocks vs 10Y" },
            { a:"dxy", b:"eurusd", label:"DXY vs EUR" },
            { a:"crude", b:"natgas", label:"Oil vs NatGas" },
            { a:"gold", b:"btc", label:"Gold vs BTC" },
            { a:"tlt", b:"sp500", label:"TLT vs SPX" },
          ].map((preset, i) => (
            <button key={i} onClick={() => setSeesawPair({ a: preset.a, b: preset.b })}
              style={{ padding: "4px 10px", borderRadius: 8, border: "1.5px solid " + (seesawPair.a === preset.a && seesawPair.b === preset.b ? "#C48830" : "#F0E6D0"), background: seesawPair.a === preset.a && seesawPair.b === preset.b ? "#FFF8EE" : "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", color: seesawPair.a === preset.a && seesawPair.b === preset.b ? "#C48830" : "#8A7040" }}>{preset.label}</button>
          ))}
        </div>

        {/* ── THE SEESAW VISUALIZATION ── */}
        {seesawA && seesawB && (
          <svg viewBox="0 0 700 310" style={{ width: "100%", height: 240, display: "block" }}>
            <defs>
              <linearGradient id="seesawBar" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={seesawA.color} /><stop offset="100%" stopColor={seesawB.color} />
              </linearGradient>
              <filter id="dropSh"><feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.12" /></filter>
            </defs>

            {/* Center pivot triangle */}
            <polygon points="350,230 336,260 364,260" fill="#C48830" opacity="0.8" />
            <rect x="300" y="260" width="100" height="8" rx="4" fill="#F0E6D0" />

            {/* Seesaw beam */}
            <g transform={`rotate(${tiltDeg}, 350, 220)`}>
              <rect x="60" y="216" width="580" height="8" rx="4" fill="url(#seesawBar)" filter="url(#dropSh)" />

              {/* Left Platform (Product A) */}
              <g>
                <rect x="40" y="185" width="160" height="32" rx="12" fill="#fff" stroke={seesawA.color} strokeWidth="2" filter="url(#dropSh)" />
                <text x="120" y="197" textAnchor="middle" fill={seesawA.color} fontSize="10" fontWeight="800" fontFamily="JetBrains Mono">{seesawA.ticker}</text>
                <text x="120" y="210" textAnchor="middle" fill="#A09080" fontSize="8" fontFamily="Poppins" fontWeight="700">{seesawA.name.length > 20 ? seesawA.name.slice(0,18) + ".." : seesawA.name}</text>

                {/* Weight block */}
                <rect x="80" y={140 - Math.abs(returnA) * 1.2} width="80" height={Math.max(20, Math.abs(returnA) * 1.8)} rx="8" fill={returnA >= 0 ? "#5B8C5A" : "#EF5350"} opacity="0.85" />
                <text x="120" y={148 - Math.abs(returnA) * 1.2 + Math.max(20, Math.abs(returnA) * 1.8) / 2} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="14" fontWeight="900" fontFamily="JetBrains Mono">{returnA >= 0 ? "+" : ""}{returnA}%</text>
                <text x="120" y={134 - Math.abs(returnA) * 1.2} textAnchor="middle" fill={seesawA.color} fontSize="8" fontWeight="800">YTD RETURN</text>

                {/* Price */}
                <text x="120" y="240" textAnchor="middle" fill="#6B5A2E" fontSize="12" fontWeight="700" fontFamily="JetBrains Mono">${seesawA.price >= 1000 ? (seesawA.price).toLocaleString() : seesawA.price}</text>
                <text x="120" y="254" textAnchor="middle" fill={seesawA.change >= 0 ? "#5B8C5A" : "#EF5350"} fontSize="10" fontWeight="800" fontFamily="JetBrains Mono">{seesawA.change >= 0 ? "▲ +" : "▼ "}{seesawA.change}% today</text>
              </g>

              {/* Right Platform (Product B) */}
              <g>
                <rect x="500" y="185" width="160" height="32" rx="12" fill="#fff" stroke={seesawB.color} strokeWidth="2" filter="url(#dropSh)" />
                <text x="580" y="197" textAnchor="middle" fill={seesawB.color} fontSize="10" fontWeight="800" fontFamily="JetBrains Mono">{seesawB.ticker}</text>
                <text x="580" y="210" textAnchor="middle" fill="#A09080" fontSize="8" fontFamily="Poppins" fontWeight="700">{seesawB.name.length > 20 ? seesawB.name.slice(0,18) + ".." : seesawB.name}</text>

                {/* Weight block */}
                <rect x="540" y={140 - Math.abs(returnB) * 1.2} width="80" height={Math.max(20, Math.abs(returnB) * 1.8)} rx="8" fill={returnB >= 0 ? "#5B8C5A" : "#EF5350"} opacity="0.85" />
                <text x="580" y={148 - Math.abs(returnB) * 1.2 + Math.max(20, Math.abs(returnB) * 1.8) / 2} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="14" fontWeight="900" fontFamily="JetBrains Mono">{returnB >= 0 ? "+" : ""}{returnB}%</text>
                <text x="580" y={134 - Math.abs(returnB) * 1.2} textAnchor="middle" fill={seesawB.color} fontSize="8" fontWeight="800">YTD RETURN</text>

                {/* Price */}
                <text x="580" y="240" textAnchor="middle" fill="#6B5A2E" fontSize="12" fontWeight="700" fontFamily="JetBrains Mono">${seesawB.price >= 1000 ? (seesawB.price).toLocaleString() : seesawB.price}</text>
                <text x="580" y="254" textAnchor="middle" fill={seesawB.change >= 0 ? "#5B8C5A" : "#EF5350"} fontSize="10" fontWeight="800" fontFamily="JetBrains Mono">{seesawB.change >= 0 ? "▲ +" : "▼ "}{seesawB.change}% today</text>
              </g>

              {/* Correlation indicator at center */}
              <circle cx="350" cy="208" r="18" fill="#fff" stroke={corrVal < 0 ? "#EF5350" : "#C48830"} strokeWidth="2.5" />
              <text x="350" y="206" textAnchor="middle" fill={corrVal < 0 ? "#EF5350" : "#C48830"} fontSize="9" fontWeight="900" fontFamily="JetBrains Mono">{corrVal >= 0 ? "+" : ""}{corrVal.toFixed(2)}</text>
              <text x="350" y="216" textAnchor="middle" fill="#A09080" fontSize="6" fontWeight="700">CORR</text>
            </g>

            {/* Description below */}
            {seesawCorr && <text x="350" y="290" textAnchor="middle" fill="#8A7040" fontSize="10" fontWeight="600" fontFamily="Quicksand">{seesawCorr.desc}</text>}
          </svg>
        )}
      </div>

      {/* ═══════════════ CORRELATION NETWORK ═══════════════ */}
      <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", marginBottom: 8, animation: "fadeUp .4s ease .18s both" }}>
        <div style={{ padding: "18px 22px", borderBottom: "2px solid #F0E6D0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>Macro Correlation Network</div>
            <div style={{ fontSize: 17, color: "#33333480" }}>Futures · Commodities · Currencies · Metals · Rates — click any node</div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#33333480" }}>MIN |ρ|</span>
            {[0.15, 0.3, 0.5, 0.7].map(t => (
              <button key={t} onClick={() => setCorrThreshold(t)} style={{ padding: "3px 8px", borderRadius: 6, border: "1.5px solid " + (corrThreshold === t ? "#C48830" : "#F0E6D0"), background: corrThreshold === t ? "#FFF8EE" : "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "JetBrains Mono", color: corrThreshold === t ? "#C48830" : "#A09080" }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Category filters */}
        <div style={{ padding: "8px 22px", background: "#FFFDF5", borderBottom: "1px solid #33333420", display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={() => setCatFilter("ALL")} style={{ padding: "3px 10px", borderRadius: 6, border: "1.5px solid " + (catFilter === "ALL" ? "#C48830" : "#F0E6D0"), background: catFilter === "ALL" ? "#FFF8EE" : "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", color: catFilter === "ALL" ? "#C48830" : "#A09080" }}>ALL</button>
          {cats.map(c => { const cc = catConfig[c] || { color:"#A09080", icon:"chart-bar" }; return (
            <button key={c} onClick={() => setCatFilter(catFilter === c ? "ALL" : c)} style={{ padding: "3px 10px", borderRadius: 6, border: "1.5px solid " + (catFilter === c ? cc.color : "#F0E6D0"), background: catFilter === c ? cc.color + "18" : "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", color: catFilter === c ? cc.color : "#A09080", display: "inline-flex", alignItems: "center", gap: 3 }}><Icon name={cc.icon} size={10} color={catFilter === c ? cc.color : "#A09080"} /> {c}</button>
          ); })}
          <span style={{ marginLeft: "auto", display: "flex", gap: 6, fontSize: 14, fontWeight: 700, color: "#33333480" }}>
            <span><span style={{ display: "inline-block", width: 16, height: 3, background: "#C48830", borderRadius: 2, verticalAlign: "middle", marginRight: 3 }} />Positive</span>
            <span><span style={{ display: "inline-block", width: 16, height: 3, background: "#EF5350", borderRadius: 2, verticalAlign: "middle", marginRight: 3, borderTop: "1px dashed #EF5350" }} />Inverse (hedge)</span>
          </span>
        </div>

        {/* SVG Network Graph */}
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 320, display: "block" }} onClick={() => setSelectedNode(null)}>
          <rect x="0" y="0" width={W} height={H} fill="#FFFDF5" />

          {/* Category cluster circles */}
          {cats.map(cat => {
            const cc = catConfig[cat] || { color:"#A09080" };
            const angle = catAngles[cat];
            const cx = CX + Math.cos(angle) * 185;
            const cy = CY + Math.sin(angle) * 185;
            return (
              <g key={cat}>
                <circle cx={cx} cy={cy} r={32 + (catGroups[cat]?.length || 0) * 10} fill={cc.color + "06"} stroke={cc.color + "18"} strokeWidth="1" strokeDasharray="4,3" />
                <text x={cx} y={cy - (28 + (catGroups[cat]?.length || 0) * 8)} textAnchor="middle" fill={cc.color} fontSize="10" fontWeight="800" fontFamily="Poppins">{(catConfig[cat]?.icon || "") + " " + cat}</text>
              </g>
            );
          })}

          {/* Correlation lines */}
          {visibleCorrs.map((c, i) => {
            const na = nodePos[c.a], nb = nodePos[c.b];
            if (!na || !nb) return null;
            const isPos = c.corr > 0;
            const thick = Math.abs(c.corr) * 3.5;
            const opacity = 0.12 + Math.abs(c.corr) * 0.35;
            const isHL = selectedNode && (c.a === selectedNode || c.b === selectedNode);
            const isDim = selectedNode && !isHL;
            return <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke={isPos ? "#5B8C5A" : "#EF5350"} strokeWidth={isHL ? thick + 1.5 : thick}
              opacity={isDim ? 0.04 : isHL ? 0.85 : opacity}
              strokeDasharray={isPos ? "none" : "5,4"}
              style={{ transition: "all .3s" }} />;
          })}

          {/* Nodes */}
          {macroProducts.map(p => {
            const pos = nodePos[p.id];
            if (!pos) return null;
            const isSel = selectedNode === p.id;
            const isConn = selectedNode && macroCorrelations.some(c => (c.a === selectedNode || c.b === selectedNode) && (c.a === p.id || c.b === p.id));
            const isDim = selectedNode && !isSel && !isConn;
            const isVisible = catFilter === "ALL" || p.cat === catFilter;
            const conns = macroCorrelations.filter(c => c.a === p.id || c.b === p.id).length;
            const r = isSel ? 24 : 14 + Math.min(conns, 5) * 1.5;
            const cc = catConfig[p.cat] || { color:"#A09080" };
            return (
              <g key={p.id} onClick={e => { e.stopPropagation(); setSelectedNode(isSel ? null : p.id); setSeesawPair(prev => isSel ? prev : { ...prev, a: p.id }); }}
                style={{ cursor: "pointer" }} opacity={isDim ? 0.15 : isVisible ? 1 : 0.3}>
                {isSel && <circle cx={pos.x} cy={pos.y} r={r + 8} fill={p.color + "18"} stroke={p.color + "44"} strokeWidth="1" />}
                <circle cx={pos.x} cy={pos.y} r={r} fill={isSel ? p.color : "#fff"} stroke={isSel ? p.color : p.color + "88"} strokeWidth={isSel ? 2.5 : 1.5} />
                {/* Category dot */}
                <circle cx={pos.x + r * 0.68} cy={pos.y - r * 0.68} r="5" fill={cc.color} stroke="#fff" strokeWidth="1.5" />
                {/* Icon */}
                <g transform={`translate(${pos.x - (isSel ? 7 : 6)}, ${pos.y - (isSel ? 9 : 8)})`}><Icon name={p.icon} size={isSel ? 14 : 12} color={p.color} /></g>
                {/* Ticker */}
                <text x={pos.x} y={pos.y + r + 11} textAnchor="middle" fill={isSel ? p.color : "#6B5A2E"} fontSize="9" fontWeight="800" fontFamily="JetBrains Mono">{p.ticker}</text>
                {/* YTD return on hover/select */}
                {isSel && <text x={pos.x} y={pos.y + r + 22} textAnchor="middle" fill={p.ytd >= 0 ? "#5B8C5A" : "#EF5350"} fontSize="8" fontWeight="700" fontFamily="JetBrains Mono">{p.ytd >= 0 ? "+" : ""}{p.ytd}% YTD</text>}
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Selected Node Correlations ── */}
      {selectedNode && nodePos[selectedNode] && (() => {
        const node = nodePos[selectedNode];
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 8, marginBottom: 8, animation: "fadeUp .3s ease both" }}>
            {/* Product card */}
            <div style={{ background: "#fff", border: `2px solid ${node.color}33`, borderRadius: 14, padding: 12 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: node.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={node.icon} size={24} color={node.color} /></div>
                <div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 800, color: node.color }}>{node.ticker}</div>
                  <div style={{ fontSize: 17, color: "#33333480" }}>{node.name}</div>
                  <span style={{ fontSize: 14, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: (catConfig[node.cat]?.color || "#A09080") + "18", color: catConfig[node.cat]?.color || "#A09080" }}>{node.cat}</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "Price", val: "$" + (node.price >= 1000 ? node.price.toLocaleString() : node.price), color: "#333334" },
                  { label: "Day", val: (node.change >= 0 ? "+" : "") + node.change + "%", color: node.change >= 0 ? "#5B8C5A" : "#EF5350" },
                  { label: "YTD Return", val: (node.ytd >= 0 ? "+" : "") + node.ytd + "%", color: node.ytd >= 0 ? "#5B8C5A" : "#EF5350" },
                  { label: "Connections", val: nodeCorrs.length, color: "#42A5F5" },
                ].map((m, i) => (
                  <div key={i} style={{ background: "#FFFDF5", borderRadius: 10, padding: "8px 10px" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#33333480", textTransform: "uppercase" }}>{m.label}</div>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 18, fontWeight: 700, color: m.color }}>{m.val}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setSeesawPair(p => ({ ...p, a: selectedNode }))} style={{ width: "100%", marginTop: 10, padding: "8px", borderRadius: 10, border: "1.5px solid #C48830", background: "#FFF8EE", color: "#C48830", fontSize: 17, fontWeight: 800, cursor: "pointer" }}>Set as Seesaw Left Side</button>
            </div>

            {/* Correlations list */}
            <div style={{ background: "#fff", borderRadius: 14, padding: 12, maxHeight: 300, overflow: "auto" }}>
              <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 4 }}>All Correlations for {node.ticker}</div>
              <div style={{ fontSize: 17, color: "#33333480", marginBottom: 12 }}>Click any row to load into seesaw · red = hedge opportunity</div>
              {nodeCorrs.map((c, i) => {
                const otherId = c.a === selectedNode ? c.b : c.a;
                const other = macroProducts.find(p => p.id === otherId);
                if (!other) return null;
                const isPos = c.corr > 0;
                const strength = Math.abs(c.corr);
                return (
                  <div key={i} onClick={() => setSeesawPair({ a: selectedNode, b: otherId })}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 12px", borderRadius: 12, marginBottom: 4, cursor: "pointer", background: isPos ? "#FFF8EE08" : "#FFEBEE12", border: "1.5px solid transparent", transition: "all .15s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = isPos ? "#C4883044" : "#EF535044"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}>
                    <Icon name={other.icon} size={11} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontFamily: "JetBrains Mono", fontWeight: 800, fontSize: 18 }}>{other.ticker}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: (catConfig[other.cat]?.color || "#A09080") + "15", color: catConfig[other.cat]?.color || "#A09080" }}>{other.cat}</span>
                      </div>
                      <div style={{ fontSize: 14, color: "#8A7040", marginTop: 1 }}>{c.desc.length > 60 ? c.desc.slice(0, 58) + ".." : c.desc}</div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 0 }}>
                      <div style={{ fontFamily: "JetBrains Mono", fontSize: 18, fontWeight: 700, color: isPos ? "#5B8C5A" : "#EF5350" }}>{isPos ? "+" : ""}{c.corr.toFixed(2)}</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: isPos ? "#5B8C5A" : "#EF5350" }}>{isPos ? "▲ Correlated" : "▼ Hedge"}</div>
                    </div>
                    <div style={{ width: 44, height: 6, background: "#FFF5E6", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: strength * 100 + "%", background: isPos ? "#5B8C5A" : "#EF5350", borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── Top Hedges & Risk ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8, animation: "fadeUp .4s ease .25s both" }}>
        {/* Best Hedging Pairs */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 12 }}>
          <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 12 }}>Best Hedging Pairs</div>
          {topHedges.map((c, i) => {
            const pA = macroProducts.find(p => p.id === c.a);
            const pB = macroProducts.find(p => p.id === c.b);
            if (!pA || !pB) return null;
            return (
              <div key={i} onClick={() => setSeesawPair({ a: c.a, b: c.b })}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 10, marginBottom: 4, cursor: "pointer", background: "#FFEBEE08", border: "1px solid #F0E6D0", transition: "all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#FFEBEE22"; e.currentTarget.style.borderColor = "#EF535033"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#FFEBEE08"; e.currentTarget.style.borderColor = "#F0E6D0"; }}>
                <Icon name={pA.icon} size={12} />
                <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 17, minWidth: 30 }}>{pA.ticker}</span>
                <span style={{ color: "#EF5350", fontSize: 18, fontWeight: 700 }}>⟺</span>
                <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 17, minWidth: 30 }}>{pB.ticker}</span>
                <Icon name={pB.icon} size={12} />
                <div style={{ flex: 1 }} />
                <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 18, color: "#EF5350" }}>ρ {c.corr.toFixed(2)}</span>
                <div style={{ width: 36, height: 5, background: "#FFF5E6", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: Math.abs(c.corr) * 100 + "%", background: "#EF5350", borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Asset Class Diversification */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 12 }}>
          <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 12 }}>Macro Diversification Score</div>
          {cats.map(cat => {
            const cc = catConfig[cat] || { color: "#33333480", icon: "chart-bar" };
            const count = (catGroups[cat] || []).length;
            const pct = Math.round(count / macroProducts.length * 100);
            return (
              <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Icon name={cc.icon} size={12} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{cat}</span>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700, color: cc.color }}>{count} products</span>
                  </div>
                  <div style={{ height: 6, background: "#FFF5E6", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: pct + "%", background: cc.color, borderRadius: 3 }} />
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 10, padding: "8px 10px", background: "#FFF8EE", borderRadius: 10, fontSize: 15, fontWeight: 700, color: "#C48830" }}>
            {cats.length} macro asset classes across {macroProducts.length} products — well diversified
          </div>
        </div>
      </div>
    </div>
  );
}


// ═══════════════ BROKERAGES / LINKED ACCOUNTS ═══════════════

const brokerageProviders = [
  { id:"schwab", name:"Charles Schwab", logo:"bank", color:"#2A6DDE", status:"connected", accts:[{name:"Individual Brokerage",num:"••••8742",type:"Margin",balance:42180,buying:18400},{name:"Roth IRA",num:"••••3291",type:"Retirement",balance:19067,buying:6200}], features:["Stocks","Options","Futures","ETFs","Bonds"], lastSync:"2 min ago" },
  { id:"ibkr", name:"Interactive Brokers", logo:"circle-red", color:"#D4214E", status:"connected", accts:[{name:"Portfolio Margin",num:"••••5518",type:"Margin",balance:84620,buying:142000}], features:["Stocks","Options","Futures","Forex","Crypto","Bonds"], lastSync:"5 min ago" },
  { id:"fidelity", name:"Fidelity", logo:"circle-green", color:"#4A8C3F", status:"disconnected", accts:[], features:["Stocks","Options","ETFs","Mutual Funds","Bonds"], lastSync:null },
  { id:"tdameritrade", name:"TD Ameritrade", logo:"square-green", color:"#3D8B37", status:"disconnected", accts:[], features:["Stocks","Options","Futures","ETFs","Forex"], lastSync:null },
  { id:"etrade", name:"E*TRADE", logo:"circle-purple", color:"#6B2D8B", status:"disconnected", accts:[], features:["Stocks","Options","ETFs","Bonds"], lastSync:null },
  { id:"robinhood", name:"Robinhood", logo:"feather", color:"#00C805", status:"disconnected", accts:[], features:["Stocks","Options","ETFs","Crypto"], lastSync:null },
  { id:"tastytrade", name:"tastytrade", logo:"cherry", color:"#FF2D55", status:"disconnected", accts:[], features:["Stocks","Options","Futures","Crypto"], lastSync:null },
  { id:"webull", name:"Webull", logo:"bull", color:"#F04D2D", status:"disconnected", accts:[], features:["Stocks","Options","ETFs","Crypto"], lastSync:null },
  { id:"tradier", name:"Tradier", logo:"chart-bar", color:"#1DA1F2", status:"disconnected", accts:[], features:["Stocks","Options","ETFs"], lastSync:null },
  { id:"alpaca", name:"Alpaca", logo:"llama", color:"#FFCD00", status:"disconnected", accts:[], features:["Stocks","ETFs","Crypto"], lastSync:null },
];

function BrokeragesPage() {
  const [brokers, setBrokers] = useState(brokerageProviders);
  const [connecting, setConnecting] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [routePref, setRoutePref] = useState("smart");

  const connected = brokers.filter(b => b.status === "connected");
  const available = brokers.filter(b => b.status !== "connected");
  const totalBalance = connected.reduce((s, b) => s + b.accts.reduce((as, a) => as + a.balance, 0), 0);
  const totalBuying = connected.reduce((s, b) => s + b.accts.reduce((as, a) => as + a.buying, 0), 0);
  const totalAccts = connected.reduce((s, b) => s + b.accts.length, 0);

  const handleConnect = (id) => {
    setConnecting(id);
    setTimeout(() => {
      setBrokers(prev => prev.map(b => b.id === id ? {
        ...b, status: "connected", lastSync: "just now",
        accts: [{ name: "Individual Brokerage", num: "••••" + Math.floor(1000 + Math.random() * 9000), type: "Margin", balance: Math.floor(10000 + Math.random() * 50000), buying: Math.floor(5000 + Math.random() * 30000) }]
      } : b));
      setConnecting(null);
    }, 2200);
  };

  const handleDisconnect = (id) => {
    setBrokers(prev => prev.map(b => b.id === id ? { ...b, status: "disconnected", accts: [], lastSync: null } : b));
    setShowConfirm(null);
    setSelectedBroker(null);
  };

  return (
    <div>
      <div style={{ marginBottom: 8, animation: "fadeUp .3s ease both" }}>
        <h1 style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>Linked Accounts</h1>
        <p style={{ color: "#33333480", fontSize: 15, marginTop: 3 }}>Connect your brokerages — BasketTrade executes trades on your existing accounts</p>
      </div>

      {/* ── Aggregated Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(80px,1fr))", gap: 6, marginBottom: 8, animation: "fadeUp .4s ease .05s both" }}>
        {[
          { label: "Total Balance", val: "$" + (totalBalance / 1000).toFixed(1) + "k", icon: "money", color: "#333334", bg: "#fff" },
          { label: "Buying Power", val: "$" + (totalBuying / 1000).toFixed(1) + "k", icon: "bolt", color: "#C48830", bg: "#FFF8EE" },
          { label: "Linked Brokers", val: connected.length, icon: "link", color: "#42A5F5", bg: "#E3F2FD" },
          { label: "Accounts", val: totalAccts, icon: "bank", color: "#AB47BC", bg: "#F0E8F5" },
          { label: "Order Routing", val: routePref === "smart" ? "Smart" : "Manual", icon: "target", color: "#C48830", bg: "#FFF8EE" },
        ].map((m, i) => (
          <div key={i} style={{ background: m.bg, borderRadius: 16, padding: "8px 10px", animation: "fadeUp .4s ease " + (i * .04) + "s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#33333480", textTransform: "uppercase", letterSpacing: .5 }}>{m.label}</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 18, fontWeight: 700, color: m.color, marginTop: 2 }}>{m.val}</div>
              </div>
              <Icon name={m.icon} size={12} />
            </div>
          </div>
        ))}
      </div>

      {/* ── How It Works Banner ── */}
      <div style={{ background: "linear-gradient(135deg, #fff, #FFF8EE)", border: "1px solid #33333440", borderRadius: 14, padding: "18px 22px", marginBottom: 10, animation: "fadeUp .4s ease .08s both" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 300px" }}>
            <div style={{ fontSize: 17, fontWeight: 900, fontFamily: "'Instrument Serif', serif", marginBottom: 4 }}>How It Works</div>
            <div style={{ fontSize: 18, color: "#8A7040", lineHeight: 1.6 }}>BasketTrade connects to your existing brokerage via secure OAuth — we never store your password. When you buy a basket, we send orders directly to your broker for execution. Your funds stay with your broker at all times.</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[{ step: "1", label: "Link Account", icon: "link" }, { step: "2", label: "Choose Basket", icon: "basket" }, { step: "3", label: "We Execute", icon: "bolt" }].map(s => (
              <div key={s.step} style={{ textAlign: "center", minWidth: 0, flex: "1" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 4px", border: "1px solid #33333440" }}><Icon name={s.icon} size={18} color="#C48830" /></div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#C48830" }}>STEP {s.step}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#6B5A2E" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Connected Brokerages ── */}
      {connected.length > 0 && (
        <div style={{ marginBottom: 10, animation: "fadeUp .4s ease .12s both" }}>
          <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#C48830" }} /> Connected ({connected.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {connected.map(broker => {
              const isExpanded = selectedBroker === broker.id;
              return (
                <div key={broker.id} style={{ background: "#fff", border: "1.5px solid " + (isExpanded ? broker.color + "44" : "#F0E6D0"), borderRadius: 14, overflow: "hidden", transition: "all .3s" }}>
                  {/* Broker Header */}
                  <div onClick={() => setSelectedBroker(isExpanded ? null : broker.id)}
                    style={{ padding: "18px 22px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                    onMouseEnter={e => e.currentTarget.style.background = "#FFFDF5"} onMouseLeave={e => e.currentTarget.style.background = ""}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: broker.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, border: "1.5px solid " + broker.color + "22" }}>{broker.logo}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>{broker.name}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: "#FFF8EE", color: "#C48830" }}>● CONNECTED</span>
                      </div>
                      <div style={{ fontSize: 17, color: "#33333480", marginTop: 2 }}>{broker.accts.length} account{broker.accts.length !== 1 ? "s" : ""} · Last sync: {broker.lastSync}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 700 }}>${(broker.accts.reduce((s, a) => s + a.balance, 0) / 1000).toFixed(1)}k</div>
                      <div style={{ fontSize: 15, color: "#33333480" }}>Total Balance</div>
                    </div>
                    <span style={{ fontSize: 18, color: "#33333480", transform: isExpanded ? "rotate(180deg)" : "", transition: "transform .3s" }}>▾</span>
                  </div>

                  {/* Expanded Account Details */}
                  {isExpanded && (
                    <div style={{ borderTop: "2px solid #F0E6D0", animation: "fadeUp .2s ease both" }}>
                      {/* Account Cards */}
                      <div style={{ padding: "16px 22px" }}>
                        {broker.accts.map((acct, ai) => (
                          <div key={ai} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", background: "#FFFDF5", borderRadius: 16, marginBottom: 8, border: "1px solid #F0E6D0" }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: broker.color + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, fontFamily: "JetBrains Mono", color: broker.color }}>{acct.type === "Retirement" ? "IRA" : "MRG"}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 800, fontSize: 15, fontFamily: "'Instrument Serif', serif" }}>{acct.name}</div>
                              <div style={{ fontSize: 15, color: "#33333480", fontFamily: "JetBrains Mono" }}>{acct.num} · {acct.type}</div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, textAlign: "right" }}>
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 800, color: "#33333480", textTransform: "uppercase" }}>Balance</div>
                                <div style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 700 }}>${(acct.balance / 1000).toFixed(1)}k</div>
                              </div>
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 800, color: "#33333480", textTransform: "uppercase" }}>Buying Power</div>
                                <div style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 700, color: "#C48830" }}>${(acct.buying / 1000).toFixed(1)}k</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Features & Actions */}
                      <div style={{ padding: "0 22px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {broker.features.map(f => (
                            <span key={f} style={{ fontSize: 14, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: broker.color + "12", color: broker.color }}>{f}</span>
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button style={{ padding: "6px 14px", borderRadius: 10, border: "1px solid #33333440", background: "#fff", fontSize: 17, fontWeight: 700, cursor: "pointer", color: "#8A7040" }}>Sync Now</button>
                          <button onClick={() => setShowConfirm(broker.id)} style={{ padding: "6px 14px", borderRadius: 10, border: "1.5px solid #EF535033", background: "#FFEBEE", fontSize: 17, fontWeight: 700, cursor: "pointer", color: "#EF5350" }}>Disconnect</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Available Brokerages ── */}
      <div style={{ animation: "fadeUp .4s ease .16s both" }}>
        <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif", marginBottom: 12 }}>Add a Brokerage</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6 }}>
          {available.map((broker, i) => {
            const isConnecting = connecting === broker.id;
            return (
              <div key={broker.id} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", transition: "all .3s", animation: "fadeUp .4s ease " + (i * .04) + "s both" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = broker.color + "44"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#F0E6D0"; e.currentTarget.style.transform = ""; }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: broker.color + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, border: "1.5px solid " + broker.color + "18" }}>{broker.logo}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>{broker.name}</div>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: 3 }}>
                      {broker.features.slice(0, 4).map(f => (
                        <span key={f} style={{ fontSize: 12, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: "#FFF5E6", color: "#8A7040" }}>{f}</span>
                      ))}
                      {broker.features.length > 4 && <span style={{ fontSize: 12, color: "#33333480" }}>+{broker.features.length - 4}</span>}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleConnect(broker.id)} disabled={isConnecting}
                  style={{ width: "100%", padding: "10px", borderRadius: 14, border: "none", background: isConnecting ? "#FFF5E6" : "linear-gradient(135deg, " + broker.color + ", " + broker.color + "CC)", color: isConnecting ? "#A09080" : "#fff", fontSize: 15, fontWeight: 800, cursor: isConnecting ? "default" : "pointer", fontFamily: "'Instrument Serif', serif", transition: "all .2s" }}>
                  {isConnecting ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <span style={{ display: "inline-block", width: 14, height: 14, border: "1.5px solid #A09080", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
                      Connecting via OAuth...
                    </span>
                  ) : "Connect " + broker.name}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Order Routing Preferences ── */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginTop: 10, animation: "fadeUp .4s ease .2s both" }}>
        <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 4 }}>Execution Settings</div>
        <div style={{ fontSize: 17, color: "#33333480", marginBottom: 7 }}>Control how BasketTrade routes orders across your linked accounts</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6 }}>
          {[
            { id: "smart", name: "Smart Routing", desc: "Auto-select best account based on buying power, margin, and commission", icon: "brain", rec: true },
            { id: "lowest_cost", name: "Lowest Cost", desc: "Always route to the account with the lowest commissions", icon: "money" },
            { id: "manual", name: "Manual Select", desc: "Choose which account to use before each Hatch purchase", icon: "hand" },
            { id: "split", name: "Split Across", desc: "Distribute positions across multiple accounts proportionally", icon: "shuffle" },
          ].map(opt => (
            <div key={opt.id} onClick={() => setRoutePref(opt.id)}
              style={{ padding: "8px 10px", borderRadius: 16, border: "1.5px solid " + (routePref === opt.id ? "#C48830" : "#F0E6D0"), background: routePref === opt.id ? "#FFF8EE" : "#FFFDF5", cursor: "pointer", transition: "all .2s", position: "relative" }}>
              {opt.rec && <span style={{ position: "absolute", top: -6, right: 10, fontSize: 12, fontWeight: 800, padding: "1px 8px", borderRadius: 6, background: "#C48830", color: "#fff" }}>RECOMMENDED</span>}
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <Icon name={opt.icon} size={10} />
                <span style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: routePref === opt.id ? "#C48830" : "#5C4A1E" }}>{opt.name}</span>
              </div>
              <div style={{ fontSize: 17, color: "#8A7040", lineHeight: 1.5 }}>{opt.desc}</div>
              {routePref === opt.id && <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#C48830", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, position: "absolute", top: 14, right: 14 }}>✓</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Security Footer ── */}
      <div style={{ marginTop: 10, padding: "16px 22px", background: "#FFFDF5", border: "1px solid #33333440", borderRadius: 18, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", animation: "fadeUp .4s ease .24s both" }}>
        {[
          { icon: "lock", label: "256-bit Encryption", desc: "Bank-grade TLS" },
          { icon: "lock", label: "OAuth 2.0", desc: "No passwords stored" },
          { icon: "shield", label: "SOC 2 Type II", desc: "Audited annually" },
          { icon: "clipboard", label: "Read + Trade", desc: "Permissioned access only" },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", flex: "1 1 140px" }}>
            <Icon name={s.icon} size={11} />
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Instrument Serif', serif" }}>{s.label}</div>
              <div style={{ fontSize: 14, color: "#33333480" }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Disconnect Confirm Modal ── */}
      {showConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(45,32,22,.4)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowConfirm(null)}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "14px 28px 22px", width: 380, animation: "popIn .3s ease", border: "1px solid #33333440" }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 60 }}></span>
              <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif", marginTop: 8 }}>Disconnect Brokerage?</div>
              <div style={{ fontSize: 18, color: "#8A7040", marginTop: 4, lineHeight: 1.5 }}>This will revoke BasketTrade's access. Open orders will still execute, but new basket trades won't route to this account.</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setShowConfirm(null)} style={{ flex: 1, padding: "12px", borderRadius: 14, border: "1px solid #33333440", background: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", color: "#8A7040" }}>Cancel</button>
              <button onClick={() => handleDisconnect(showConfirm)} style={{ flex: 1, padding: "12px", borderRadius: 14, border: "none", background: "#EF5350", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>Disconnect</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ═══════════════ MY ACCOUNT PAGE ═══════════════

// ═══════════════ NEWS PAGE ═══════════════

function NewsPage({ liveNews = [], newsStatus = "mock" }) {
  const [activeSection, setActiveSection] = useState("terminal");
  const sections = [
    { id: "all", label: "All", icon: "newspaper" },
    { id: "terminal", label: "Terminal", icon: "bolt" },
    { id: "x", label: "X", icon: "𝕏" },
    { id: "analyst", label: "Analyst", icon: "target" },
    { id: "sector", label: "Sectors", icon: "globe" },
  ];

  const xPosts = [
    { id: 1, handle: "@zerohedge", name: "ZeroHedge", verified: true, time: "12m", text: "BREAKING: 10Y yield surges past 4.65% as Treasury auction shows weakest demand since 2022. Risk-off incoming?", likes: "4.2K", reposts: "1.8K", tag: "Bonds" },
    { id: 2, handle: "@unusual_whales", name: "Unusual Whales", verified: true, time: "28m", text: "Large NVDA put sweep: $120 strike, March expiry, $2.4M premium. Institutional hedging ahead of earnings? whale", likes: "3.1K", reposts: "892", tag: "Options" },
    { id: 3, handle: "@MacroAlf", name: "Alfonso Peccatiello", verified: true, time: "1h", text: "Credit spreads widening in Europe while US equity vol remains suppressed. Something has to give. My framework says: reduce risk now.", likes: "2.8K", reposts: "1.2K", tag: "Macro" },
    { id: 4, handle: "@DeItaone", name: "Walter Bloomberg", verified: true, time: "1h", text: "CHINA PBOC CUTS RRR BY 50BPS, EFFECTIVE IMMEDIATELY. Largest easing move since 2020. EM equities rallying.", likes: "5.6K", reposts: "3.4K", tag: "Central Banks" },
    { id: 5, handle: "@TechCrunch", name: "TechCrunch", verified: true, time: "2h", text: "OpenAI reportedly in talks to raise at $350B valuation. AI infrastructure spend accelerating across big tech.", likes: "1.9K", reposts: "642", tag: "AI" },
    { id: 6, handle: "@markets", name: "Bloomberg Markets", verified: true, time: "3h", text: "Oil jumps 3.8% after Middle East tensions escalate. Brent crude back above $85. Energy stocks leading S&P.", likes: "2.4K", reposts: "980", tag: "Energy" },
    { id: 7, handle: "@jimcramer", name: "Jim Cramer", verified: true, time: "4h", text: "I've been saying it for weeks — defense stocks are the play here. LMT, RTX, GD all breaking out. This is NOT the time to sell.", likes: "1.1K", reposts: "340", tag: "Defense" },
  ];

  const analystNotes = [
    { id: 1, firm: "Goldman Sachs", analyst: "David Kostin", action: "UPGRADE", target: "S&P 500 → 6,500", summary: "Raises year-end target citing stronger-than-expected earnings growth and AI productivity gains.", time: "Today", color: "#42A5F5" },
    { id: 2, firm: "Morgan Stanley", analyst: "Mike Wilson", action: "DOWNGRADE", target: "TSLA → $180", summary: "Cuts price target on deteriorating EV margins and increased competition from BYD in China.", time: "Today", color: "#EF5350" },
    { id: 3, firm: "JP Morgan", analyst: "Marko Kolanovic", action: "HOLD", target: "Portfolio Risk: Elevated", summary: "Recommends increasing cash allocation to 15-20%. Credit cycle nearing late stage. Favors quality over growth.", time: "Yesterday", color: "#FFA726" },
    { id: 4, firm: "Bank of America", analyst: "Savita Subramanian", action: "UPGRADE", target: "Healthcare → Overweight", summary: "Rotates into defensive healthcare. UNH, LLY, ABBV rated top picks on earnings resilience and dividend growth.", time: "Yesterday", color: "#5B8C5A" },
    { id: 5, firm: "Citi Research", analyst: "Andrew Hollenhorst", action: "ALERT", target: "Fed Funds: 3 Cuts in 2026", summary: "Inflation data supports June cut. Market pricing only 1.5 cuts — significant mispricing opportunity in rates.", time: "2d ago", color: "#7E57C2" },
    { id: 6, firm: "Barclays", analyst: "Venu Krishna", action: "UPGRADE", target: "NVDA → $185", summary: "Blackwell Ultra demand exceeding supply forecasts by 40%. Data center capex cycle has multi-year runway.", time: "2d ago", color: "#42A5F5" },
  ];

  const sectorNews = [
    { sector: "Technology", icon: "laptop", trend: "up", change: "+1.2%", headlines: [
      { title: "NVDA earnings beat: Revenue $38.2B vs $37.1B est.", time: "2h", hot: true },
      { title: "Apple announces M5 chip family, shares up 2.8%", time: "5h" },
      { title: "EU Digital Markets Act fines Meta $1.3B", time: "8h" },
    ]},
    { sector: "Energy", icon: "gas-pump", trend: "up", change: "+2.8%", headlines: [
      { title: "Brent crude tops $85 on Middle East supply fears", time: "1h", hot: true },
      { title: "Chevron announces $20B buyback expansion", time: "4h" },
      { title: "OPEC+ extends production cuts through Q3 2026", time: "6h" },
    ]},
    { sector: "Healthcare", icon: "hospital", trend: "up", change: "+0.6%", headlines: [
      { title: "Eli Lilly obesity drug shows 26% weight loss in Phase 3", time: "3h", hot: true },
      { title: "UnitedHealth raises 2026 guidance above consensus", time: "7h" },
      { title: "FDA fast-tracks Alzheimer's treatment from Biogen", time: "12h" },
    ]},
    { sector: "Financials", icon: "bank", trend: "down", change: "-0.4%", headlines: [
      { title: "Regional bank concerns resurface on CRE exposure", time: "1h" },
      { title: "Goldman Sachs Q4 trading revenue tops $5B", time: "6h" },
      { title: "Fed stress test results: all majors pass with buffers", time: "1d" },
    ]},
    { sector: "Defense", icon: "shield", trend: "up", change: "+1.8%", headlines: [
      { title: "Pentagon awards $48B multi-year contract to Lockheed", time: "4h", hot: true },
      { title: "European defense spending pledges hit record levels", time: "8h" },
      { title: "RTX backlog reaches all-time high of $202B", time: "1d" },
    ]},
    { sector: "Real Estate", icon: "home", trend: "down", change: "-1.1%", headlines: [
      { title: "30-year mortgage rate climbs to 7.2%, highest since Oct", time: "2h" },
      { title: "Office vacancy rate hits 20% in major metros", time: "1d" },
      { title: "REITs underperform as rate cut expectations fade", time: "1d" },
    ]},
  ];

  const actionCol = { UPGRADE: "#5B8C5A", DOWNGRADE: "#EF5350", HOLD: "#FFA726", ALERT: "#7E57C2" };
  const actionBg = { UPGRADE: "#EDF5ED", DOWNGRADE: "#FFEBEE", HOLD: "#FFF3E0", ALERT: "#F3E8FD" };

  const showTerminal = activeSection === "all" || activeSection === "terminal";
  const showX = activeSection === "all" || activeSection === "x";
  const showAnalyst = activeSection === "all" || activeSection === "analyst";
  const showSector = activeSection === "all" || activeSection === "sector";

  const priorityCol = { flash: "#EF5350", urgent: "#FFA726", high: "#C48830", normal: "#A09080" };
  const priorityBg = { flash: "#FFEBEE", urgent: "#FFF3E0", high: "#FFF8EE", normal: "#F5F5F3" };
  const impactCol = { bullish: "#5B8C5A", bearish: "#EF5350", mixed: "#C48830" };
  const impactBg = { bullish: "#EDF5ED", bearish: "#FFEBEE", mixed: "#FFF8EE" };

  return (
    <div>
      {/* Section Filter Pills */}
      <div className="no-scrollbar" style={{ display: "flex", gap: 4, marginBottom: 10, overflowX: "auto", paddingBottom: 2 }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            style={{ display: "flex", alignItems: "center", gap: 3, padding: "5px 10px", borderRadius: 10, border: activeSection === s.id ? "1.5px solid #C48830" : "1.5px solid #F0E6D0", background: activeSection === s.id ? "#FFF8EE" : "#fff", color: activeSection === s.id ? "#C48830" : "#A09080", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Quicksand", whiteSpace: "nowrap", transition: "all .2s" }}>
            <Icon name={s.icon} size={10} /> {s.label}
          </button>
        ))}
      </div>

      {/* ── Live Terminal Feed ── */}
      {showTerminal && <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8, animation: "fadeUp .4s ease both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>Terminal Feed</div>
          <span style={{ fontSize: 12, fontWeight: 700, color: newsStatus === "live" ? "#5B8C5A" : newsStatus === "mock" ? "#FFA726" : "#A09080" }}>
            {newsStatus === "live" ? "● Live" : newsStatus === "loading" ? "● Loading..." : "● Sample"}
          </span>
        </div>
        {liveNews.slice(0, 20).map((n, i) => (
          <div key={n.id} style={{ padding: "8px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontFamily: "JetBrains Mono", color: "#33333460", fontWeight: 600 }}>{n.time}</span>
              <span style={{ fontSize: 9, fontWeight: 900, padding: "1px 4px", borderRadius: 3, background: priorityBg[n.priority] || "#F5F5F3", color: priorityCol[n.priority] || "#A09080", textTransform: "uppercase" }}>{n.priority}</span>
              <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 4px", borderRadius: 3, background: "#F0E6D0", color: "#8A7040" }}>{n.cat}</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#333334", lineHeight: 1.3, marginBottom: 3 }}>{n.headline}</div>
            {n.desc && <div style={{ fontSize: 11, color: "#33333480", lineHeight: 1.3, marginBottom: 3 }}>{n.desc.slice(0, 120)}{n.desc.length > 120 ? "..." : ""}</div>}
            <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, color: "#33333460" }}>{n.source}</span>
              <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 4px", borderRadius: 3, background: impactBg[n.impact] || "#F5F5F3", color: impactCol[n.impact] || "#A09080" }}>{(n.impact || "mixed").toUpperCase()}</span>
              {n.move && <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", fontWeight: 700, color: n.move.startsWith("+") ? "#5B8C5A" : "#EF5350" }}>{n.move}</span>}
              {n.assets && n.assets.length > 0 && n.assets.slice(0, 4).map(a => (
                <span key={a} style={{ fontSize: 9, fontWeight: 700, padding: "1px 3px", borderRadius: 2, background: "#FFFDF5", border: "1px solid #F0E6D0", color: "#8A7040" }}>{a}</span>
              ))}
            </div>
          </div>
        ))}
        {liveNews.length === 0 && <div style={{ textAlign: "center", padding: 20, color: "#33333440", fontSize: 13 }}>No news available</div>}
      </div>}

      {/* ── News from X ── */}
      {showX && <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8, animation: "fadeUp .4s ease .05s both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>𝕏 Trending on X</div>
          <span style={{ fontSize: 12, color: "#5B8C5A", fontWeight: 700 }}>● Live</span>
        </div>
        {xPosts.map((p, i) => (
          <div key={p.id} style={{ padding: "8px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 900 }}>{p.name.charAt(0)}</div>
                <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: "#333334" }}>{p.name}</span>
                {p.verified && <svg width="10" height="10" viewBox="0 0 24 24" fill="#1DA1F2"><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/></svg>}
                <span style={{ fontSize: 11, color: "#33333480" }}>{p.handle}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#1A1A1A", background: "#F0E6D0", padding: "1px 5px", borderRadius: 3 }}>{p.tag}</span>
                <span style={{ fontSize: 11, color: "#33333480" }}>{p.time}</span>
              </div>
            </div>
            <div style={{ fontSize: 14, color: "#333334", lineHeight: 1.4, marginLeft: 26, marginBottom: 4 }}>{p.text}</div>
            <div style={{ display: "flex", gap: 12, marginLeft: 26 }}>
              <span style={{ fontSize: 11, color: "#33333480" }}>♡ {p.likes}</span>
              <span style={{ fontSize: 11, color: "#33333480" }}>⟳ {p.reposts}</span>
            </div>
          </div>
        ))}
      </div>}

      {/* ── Analyst Reports ── */}
      {showAnalyst && <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8, animation: "fadeUp .4s ease .1s both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>Analyst Reports</div>
          <span style={{ fontSize: 12, color: "#33333480" }}>{analystNotes.length} notes</span>
        </div>
        {analystNotes.map((a, i) => (
          <div key={a.id} style={{ padding: "8px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: actionCol[a.action], background: actionBg[a.action], padding: "2px 6px", borderRadius: 4 }}>{a.action}</span>
                <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: "#333334" }}>{a.firm}</span>
              </div>
              <span style={{ fontSize: 11, color: "#33333480" }}>{a.time}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
              <span style={{ fontSize: 12, color: "#8A7040" }}>by {a.analyst}</span>
              <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", fontWeight: 800, color: a.color }}>{a.target}</span>
            </div>
            <div style={{ fontSize: 12, color: "#333334", lineHeight: 1.4 }}>{a.summary}</div>
          </div>
        ))}
      </div>}

      {/* ── Global Sector News ── */}
      {showSector && <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8, animation: "fadeUp .4s ease .15s both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>Global Sector News</div>
          <span style={{ fontSize: 12, color: "#33333480" }}>6 sectors</span>
        </div>
        {sectorNews.map((s, si) => (
          <div key={s.sector} style={{ marginBottom: si < sectorNews.length - 1 ? 8 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, padding: "4px 6px", background: s.trend === "up" ? "#EDF5ED" : "#FFEBEE", borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Icon name={s.icon} size={12} />
                <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: "#333334" }}>{s.sector}</span>
              </div>
              <span style={{ fontSize: 14, fontFamily: "JetBrains Mono", fontWeight: 800, color: s.trend === "up" ? "#5B8C5A" : "#EF5350" }}>{s.change}</span>
            </div>
            {s.headlines.map((h, hi) => (
              <div key={hi} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 6px", borderBottom: hi < s.headlines.length - 1 ? "1px solid #F0E6D020" : "none" }}>
                {h.hot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF5350", flexShrink: 0 }} />}
                {!h.hot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D0C8B8", flexShrink: 0 }} />}
                <span style={{ fontSize: 12, color: "#333334", flex: 1, lineHeight: 1.3 }}>{h.title}</span>
                <span style={{ fontSize: 11, color: "#33333480", flexShrink: 0 }}>{h.time}</span>
              </div>
            ))}
          </div>
        ))}
      </div>}
    </div>
  );
}

function MyAccountPage({ onNavigate, onSignOut, user }) {
  const [acctSection, setAcctSection] = useState(null);
  const [twoFA, setTwoFA] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [tradeConfirm, setTradeConfirm] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  const Toggle = ({ on, onToggle, label }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #33333420" }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: "#6B5A2E" }}>{label}</span>
      <div onClick={onToggle} style={{ width: 44, height: 24, borderRadius: 12, background: on ? "#C48830" : "#E8DCC8", cursor: "pointer", position: "relative", transition: "background .2s" }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: on ? 22 : 2, transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.15)" }} />
      </div>
    </div>
  );

  const MenuItem = ({ icon, label, desc, badge, badgeColor, onClick, danger }) => (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid #33333420", transition: "background .15s" }}
      onMouseEnter={e => e.currentTarget.style.background = "#fff"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: danger ? "#FFEBEE" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}><Icon name={icon} size={18} color={danger ? "#EF5350" : "#C48830"} /></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: danger ? "#EF5350" : "#5C4A1E" }}>{label}</div>
        {desc && <div style={{ fontSize: 17, color: "#33333480", marginTop: 1 }}>{desc}</div>}
      </div>
      {badge && <span style={{ fontSize: 15, fontWeight: 800, padding: "3px 10px", borderRadius: 8, background: (badgeColor || "#C48830") + "18", color: badgeColor || "#C48830" }}>{badge}</span>}
      <span style={{ color: "#E8DCC8", fontSize: 18 }}>›</span>
    </div>
  );

  // Sub-page: back button
  const BackHeader = ({ title, icon }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
      <button onClick={() => setAcctSection(null)} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #33333440", background: "#fff", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
      <div>
        <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Instrument Serif', serif", display: "flex", alignItems: "center", gap: 6 }}><Icon name={icon} size={14} /> {title}</div>
      </div>
    </div>
  );

  // ── SUB-SECTIONS ──
  if (acctSection === "brokerages") return <div><BackHeader title="Linked Brokerages" icon="bank" /><BrokeragesPage /></div>;

  if (acctSection === "trades") return (
    <div>
      <BackHeader title="Trade History" icon="clipboard" />
      <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr .5fr .5fr .5fr .7fr", padding: "8px 12px", borderBottom: "2px solid #F0E6D0", fontSize: 15, color: "#33333480", textTransform: "uppercase", letterSpacing: 1, fontWeight: 800, background: "#fff" }}><div>Basket</div><div>Action</div><div>Date</div><div>Status</div><div style={{ textAlign: "right" }}>Amount</div></div>
        {recentTrades.map((t, i) => <div key={t.id} style={{ display: "grid", gridTemplateColumns: "1.3fr .5fr .5fr .5fr .7fr", padding: "8px 12px", borderBottom: i < recentTrades.length - 1 ? "1px solid #F0E6D0" : "none", alignItems: "center", transition: "background .2s" }} onMouseEnter={e => e.currentTarget.style.background = "#fff"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Icon name={t.icon} size={10} /><span style={{ fontWeight: 800, fontSize: 18, fontFamily: "'Instrument Serif', serif" }}>{t.basket}</span></div>
          <div style={{ fontSize: 17, fontWeight: 800, color: t.action === "Buy" || t.action === "Dividend" ? "#C48830" : t.action === "Sell" ? "#EF5350" : "#42A5F5" }}>{t.action}</div>
          <div style={{ fontSize: 17, color: "#8A7040" }}>{t.date}</div>
          <div><span style={{ fontSize: 14, fontWeight: 800, padding: "3px 10px", borderRadius: 14, background: t.status === "Completed" ? "#FFF8EE" : "#FFF3E0", color: t.status === "Completed" ? "#5B8C5A" : "#FFA726" }}>{t.status}</span></div>
          <div style={{ textAlign: "right", fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 18, color: t.amount.startsWith("+") ? "#5B8C5A" : "#EF5350" }}>{t.amount}</div>
        </div>)}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
        <StatCard label="Executed" value="142" icon="target" color="terracotta" /><StatCard label="Win Rate" value="72%" icon="trophy" color="sage" /><StatCard label="Avg Return" value="+2.8%" icon="sparkle" color="golden" />
      </div>
    </div>
  );

  if (acctSection === "profile") return (
    <div>
      <BackHeader title="Profile" icon="person" />
      <div style={{ background: "#fff", borderRadius: 14, padding: 14 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 24, paddingBottom: 20, borderBottom: "2px solid #F0E6D0" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#C48830,#EF5350)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, color: "#fff", fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>{(user?.displayName || user?.email || "U").charAt(0).toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>{user?.displayName || "Trader"}</div>
            <div style={{ fontSize: 15, color: "#33333480" }}>{user?.email || ""}</div>
            <span style={{ fontSize: 15, fontWeight: 800, padding: "3px 10px", borderRadius: 8, background: "#FFF8EE", color: "#C48830", marginTop: 4, display: "inline-block" }}>Pro Member</span>
          </div>
        </div>
        {[
          { label: "Full Name", val: user?.displayName || "Trader" },
          { label: "Email", val: user?.email || "" },
          { label: "Phone", val: "+1 (555) 234-5678" },
          { label: "Date of Birth", val: "March 15, 1992" },
          { label: "Country", val: "United States" },
          { label: "Tax ID (SSN)", val: "•••-••-4821" },
          { label: "Member Since", val: "January 2024" },
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < 6 ? "1px solid #F0E6D0" : "none" }}>
            <span style={{ fontSize: 18, color: "#33333480", fontWeight: 700 }}>{f.label}</span>
            <span style={{ fontSize: 15, fontWeight: 700, fontFamily: f.label.includes("Tax") || f.label.includes("Phone") ? "JetBrains Mono" : "Quicksand", color: "#333334" }}>{f.val}</span>
          </div>
        ))}
        <button style={{ marginTop: 8, width: "100%", padding: 12, borderRadius: 14, border: "1.5px solid #C48830", background: "#FFF8EE", color: "#C48830", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "'Instrument Serif', serif" }}>Edit Profile</button>
      </div>
    </div>
  );

  if (acctSection === "security") return (
    <div>
      <BackHeader title="Login & Security" icon="lock" />
      <div style={{ background: "#fff", borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 8, color: "#6B5A2E" }}>Authentication</div>
        <div style={{ padding: "14px 0", borderBottom: "1px solid #33333420", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Password</div>
            <div style={{ fontSize: 17, color: "#33333480" }}>Last changed 42 days ago</div>
          </div>
          <button style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #33333440", background: "#fff", fontSize: 17, fontWeight: 800, cursor: "pointer", color: "#42A5F5" }}>Change</button>
        </div>
        <Toggle on={twoFA} onToggle={() => setTwoFA(!twoFA)} label="Two-Factor Authentication (2FA)" />
        <Toggle on={biometric} onToggle={() => setBiometric(!biometric)} label="Biometric Login (Face ID / Touch ID)" />
        <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 12, marginTop: 10, color: "#6B5A2E" }}>Active Sessions</div>
        {[
          { device: "MacBook Pro — Chrome", loc: "Portland, OR", time: "Active now", current: true },
          { device: "iPhone 15 Pro — Safari", loc: "Portland, OR", time: "2 hours ago", current: false },
          { device: "iPad Air — Safari", loc: "Portland, OR", time: "3 days ago", current: false },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #33333420" }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{s.device}</div>
              <div style={{ fontSize: 15, color: "#33333480" }}>{s.loc} · {s.time}</div>
            </div>
            {s.current ? <span style={{ fontSize: 14, fontWeight: 800, padding: "3px 10px", borderRadius: 8, background: "#FFF8EE", color: "#C48830" }}>This device</span>
            : <button style={{ padding: "5px 12px", borderRadius: 8, border: "1.5px solid #FFEBEE", background: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", color: "#EF5350" }}>Revoke</button>}
          </div>
        ))}
        <button style={{ marginTop: 8, width: "100%", padding: 12, borderRadius: 14, border: "1.5px solid #EF5350", background: "#FFEBEE", color: "#EF5350", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>Sign Out All Other Devices</button>
      </div>
    </div>
  );

  if (acctSection === "notifications") return (
    <div>
      <BackHeader title="Notifications" icon="bell" />
      <div style={{ background: "#fff", borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 4, color: "#6B5A2E" }}>Communication</div>
        <Toggle on={emailNotifs} onToggle={() => setEmailNotifs(!emailNotifs)} label="Email notifications" />
        <Toggle on={pushNotifs} onToggle={() => setPushNotifs(!pushNotifs)} label="Push notifications" />
        <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 4, marginTop: 10, color: "#6B5A2E" }}>Trading</div>
        <Toggle on={tradeConfirm} onToggle={() => setTradeConfirm(!tradeConfirm)} label="Trade confirmations" />
        <Toggle on={priceAlerts} onToggle={() => setPriceAlerts(!priceAlerts)} label="Price & macro alerts" />
        <div style={{ marginTop: 16, padding: "14px 18px", background: "#E3F2FD", borderRadius: 14, fontSize: 17, color: "#42A5F5", fontWeight: 700 }}>
          Manage specific basket alerts from each Hatch's detail page.
        </div>
      </div>
    </div>
  );

  if (acctSection === "privacy") return (
    <div>
      <BackHeader title="Privacy" icon="shield" />
      <div style={{ background: "#fff", borderRadius: 14, padding: 14 }}>
        <Toggle on={dataSharing} onToggle={() => setDataSharing(!dataSharing)} label="Share anonymized data for product improvement" />
        <Toggle on={analytics} onToggle={() => setAnalytics(!analytics)} label="Usage analytics" />
        <div style={{ padding: "14px 0", borderBottom: "1px solid #33333420", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontSize: 15, fontWeight: 700 }}>Download my data</div><div style={{ fontSize: 17, color: "#33333480" }}>Export all your account and trading data</div></div>
          <button style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #33333440", background: "#fff", fontSize: 17, fontWeight: 800, cursor: "pointer", color: "#42A5F5" }}>Request</button>
        </div>
        <div style={{ padding: "14px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontSize: 15, fontWeight: 700, color: "#EF5350" }}>Delete my account</div><div style={{ fontSize: 17, color: "#33333480" }}>Permanently remove all data. This cannot be undone.</div></div>
          <button style={{ padding: "8px 16px", borderRadius: 10, border: "1.5px solid #EF5350", background: "#FFEBEE", fontSize: 17, fontWeight: 800, cursor: "pointer", color: "#EF5350" }}>Delete</button>
        </div>
      </div>
    </div>
  );

  if (acctSection === "policies") return (
    <div>
      <BackHeader title="Legal & Policies" icon="document" />
      <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden" }}>
        {[
          { title: "Terms of Service", ver: "v3.2 — Updated Jan 2026", icon: "scroll" },
          { title: "Privacy Policy", ver: "v2.8 — Updated Dec 2025", icon: "lock" },
          { title: "Trading Disclaimer", ver: "v1.4 — Updated Nov 2025", icon: "balance" },
          { title: "Brokerage Data Agreement", ver: "v2.1 — Updated Jan 2026", icon: "handshake" },
          { title: "Cookie Policy", ver: "v1.1 — Updated Sep 2025", icon: "cookie" },
          { title: "Acceptable Use Policy", ver: "v1.0 — Updated Aug 2025", icon: "check-circle" },
        ].map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderBottom: "1px solid #33333420", cursor: "pointer", transition: "background .15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#fff"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <Icon name={p.icon} size={11} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{p.title}</div>
              <div style={{ fontSize: 15, color: "#33333480" }}>{p.ver}</div>
            </div>
            <span style={{ color: "#42A5F5", fontSize: 17, fontWeight: 700 }}>View →</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, padding: "14px 18px", background: "#fff", borderRadius: 14, border: "1px solid #F0E6D0", fontSize: 17, color: "#33333480" }}>
        BasketTrade is not a registered broker-dealer. We do not hold customer funds. All trades are executed through your linked third-party brokerage accounts. Investing involves risk including possible loss of principal.
      </div>
    </div>
  );

  // ── MAIN ACCOUNT MENU ──
  const connectedBrokers = brokerageProviders.filter(b => b.status === "connected");
  return (
    <div>
      <div style={{ marginBottom: 10, animation: "fadeUp .3s ease both" }}>
        {/* Profile header */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "14px 24px", display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#C48830,#EF5350)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff", fontWeight: 900, fontFamily: "'Instrument Serif', serif", flexShrink: 0 }}>{(user?.displayName || user?.email || "U").charAt(0).toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>{user?.displayName || "Trader"}</div>
            <div style={{ fontSize: 18, color: "#33333480" }}>{user?.email || ""}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 800, padding: "3px 10px", borderRadius: 8, background: "#FFF8EE", color: "#C48830" }}>Pro Member</span>
              <span style={{ fontSize: 15, fontWeight: 800, padding: "3px 10px", borderRadius: 8, background: "#FFF8EE", color: "#C48830" }}>{connectedBrokers.length} Broker{connectedBrokers.length !== 1 ? "s" : ""} Linked</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 800 }}>${(connectedBrokers.reduce((s, b) => s + b.accts.reduce((a, ac) => a + ac.balance, 0), 0) / 1000).toFixed(1)}k</div>
            <div style={{ fontSize: 15, color: "#33333480", fontWeight: 700 }}>Aggregate Balance</div>
          </div>
        </div>
      </div>

      {/* ── Menu Sections ── */}
      <div style={{ display: "grid", gap: 6 }}>
        {/* Account */}
        <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", animation: "fadeUp .4s ease .05s both" }}>
          <div style={{ padding: "8px 12px", borderBottom: "2px solid #F0E6D0", background: "#fff" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#33333480", textTransform: "uppercase", letterSpacing: 1 }}>Account</div>
          </div>
          <MenuItem icon="person" label="Profile" desc="Name, email, phone, personal info" onClick={() => setAcctSection("profile")} />
          <MenuItem icon="bank" label="Linked Brokerages" desc="Manage your connected brokerage accounts" badge={connectedBrokers.length + " connected"} badgeColor="#C48830" onClick={() => setAcctSection("brokerages")} />
          <MenuItem icon="clipboard" label="Trade History" desc="View all executed trades and performance" badge="142 trades" badgeColor="#42A5F5" onClick={() => setAcctSection("trades")} />
        </div>

        {/* Security & Privacy */}
        <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", animation: "fadeUp .4s ease .1s both" }}>
          <div style={{ padding: "8px 12px", borderBottom: "2px solid #F0E6D0", background: "#fff" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#33333480", textTransform: "uppercase", letterSpacing: 1 }}>Security & Privacy</div>
          </div>
          <MenuItem icon="lock" label="Login & Security" desc="Password, 2FA, active sessions" badge="2FA On" badgeColor="#C48830" onClick={() => setAcctSection("security")} />
          <MenuItem icon="shield" label="Privacy" desc="Data sharing, analytics, account deletion" onClick={() => setAcctSection("privacy")} />
          <MenuItem icon="bell" label="Notifications" desc="Email, push, trade confirmations, alerts" onClick={() => setAcctSection("notifications")} />
        </div>

        {/* Legal */}
        <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", animation: "fadeUp .4s ease .15s both" }}>
          <div style={{ padding: "8px 12px", borderBottom: "2px solid #F0E6D0", background: "#fff" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#33333480", textTransform: "uppercase", letterSpacing: 1 }}>Legal & Support</div>
          </div>
          <MenuItem icon="document" label="Legal & Policies" desc="Terms, privacy policy, disclaimers" onClick={() => setAcctSection("policies")} />
          <MenuItem icon="chat" label="Support" desc="Help center, contact us, report an issue" badge="24/7" badgeColor="#FFA726" onClick={() => {}} />
          <MenuItem icon="star" label="Rate BasketTrade" desc="Love the app? Leave us a review" onClick={() => {}} />
        </div>

        {/* Danger zone */}
        <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", animation: "fadeUp .4s ease .2s both" }}>
          <MenuItem icon="door" label="Sign Out" danger onClick={onSignOut} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "12px 0 8px", animation: "fadeUp .4s ease .25s both" }}>
        <div style={{ fontSize: 15, color: "#E8DCC8", fontWeight: 700 }}>BasketTrade v2.4.0 · © 2026 BasketTrade Inc.</div>
        <div style={{ fontSize: 14, color: "#E8DCC8", marginTop: 2 }}>Not a broker-dealer. All trades executed via linked accounts.</div>
      </div>
    </div>
  );
}

// ═══════════════ CHECKOUT ═══════════════

// ═══════════════ HEDGE GUIDES PAGE ═══════════════
function HedgeGuidesPage() {
  const [seesawPair, setSeesawPair] = useState({ a: "sp500", b: "vix" });
  const [openGuide, setOpenGuide] = useState(null);

  const guides = [
    { id: 1, title: "Hedging 101: Protect Your Portfolio in Volatile Markets", tag: "Beginner", icon: "shield", color: "#5B8C5A", summary: "Learn how to use options overlays, inverse ETFs, and position sizing to shield your portfolio from sudden drawdowns.", time: "5 min read", featured: true,
      sections: [
        { heading: "What Is Hedging?", body: "Hedging is the practice of taking an offsetting position to reduce the risk of adverse price movements in your portfolio. Think of it as insurance — you pay a small premium to protect against large losses. The goal isn't to eliminate risk entirely, but to manage it intelligently so drawdowns don't derail your long-term returns." },
        { heading: "Protective Put Options", body: "The most straightforward hedge is buying put options on positions you own. A put gives you the right to sell at a set strike price, capping your downside. For example, if you hold $50,000 in SPY at $540, buying a 3-month $510 put (~5.5% out-of-the-money) might cost ~$800-1,200. That's 1.6-2.4% of position value to cap your loss at roughly 5.5% plus the premium paid. Roll quarterly for ongoing protection." },
        { heading: "Put Spread Collars", body: "To reduce the cost of puts, sell an upside call to fund the downside protection. A typical collar: own SPY at $540, buy a $510 put, sell a $570 call. The call premium offsets 50-80% of the put cost, but caps your upside at ~5.5%. This is ideal when you want protection but expect range-bound markets. Institutional portfolios commonly run 5-10% collar overlays." },
        { heading: "Inverse ETFs for Tactical Hedging", body: "Inverse ETFs like SH (-1x S&P 500), SDS (-2x), or SQQQ (-3x Nasdaq) deliver the opposite daily return of their index. Allocating 10-20% of your portfolio to a -1x inverse ETF can offset 10-20% of a market decline. Important: these reset daily, so in volatile sideways markets, compounding drag erodes returns. Use them for short-term tactical hedges measured in days to weeks, not months." },
        { heading: "Position Sizing as a Hedge", body: "The simplest hedge is often the best: reduce position size. If your conviction drops from high to moderate, cutting a 10% position to 5% halves your risk without any premium cost. The Kelly Criterion suggests optimal bet sizing based on your edge and odds. Most professional traders rarely exceed 2-5% of capital in a single name. When volatility spikes, systematic reduction to half-Kelly sizing dramatically reduces drawdown risk." },
        { heading: "The 2% Rule & Stop Losses", body: "Never risk more than 2% of your total portfolio on a single trade. If you have a $100,000 portfolio, your maximum acceptable loss per position is $2,000. Set stop losses accordingly: on a $10,000 position, that means a 20% stop. Trailing stops of 15-25% capture most upside while limiting drawdowns. Combine with position sizing for a robust risk framework." },
      ]
    },
    { id: 2, title: "Building a Macro-Resilient Portfolio", tag: "Strategy", icon: "basket", color: "#C48830", summary: "How to combine inflation hedges, geopolitical shields, and growth baskets to weather any macro regime.", time: "8 min read", featured: true,
      sections: [
        { heading: "The All-Weather Framework", body: "Ray Dalio's All-Weather portfolio concept allocates assets based on economic environments rather than predictions. The four quadrants: rising growth (equities, commodities, corporate credit), falling growth (nominal bonds, TIPS), rising inflation (commodities, TIPS, EM), falling inflation (equities, nominal bonds). A truly resilient portfolio holds assets that perform in each quadrant, with allocations weighted by risk contribution rather than dollar amount." },
        { heading: "Gold: The 4-15% Allocation Sweet Spot", body: "Research across multiple decades shows gold allocations between 4% and 15% consistently improve risk-adjusted returns across portfolio types. Gold has a near-zero correlation with equities (0.02) and bonds (0.04), meaning it moves independently from both. During the 1970s inflation, gold surged from $35 to over $600. In the 2008 crisis, gold rose 5% while equities fell 37%. A 7-10% gold allocation provides meaningful portfolio insurance without excessive opportunity cost." },
        { heading: "TIPS & Real Assets for Inflation", body: "Treasury Inflation-Protected Securities (TIPS) adjust their principal with CPI, providing direct inflation protection. Broad commodities have risen more than one-for-one with inflation in every inflationary episode on record. A combined allocation of 10-15% TIPS and 5-10% broad commodities (via DJP, GSG, or PDBC) creates a robust inflation shield. Real estate (REITs at 5-10%) adds another inflation-sensitive layer with income." },
        { heading: "Geopolitical Risk Hedging", body: "Defense stocks (LMT, RTX, GD), energy producers (XOM, CVX), and gold miners (GDX) historically outperform during geopolitical crises. A dedicated 5-8% \"geopolitical basket\" can offset losses in growth assets during conflict escalation. The DXY (US Dollar Index) also tends to strengthen during global uncertainty as capital flows to safe havens. Pairing long-dollar positions with gold provides a double hedge against geopolitical tail risks." },
        { heading: "Regime-Based Rebalancing", body: "Rather than static allocations, shift weights based on the macro regime. In rate-hiking cycles: overweight short-duration bonds, value stocks, and commodities. In easing cycles: overweight growth equities, long-duration bonds, and emerging markets. During stagflation: overweight gold, energy, TIPS, and reduce equity exposure to 30-40%. Use leading indicators like the yield curve slope, PMI readings, and credit spreads to identify regime transitions 2-3 months early." },
      ]
    },
    { id: 3, title: "Tail Risk Hedging: When Black Swans Strike", tag: "Advanced", icon: "swan", color: "#7E57C2", summary: "Deep dive into VIX calls, put spreads, and dynamic hedging strategies for extreme market events.", time: "12 min read",
      sections: [
        { heading: "Understanding Tail Risk", body: "Tail risk refers to the probability of rare, extreme events at the tails of the return distribution. Markets experience 3+ standard deviation moves far more often than normal distribution models predict. Since 1928, the S&P 500 has had 20+ single-day drops exceeding 7%. The 2020 COVID crash saw a 34% decline in 23 trading days. These events destroy wealth concentrated in unhedged portfolios and create the largest divergence between hedged and unhedged outcomes." },
        { heading: "The Universa Model: 0.5-2% Allocation", body: "Nassim Taleb and Mark Spitznagel's Universa fund popularized the \"barbell\" approach: allocate 96-99% to safe assets or the market, and just 0.5-2% to deep out-of-the-money put options. These convex payoffs are designed to lose small amounts consistently but produce massive asymmetric gains during crashes. During March 2020, Universa's Black Swan Protection Protocol returned 3,612% while the S&P 500 fell 34%. The key insight: you don't need the hedge to work often — it just needs to work massively when it does." },
        { heading: "VIX Call Options Strategy", body: "The VIX (CBOE Volatility Index) typically spikes 3-5x during major market selloffs due to its strong negative correlation with equities. Buying VIX calls 30-60 days to expiration, struck 50-100% above the current VIX level, provides leveraged crash protection. Example: with VIX at 14, buy $25 strike calls for ~$0.40-0.80. If a crisis pushes VIX to 45+, those calls are worth $20+, a 25-50x return. Allocate 0.3-0.5% of portfolio quarterly to maintain this rolling hedge." },
        { heading: "Put Spread Structures", body: "To reduce the cost of outright puts, use put spreads: buy a put ~20% below the current market level and sell a put ~40% below. On a $540 SPY, buy the $430 put and sell the $325 put. The sold put funds ~40-60% of the bought put's cost, and you're fully protected for a 20-40% crash — the zone where most tail events occur. Cost: approximately 0.3-0.6% of portfolio value per quarter. This systematic approach keeps protection affordable across all market environments." },
        { heading: "Dynamic Hedging with Signals", body: "Rather than maintaining constant protection (which bleeds premium), increase hedge allocation when warning signs appear: VIX term structure inversion (backwardation), credit spreads widening above 400bps, yield curve inversion persisting 12+ months, or PMI readings below 47. When 2+ signals trigger simultaneously, increase tail hedge allocation from the baseline 0.5% to 2-3%. Historical backtesting shows this signal-based approach captures 80% of crash protection at 40% of the cost of constant hedging." },
        { heading: "Portfolio Insurance in Practice", body: "A practical tail risk program: maintain 0.5% in rolling 3-month 20% OTM SPX put spreads as baseline. Add 0.5% in VIX calls when VIX is below 15 (cheap insurance). Scale to 2% total when macro warning signals cluster. Total annual cost: 1-3% in calm years, but protects 15-25% of portfolio value during tail events. The math is clear — sacrificing 1-3% per year to avoid a potential 30-50% drawdown is one of the most asymmetric trades available." },
      ]
    },
    { id: 4, title: "Rate Cycle Playbook: Positioning for Fed Pivots", tag: "Strategy", icon: "chart-down", color: "#42A5F5", summary: "Historical patterns show which asset classes outperform before, during, and after rate cut cycles.", time: "7 min read",
      sections: [
        { heading: "The Rate Cycle Framework", body: "Fed rate cycles are the single most powerful driver of cross-asset returns. Since 1954, there have been 12 distinct easing cycles. Equities moved higher during easing cycles two-thirds of the time (67%), adding an average of 30.3% over the full cycle. However, the context matters enormously: cuts during recessions produce very different outcomes than cuts during soft landings. Understanding where you are in the cycle is more important than the direction of the next move." },
        { heading: "Before the First Cut: Volatility Spike", body: "Stock volatility runs above average in the 3 months before the first rate cut, reaching 22.5% in the month prior versus an average of ~15%. This is because the Fed typically cuts only after economic data has deteriorated — in 10 out of 12 cycles, the Fed initiated cuts only after equity markets had already peaked. The playbook: reduce gross exposure 3-6 months before an expected pivot. Increase cash to 15-20%. Build your shopping list of high-quality assets to buy once the cutting begins." },
        { heading: "During the Cutting Cycle", body: "Without a recession: both stocks and bonds rally together. The 60/40 portfolio shines. Technology and consumer discretionary lead as lower rates boost growth stock valuations. With a recession: bonds rally but equities initially fall before recovering. Quality and value stocks outperform high-beta growth. In both scenarios, US Treasuries at the front end of the curve perform well. Emerging market hard-currency debt has shown outsized performance during Fed easing, as dollar weakness and lower US rates drive capital flows to higher-yielding markets." },
        { heading: "Asset Class Winners & Losers", body: "Historical winners during easing: long-duration bonds (TLT averages +15-20%), gold (+12% average), growth equities (QQQ), REITs, and EM bonds. Losers: the US dollar (DXY typically falls 5-10%), short-duration cash instruments (falling yields), and bank stocks (if yield curve flattens). Cyclically sensitive tech and consumer discretionary tend to benefit most. Financials can gain if the yield curve steepens — improving net interest margins — but lose if it flattens. High-beta names are the most variable, appearing among both the best and worst performers." },
        { heading: "The Current Setup", body: "Credit spreads, PMI data, and yield curve dynamics all inform whether the next easing cycle will be benign or recessionary. Position accordingly: if spreads are tight and PMI is above 50, lean into equities and real assets through the cut cycle. If spreads are widening and PMI is rolling over, favor bonds and defensive sectors. The key is to be positioned before the first cut — historical data shows 60-70% of the move in rate-sensitive assets occurs in the 3 months before and after the first cut." },
      ]
    },
    { id: 5, title: "Gold vs Crypto: The Inflation Hedge Debate", tag: "Analysis", icon: "balance", color: "#FFA726", summary: "Comparing safe havens and their performance across inflationary periods and market crises.", time: "6 min read",
      sections: [
        { heading: "The Case for Gold", body: "Gold has been a store of value for over 5,000 years. During the 1970s when US inflation averaged 6.8%, gold surged from $35/oz in 1971 to over $600/oz by 1980 — a 1,600% gain. In the 2008 financial crisis, gold rose 5.5% while the S&P 500 fell 37%. Gold has a near-zero correlation with equities (0.02) and bonds (0.04), making it a true portfolio diversifier. Central banks globally added 1,037 tonnes in 2023 alone — the second-highest annual total on record — signaling institutional confidence in gold's role." },
        { heading: "The Case for Bitcoin", body: "Bitcoin's fixed supply cap of 21 million coins creates absolute mathematical scarcity — unlike gold, which grows 1-1.5% annually from mining. After the 2024 halving, Bitcoin's inflation rate dropped below gold's for the first time. Bitcoin delivered 150%+ returns in 2023 and has outperformed every major asset class over any 4+ year holding period since inception. It offers 24/7 global liquidity, near-instant settlement, and zero storage costs. Proponents call it \"digital gold\" with superior portability and divisibility." },
        { heading: "Inflation Hedging: The Evidence", body: "The data is nuanced. Gold has proven inflation-hedging properties across multiple decades and regimes. During high-inflation periods, gold consistently preserves purchasing power. Bitcoin's inflation-hedging properties are more mixed — it appreciates against short-term inflation expectations, but the relationship weakens when expectations exceed 2%. Academic research shows Bitcoin's inflation sensitivity is only significant for short-term expectations, making it a speculative rather than reliable inflation hedge at this stage of its maturity." },
        { heading: "Crisis Performance: The Critical Difference", body: "This is where gold and Bitcoin diverge most sharply. During equity market corrections, gold acts as a safe haven — capital flows into gold as stocks sell off. Bitcoin remains a risk-on asset that tends to correlate with equities during stress. In March 2020, Bitcoin fell 50% alongside stocks before recovering. In every major risk-off event since Bitcoin's creation, it has initially moved with equities, not against them. For pure portfolio insurance during crises, gold is the proven instrument; Bitcoin is a high-conviction asymmetric bet, not a hedge." },
        { heading: "The Optimal Allocation", body: "Rather than choosing one over the other, evidence suggests a combined approach: 5-10% gold for reliable crisis hedging and inflation protection, plus 1-5% Bitcoin for asymmetric upside and long-term scarcity exposure. Gold provides the defensive floor; Bitcoin provides convex upside. Keep gold as a strategic, always-on allocation. Treat Bitcoin as a tactical position sized by your risk tolerance — and never confuse its speculative return profile with gold's proven hedging function." },
      ]
    },
    { id: 6, title: "Sector Rotation: Following the Smart Money", tag: "Strategy", icon: "rotate", color: "#E57373", summary: "How institutional fund flows signal the next winning sectors and where capital is moving now.", time: "10 min read",
      sections: [
        { heading: "What Is Sector Rotation?", body: "Sector rotation is the strategy of shifting portfolio weight between market sectors based on where we are in the economic cycle. Large institutional investors — pension funds, sovereign wealth funds, and endowments — systematically rotate capital as macro conditions change. By tracking these fund flows, individual investors can identify which sectors are gaining institutional sponsorship and position ahead of the crowd. The economic cycle has four phases: early recovery, expansion, late cycle, and recession — each favoring different sectors." },
        { heading: "The Economic Cycle Playbook", body: "Early Recovery (PMI rising from below 50): Technology, Consumer Discretionary, and Industrials lead. Expansion (PMI 50-57, strong growth): Energy, Materials, and Financials outperform. Late Cycle (PMI rolling over from peak): Healthcare, Consumer Staples, and Utilities gain defensive flows. Recession (PMI below 47, contraction): Treasuries, Gold, and Utilities are safe havens. The transition between phases — not the phase itself — is where the largest alpha is generated. Rotate 2-3 months before consensus recognizes the shift." },
        { heading: "Reading Institutional Fund Flows", body: "Track these signals to see where smart money is moving: 13F filings (quarterly institutional holdings with 45-day lag), ETF fund flows (real-time sector demand), options market positioning (put/call ratios by sector), and relative strength rankings (sectors breaking out vs. breaking down). When 3+ large institutions increase exposure to the same sector within a quarter, it signals institutional accumulation. The most actionable signal: sudden ETF inflow acceleration in a previously out-of-favor sector." },
        { heading: "Current Smart Money Moves", body: "Capital is rotating from concentrated growth tech into Healthcare and Communication Services. Healthcare offers defensive stability plus growth from pharmaceutical innovation — GLP-1 drugs alone represent a $100B+ revenue opportunity. Communication Services provides reasonable valuations with digital advertising resilience. Energy maintains structural demand from geopolitical supply constraints. Defense sector spending pledges are hitting record levels globally. The common thread: sectors with earnings resilience and pricing power in a late-cycle environment." },
        { heading: "Implementing Sector Rotation", body: "Use sector ETFs for clean exposure: XLK (Tech), XLV (Healthcare), XLC (Comms), XLE (Energy), XLF (Financials), XLI (Industrials). Maintain a core 60% allocation to broad market exposure (SPY/VTI), then allocate 30% across your top 3 favored sectors and 10% to hedges. Rebalance monthly using relative strength and fund flow data. Avoid holding more than 5 sector overweights simultaneously — concentration kills the diversification benefit. Set sector rotation stops at -8% relative underperformance versus the benchmark." },
      ]
    },
  ];

  const activeGuide = guides.find(g => g.id === openGuide);

  // Seesaw logic
  const seesawA = macroProducts.find(p => p.id === seesawPair.a);
  const seesawB = macroProducts.find(p => p.id === seesawPair.b);
  const seesawCorr = macroCorrelations.find(c => (c.a === seesawPair.a && c.b === seesawPair.b) || (c.a === seesawPair.b && c.b === seesawPair.a));
  const corrVal = seesawCorr ? seesawCorr.corr : 0;
  const returnA = seesawA ? seesawA.ytd : 0;
  const returnB = seesawB ? seesawB.ytd : 0;
  const tiltDeg = Math.max(-22, Math.min(22, (returnA - returnB) * 0.5));

  // Top hedges (strongest inverse)
  const topHedges = [...macroCorrelations].filter(c => c.corr < -0.3).sort((a, b) => a.corr - b.corr).slice(0, 8);

  // ── Guide Detail View ──
  if (activeGuide) return (
    <div style={{ animation: "fadeUp .3s ease both" }}>
      <button onClick={() => setOpenGuide(null)} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "#C48830", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "Quicksand", marginBottom: 8, padding: 0 }}>
        <span style={{ fontSize: 21 }}>&larr;</span> Back to Hedge
      </button>
      <div style={{ background: `linear-gradient(135deg, ${activeGuide.color}12, ${activeGuide.color}04)`, border: `1.5px solid ${activeGuide.color}30`, borderRadius: 16, padding: "14px 16px", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: activeGuide.color + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name={activeGuide.icon} size={18} color={activeGuide.color} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: activeGuide.color, background: activeGuide.color + "18", padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" }}>{activeGuide.tag}</span>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: "#333334", lineHeight: 1.3, marginTop: 3 }}>{activeGuide.title}</div>
          </div>
        </div>
        <div style={{ fontSize: 14, color: "#8A7040", lineHeight: 1.5 }}>{activeGuide.summary}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 8, fontSize: 12, color: "#33333480", fontWeight: 700 }}>
          <span>{activeGuide.time}</span>
          <span>·</span>
          <span>{activeGuide.sections.length} sections</span>
        </div>
      </div>
      {activeGuide.sections.map((s, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", marginBottom: 6, animation: `fadeUp .4s ease ${i * 0.05}s both` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <div style={{ width: 18, height: 18, borderRadius: 6, background: activeGuide.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: activeGuide.color, fontFamily: "JetBrains Mono" }}>{i + 1}</div>
            <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: "#333334" }}>{s.heading}</div>
          </div>
          <div style={{ fontSize: 14, color: "#4A4030", lineHeight: 1.7, fontFamily: "Quicksand", fontWeight: 500 }}>{s.body}</div>
        </div>
      ))}
      <button onClick={() => setOpenGuide(null)} style={{ width: "100%", padding: "10px", borderRadius: 12, border: "1.5px solid #C48830", background: "#FFF8EE", color: "#C48830", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "Quicksand", marginTop: 4 }}>
        &larr; Back to Hedge
      </button>
    </div>
  );

  return (
    <div>
      {/* ═══ HATCH GUIDES & HEDGING (now on top) ═══ */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8, animation: "fadeUp .4s ease both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>Hatch Guides & Hedging</div>
          <span style={{ fontSize: 12, color: "#33333480" }}>{guides.length} articles</span>
        </div>
        {/* Featured cards */}
        <div className="no-scrollbar" style={{ display: "flex", gap: 6, marginBottom: 8, overflowX: "auto" }}>
          {guides.filter(g => g.featured).map(g => (
            <div key={g.id} onClick={() => setOpenGuide(g.id)} style={{ minWidth: 200, flex: "0 0 auto", background: `linear-gradient(135deg, ${g.color}10, ${g.color}05)`, border: `1.5px solid ${g.color}22`, borderRadius: 14, padding: 12, cursor: "pointer", transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = g.color + "55"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = g.color + "22"; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <Icon name={g.icon} size={20} />
                <span style={{ fontSize: 11, fontWeight: 800, color: g.color, background: g.color + "14", padding: "2px 6px", borderRadius: 4, textTransform: "uppercase" }}>{g.tag}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: "#333334", lineHeight: 1.3, marginBottom: 4 }}>{g.title}</div>
              <div style={{ fontSize: 12, color: "#8A7040", lineHeight: 1.4 }}>{g.summary.slice(0, 80)}...</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                <span style={{ fontSize: 11, color: "#33333480", fontWeight: 600 }}>{g.time}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: g.color }}>Read &rarr;</span>
              </div>
            </div>
          ))}
        </div>
        {/* Article list */}
        {guides.filter(g => !g.featured).map(g => (
          <div key={g.id} onClick={() => setOpenGuide(g.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderTop: "1px solid #33333420", cursor: "pointer", transition: "all .15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#FFFDF5"} onMouseLeave={e => e.currentTarget.style.background = ""}>
            <Icon name={g.icon} size={18} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: "#333334", lineHeight: 1.3 }}>{g.title}</div>
              <div style={{ display: "flex", gap: 4, marginTop: 2, alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: g.color, background: g.color + "14", padding: "1px 5px", borderRadius: 3 }}>{g.tag}</span>
                <span style={{ fontSize: 11, color: "#33333480" }}>{g.time}</span>
                <span style={{ fontSize: 11, color: "#33333480" }}>·</span>
                <span style={{ fontSize: 11, color: "#33333480" }}>{g.sections.length} sections</span>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, color: g.color }}>Read &rarr;</span>
          </div>
        ))}
      </div>

      {/* ═══ HEDGING SEESAW ═══ */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "10px 22px 18px", marginBottom: 8, animation: "fadeUp .4s ease .06s both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>Hedging Seesaw</div>
            <div style={{ fontSize: 17, color: "#33333480", marginTop: 2 }}>When one side weighs down, the other lifts up — pick any pair to visualize</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 800, padding: "4px 10px", borderRadius: 8, background: corrVal < -0.5 ? "#FFF8EE" : corrVal < 0 ? "#FFF3E0" : "#FFEBEE", color: corrVal < -0.5 ? "#C48830" : corrVal < 0 ? "#FFA726" : "#EF5350" }}>
              ρ = {corrVal.toFixed(2)} · {corrVal < -0.6 ? "Strong Hedge" : corrVal < -0.3 ? "Moderate Hedge" : corrVal < 0 ? "Weak Hedge" : corrVal < 0.3 ? "Weak +" : "Correlated"}
            </span>
          </div>
        </div>

        {/* Pair selectors */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8, alignItems: "center", justifyContent: "center" }}>
          <div style={{ flex: "1 1 200px", maxWidth: 260 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#33333480", textTransform: "uppercase", marginBottom: 4, textAlign: "center" }}>LEFT SIDE</div>
            <select value={seesawPair.a} onChange={e => setSeesawPair(p => ({ ...p, a: e.target.value }))}
              style={{ width: "100%", padding: "7px 10px", borderRadius: 12, border: "1.5px solid #42A5F544", fontSize: 15, fontWeight: 700, fontFamily: "Quicksand", outline: "none", background: "#E3F2FD", color: "#333334", cursor: "pointer" }}>
              {macroProducts.map(p => <option key={p.id} value={p.id}>{p.ticker} — {p.name}</option>)}
            </select>
          </div>
          <div style={{ fontSize: 18, color: "#33333480", fontWeight: 900 }}>⟺</div>
          <div style={{ flex: "1 1 200px", maxWidth: 260 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#33333480", textTransform: "uppercase", marginBottom: 4, textAlign: "center" }}>RIGHT SIDE</div>
            <select value={seesawPair.b} onChange={e => setSeesawPair(p => ({ ...p, b: e.target.value }))}
              style={{ width: "100%", padding: "7px 10px", borderRadius: 12, border: "1.5px solid #EF535044", fontSize: 15, fontWeight: 700, fontFamily: "Quicksand", outline: "none", background: "#FFEBEE", color: "#333334", cursor: "pointer" }}>
              {macroProducts.map(p => <option key={p.id} value={p.id}>{p.ticker} — {p.name}</option>)}
            </select>
          </div>
        </div>

        {/* Quick pair presets */}
        <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap", marginBottom: 8 }}>
          {[
            { a:"sp500", b:"vix", label:"S&P vs VIX" },
            { a:"dxy", b:"gold", label:"Dollar vs Gold" },
            { a:"nasdaq", b:"ust30y", label:"Tech vs Bonds" },
            { a:"sp500", b:"ust10y", label:"Stocks vs 10Y" },
            { a:"dxy", b:"eurusd", label:"DXY vs EUR" },
            { a:"crude", b:"natgas", label:"Oil vs NatGas" },
            { a:"gold", b:"btc", label:"Gold vs BTC" },
            { a:"tlt", b:"sp500", label:"TLT vs SPX" },
          ].map((preset, i) => (
            <button key={i} onClick={() => setSeesawPair({ a: preset.a, b: preset.b })}
              style={{ padding: "4px 10px", borderRadius: 8, border: "1.5px solid " + (seesawPair.a === preset.a && seesawPair.b === preset.b ? "#C48830" : "#F0E6D0"), background: seesawPair.a === preset.a && seesawPair.b === preset.b ? "#FFF8EE" : "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", color: seesawPair.a === preset.a && seesawPair.b === preset.b ? "#C48830" : "#8A7040" }}>{preset.label}</button>
          ))}
        </div>

        {/* THE SEESAW VISUALIZATION */}
        {seesawA && seesawB && (
          <svg viewBox="0 0 700 310" style={{ width: "100%", height: 240, display: "block" }}>
            <defs>
              <linearGradient id="seesawBarHedge" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={seesawA.color} /><stop offset="100%" stopColor={seesawB.color} />
              </linearGradient>
              <filter id="dropShHedge"><feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.12" /></filter>
            </defs>

            {/* Center pivot triangle */}
            <polygon points="350,230 336,260 364,260" fill="#C48830" opacity="0.8" />
            <rect x="300" y="260" width="100" height="8" rx="4" fill="#F0E6D0" />

            {/* Seesaw beam */}
            <g transform={`rotate(${tiltDeg}, 350, 220)`}>
              <rect x="60" y="216" width="580" height="8" rx="4" fill="url(#seesawBarHedge)" filter="url(#dropShHedge)" />

              {/* Left Platform (Product A) */}
              <g>
                <rect x="40" y="185" width="160" height="32" rx="12" fill="#fff" stroke={seesawA.color} strokeWidth="2" filter="url(#dropShHedge)" />
                <text x="120" y="197" textAnchor="middle" fill={seesawA.color} fontSize="10" fontWeight="800" fontFamily="JetBrains Mono">{seesawA.ticker}</text>
                <text x="120" y="210" textAnchor="middle" fill="#A09080" fontSize="8" fontFamily="Poppins" fontWeight="700">{seesawA.name.length > 20 ? seesawA.name.slice(0,18) + ".." : seesawA.name}</text>

                {/* Weight block */}
                <rect x="80" y={140 - Math.abs(returnA) * 1.2} width="80" height={Math.max(20, Math.abs(returnA) * 1.8)} rx="8" fill={returnA >= 0 ? "#5B8C5A" : "#EF5350"} opacity="0.85" />
                <text x="120" y={148 - Math.abs(returnA) * 1.2 + Math.max(20, Math.abs(returnA) * 1.8) / 2} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="14" fontWeight="900" fontFamily="JetBrains Mono">{returnA >= 0 ? "+" : ""}{returnA}%</text>
                <text x="120" y={134 - Math.abs(returnA) * 1.2} textAnchor="middle" fill={seesawA.color} fontSize="8" fontWeight="800">YTD RETURN</text>

                {/* Price */}
                <text x="120" y="240" textAnchor="middle" fill="#6B5A2E" fontSize="12" fontWeight="700" fontFamily="JetBrains Mono">${seesawA.price >= 1000 ? (seesawA.price).toLocaleString() : seesawA.price}</text>
                <text x="120" y="254" textAnchor="middle" fill={seesawA.change >= 0 ? "#5B8C5A" : "#EF5350"} fontSize="10" fontWeight="800" fontFamily="JetBrains Mono">{seesawA.change >= 0 ? "▲ +" : "▼ "}{seesawA.change}% today</text>
              </g>

              {/* Right Platform (Product B) */}
              <g>
                <rect x="500" y="185" width="160" height="32" rx="12" fill="#fff" stroke={seesawB.color} strokeWidth="2" filter="url(#dropShHedge)" />
                <text x="580" y="197" textAnchor="middle" fill={seesawB.color} fontSize="10" fontWeight="800" fontFamily="JetBrains Mono">{seesawB.ticker}</text>
                <text x="580" y="210" textAnchor="middle" fill="#A09080" fontSize="8" fontFamily="Poppins" fontWeight="700">{seesawB.name.length > 20 ? seesawB.name.slice(0,18) + ".." : seesawB.name}</text>

                {/* Weight block */}
                <rect x="540" y={140 - Math.abs(returnB) * 1.2} width="80" height={Math.max(20, Math.abs(returnB) * 1.8)} rx="8" fill={returnB >= 0 ? "#5B8C5A" : "#EF5350"} opacity="0.85" />
                <text x="580" y={148 - Math.abs(returnB) * 1.2 + Math.max(20, Math.abs(returnB) * 1.8) / 2} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="14" fontWeight="900" fontFamily="JetBrains Mono">{returnB >= 0 ? "+" : ""}{returnB}%</text>
                <text x="580" y={134 - Math.abs(returnB) * 1.2} textAnchor="middle" fill={seesawB.color} fontSize="8" fontWeight="800">YTD RETURN</text>

                {/* Price */}
                <text x="580" y="240" textAnchor="middle" fill="#6B5A2E" fontSize="12" fontWeight="700" fontFamily="JetBrains Mono">${seesawB.price >= 1000 ? (seesawB.price).toLocaleString() : seesawB.price}</text>
                <text x="580" y="254" textAnchor="middle" fill={seesawB.change >= 0 ? "#5B8C5A" : "#EF5350"} fontSize="10" fontWeight="800" fontFamily="JetBrains Mono">{seesawB.change >= 0 ? "▲ +" : "▼ "}{seesawB.change}% today</text>
              </g>

              {/* Correlation indicator at center */}
              <circle cx="350" cy="208" r="18" fill="#fff" stroke={corrVal < 0 ? "#EF5350" : "#C48830"} strokeWidth="2.5" />
              <text x="350" y="206" textAnchor="middle" fill={corrVal < 0 ? "#EF5350" : "#C48830"} fontSize="9" fontWeight="900" fontFamily="JetBrains Mono">{corrVal >= 0 ? "+" : ""}{corrVal.toFixed(2)}</text>
              <text x="350" y="216" textAnchor="middle" fill="#A09080" fontSize="6" fontWeight="700">CORR</text>
            </g>

            {/* Description below */}
            {seesawCorr && <text x="350" y="290" textAnchor="middle" fill="#8A7040" fontSize="10" fontWeight="600" fontFamily="Quicksand">{seesawCorr.desc}</text>}
          </svg>
        )}
      </div>

      {/* ═══ BEST HEDGING PAIRS ═══ */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8, animation: "fadeUp .4s ease .12s both" }}>
        <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 12 }}>Best Hedging Pairs</div>
        {topHedges.map((c, i) => {
          const pA = macroProducts.find(p => p.id === c.a);
          const pB = macroProducts.find(p => p.id === c.b);
          if (!pA || !pB) return null;
          return (
            <div key={i} onClick={() => setSeesawPair({ a: c.a, b: c.b })}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 10, marginBottom: 4, cursor: "pointer", background: "#FFEBEE08", border: "1px solid #F0E6D0", transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#FFEBEE22"; e.currentTarget.style.borderColor = "#EF535033"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#FFEBEE08"; e.currentTarget.style.borderColor = "#F0E6D0"; }}>
              <Icon name={pA.icon} size={12} />
              <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 17, minWidth: 30 }}>{pA.ticker}</span>
              <span style={{ color: "#EF5350", fontSize: 18, fontWeight: 700 }}>⟺</span>
              <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 17, minWidth: 30 }}>{pB.ticker}</span>
              <Icon name={pB.icon} size={12} />
              <div style={{ flex: 1 }} />
              <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 18, color: "#EF5350" }}>ρ {c.corr.toFixed(2)}</span>
              <div style={{ width: 36, height: 5, background: "#FFF5E6", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: Math.abs(c.corr) * 100 + "%", background: "#EF5350", borderRadius: 3 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════ PORTFOLIO HOROSCOPE ═══════════════
function HoroscopePage() {
  const [view, setView] = useState("lunar");

  // ── Moon Phase Data ──
  const lunarDay = 12; // days into current cycle
  const moonPhase = lunarDay < 3.7 ? "New Moon" : lunarDay < 7.4 ? "Waxing Crescent" : lunarDay < 11.1 ? "First Quarter" : lunarDay < 14.8 ? "Waxing Gibbous" : lunarDay < 18.5 ? "Full Moon" : lunarDay < 22.1 ? "Waning Gibbous" : lunarDay < 25.8 ? "Last Quarter" : "Waning Crescent";
  const nextFull = 3; // days to full moon
  const nextNew = 17;
  const moonPct = ((lunarDay / 29.5) * 100).toFixed(0);

  // ── Planetary Positions ──
  const planets = [
    { name: "Mercury", symbol: "mercury", sign: "Aquarius", retro: true, retroDates: "Feb 4 – Feb 24", marketEffect: "Communication breakdowns. Earnings revisions likely. Tech glitches disrupt trading. Historically S&P -1.2% avg during Mercury Rx.", color: "#EF5350", intensity: "High" },
    { name: "Venus", symbol: "venus", sign: "Pisces", retro: false, retroDates: null, marketEffect: "Venus in Pisces favors luxury, entertainment, and consumer sentiment. Risk appetite elevated. Gold catches a bid on aesthetic value cycles.", color: "#5B8C5A", intensity: "Mild" },
    { name: "Mars", symbol: "mars", sign: "Gemini", retro: false, retroDates: null, marketEffect: "Mars in Gemini drives dual-directional momentum. Sector rotation accelerates. Volume spikes in info-tech and telecom. Day traders thrive.", color: "#FFA726", intensity: "Moderate" },
    { name: "Jupiter", symbol: "jupiter", sign: "Taurus", retro: false, retroDates: null, marketEffect: "Jupiter in Taurus expands material wealth cycles. Commodities, real estate, and value stocks in a multi-month tailwind. Banking sector benefits from expansion energy.", color: "#5B8C5A", intensity: "Strong" },
    { name: "Saturn", symbol: "saturn", sign: "Pisces", retro: false, retroDates: null, marketEffect: "Saturn in Pisces restructures financial systems. Regulatory pressure on crypto and shadow banking. Bonds find discipline. 29.5-year Saturn cycle suggests secular regime shift.", color: "#42A5F5", intensity: "Structural" },
  ];

  // ── Cycle Correlations ──
  const cycles = [
    { name: "Lunar Cycle (29.5d)", icon: "moon-full", phase: "Waxing Gibbous", correlation: "+68%", note: "Markets historically rally +0.8% in 5 days before full moon. Institutional buying peaks at waxing gibbous. Full moon = local top risk.", barPct: 68, color: "#C48830" },
    { name: "Mercury Retrograde", icon: "mercury", phase: "IN RETROGRADE", correlation: "-62%", note: "S&P averages -1.2% during Rx periods (3-4x/year, ~21 days each). Miscommunication drives earnings misses. Avoid initiating new positions.", barPct: 62, color: "#EF5350" },
    { name: "Sunspot Cycle (11yr)", icon: "sun", phase: "Solar Maximum", correlation: "+54%", note: "We're at solar max (Cycle 25, peak 2024-25). Historically correlated with market volatility spikes. The Jevons solar-economic hypothesis shows agricultural & commodity sensitivity.", barPct: 54, color: "#FFA726" },
    { name: "Saturn Return (29.5yr)", icon: "saturn", phase: "Pisces transit", correlation: "+71%", note: "Saturn entered Pisces 2023 — last time was 1994 (bond crisis) and 1964 (structural shift). Major financial regulation and institutional restructuring ahead.", barPct: 71, color: "#42A5F5" },
    { name: "Jupiter-Saturn Conjunction", icon: "jupiter-saturn", phase: "Next: 2040", correlation: "+73%", note: "Every ~20 years: 2000 (dot-com), 1980 (Volcker), 1961 (Kennedy boom), 1940 (war economy). 2020 conjunction marked COVID pivot. Pattern suggests next structural break ~2040.", barPct: 73, color: "#AB47BC" },
    { name: "Metonic Cycle (19yr)", icon: "moon", phase: "Year 6 of 19", correlation: "+58%", note: "Moon returns to exact same phase on same calendar date every 19 years. 2007 → 2026 echo: credit conditions tightening, yield curve dynamics rhyming. Watch spring equinox.", barPct: 58, color: "#C48830" },
  ];

  // ── Current Celestial Weather ──
  const celestialWeather = {
    overall: "Stormy",
    score: 38,
    color: "#EF5350",
    summary: "Mercury retrograde in Aquarius creates a volatile backdrop. The waxing gibbous moon amplifies risk appetite into next week's full moon, but retrograde energy warns against overcommitting. Jupiter in Taurus provides a floor for commodity and value plays. Saturn's disciplining hand in Pisces keeps speculation in check — this is a cycle for patience, not aggression.",
    signals: [
      { signal: "Full Moon approaching (3 days)", bias: "Caution", icon: "moon-full", desc: "Institutional selling historically picks up 1-2 days after full moon", color: "#EF5350" },
      { signal: "Mercury Rx until Feb 24", bias: "Bearish", icon: "mercury", desc: "Avoid new trades. Expect earnings revisions and data surprises", color: "#EF5350" },
      { signal: "Jupiter in Taurus (through May)", bias: "Bullish", icon: "jupiter", desc: "Long-cycle tailwind for commodities, value, and real assets", color: "#5B8C5A" },
      { signal: "Venus enters Pisces", bias: "Neutral-Bull", icon: "venus", desc: "Consumer sentiment lifts. Luxury and entertainment favored", color: "#5B8C5A" },
    ]
  };

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>Celestial Market Cycles</h1>
        <p style={{ color: "#33333480", fontSize: 14, marginTop: 2 }}>Lunar phases, planetary retrogrades & astronomical cycle correlations</p>
      </div>

      {/* View tabs */}
      <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
        {[{ id: "lunar", l: "Lunar" }, { id: "planets", l: "Planets" }, { id: "cycles", l: "Cycles" }].map(t => (
          <button key={t.id} onClick={() => setView(t.id)} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: "none", background: view === t.id ? "#1A1A2E" : "#fff", color: view === t.id ? "#E8DCC8" : "#A09080", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Quicksand", border: view !== t.id ? "1.5px solid #F0E6D0" : "1.5px solid #1A1A2E" }}>{t.l}</button>
        ))}
      </div>

      {/* ── CELESTIAL WEATHER BANNER ── */}
      <div style={{ background: "linear-gradient(135deg, #0D1B2A, #1B2838, #162447)", borderRadius: 14, padding: "12px 12px", marginBottom: 8, position: "relative", overflow: "hidden" }}>
        {/* Stars */}
        {[...Array(20)].map((_, i) => <div key={i} style={{ position: "absolute", width: i % 3 === 0 ? 2 : 1, height: i % 3 === 0 ? 2 : 1, borderRadius: "50%", background: "#fff", opacity: 0.2 + (i % 4) * 0.15, top: (i * 17 + 3) % 80 + "%", left: (i * 23 + 7) % 95 + "%", animation: `blink ${2 + i % 3}s ease ${i * 0.3}s infinite` }} />)}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#7A8BA0", textTransform: "uppercase", letterSpacing: 1 }}>Celestial Weather</div>
              <div style={{ fontSize: 21, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: celestialWeather.color }}>{celestialWeather.overall}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 30, fontWeight: 900, fontFamily: "JetBrains Mono", color: celestialWeather.color }}>{celestialWeather.score}</div>
              <div style={{ fontSize: 11, color: "#7A8BA0", fontWeight: 700 }}>/ 100 SCORE</div>
            </div>
          </div>
          {/* Moon Phase Visual */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", background: "rgba(255,255,255,.05)", borderRadius: 10, padding: "8px 10px", marginBottom: 8 }}>
            <div style={{ fontSize: 42, lineHeight: 1 }}></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#E8DCC8", fontFamily: "'Instrument Serif', serif" }}>{moonPhase}</div>
              <div style={{ fontSize: 12, color: "#7A8BA0" }}>Day {lunarDay} of 29.5 · {moonPct}% illuminated</div>
              <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                <span style={{ fontSize: 11, color: "#C48830", fontWeight: 700 }}>Full in {nextFull}d</span>
                <span style={{ fontSize: 11, color: "#7A8BA0", fontWeight: 700 }}>New in {nextNew}d</span>
              </div>
            </div>
            {/* Moon progress bar */}
            <div style={{ width: 50, height: 50, borderRadius: "50%", border: "2px solid #334", position: "relative", overflow: "hidden", flexShrink: 0 }}>
              <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: moonPct + "%", background: "#E8DCC8", transition: "width .5s" }} />
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#9AABBD", lineHeight: 1.5 }}>{celestialWeather.summary}</p>
        </div>
      </div>

      {/* ── LUNAR VIEW ── */}
      {view === "lunar" && <div>
        {/* Signals */}
        <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 6, color: "#333334" }}>Active Celestial Signals</div>
        {celestialWeather.signals.map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "8px 10px", marginBottom: 4, animation: "fadeUp .3s ease " + (i * .05) + "s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <Icon name={s.icon} size={12} />
                <span style={{ fontSize: 14, fontWeight: 800, color: "#333334" }}>{s.signal}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: s.color, background: s.color + "15", padding: "1px 6px", borderRadius: 4 }}>{s.bias}</span>
            </div>
            <div style={{ fontSize: 12, color: "#8A7A68", lineHeight: 1.3, paddingLeft: 20 }}>{s.desc}</div>
          </div>
        ))}

        {/* Historical lunar pattern */}
        <div style={{ background: "#fff", borderRadius: 10, padding: "8px 10px", marginTop: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 6 }}>Lunar Cycle → Market Pattern (50yr data)</div>
          <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 50, marginBottom: 4 }}>
            {[3,5,7,8,10,9,7,4,2,-1,-3,-4,-2,0,2,4,6,8,9,10,8,6,4,3,2,1,0,-1,3,5].map((v, i) => (
              <div key={i} style={{ flex: 1, height: Math.abs(v) * 4 + 2, background: v >= 0 ? "#C48830" : "#EF5350", borderRadius: 1, opacity: i === lunarDay ? 1 : 0.4, transition: "all .3s", position: "relative" }}>
                {i === lunarDay && <div style={{ position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#C48830" }} />}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#33333480" }}>
            <span>New</span><span>Q1</span><span>Full</span><span>Q3</span><span>New</span>
          </div>
          <div style={{ fontSize: 12, color: "#8A7A68", marginTop: 6, lineHeight: 1.4 }}>
            Strongest returns cluster around waxing phases (days 5-13). Post-full-moon correction is statistically significant (p &lt; 0.03). Current position: <span style={{ fontWeight: 800, color: "#C48830" }}>day {lunarDay} — approaching peak</span>.
          </div>
        </div>
      </div>}

      {/* ── PLANETS VIEW ── */}
      {view === "planets" && <div>
        <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 6, color: "#333334" }}>Planetary Positions & Market Effects</div>
        {planets.map((p, i) => (
          <div key={i} style={{ background: p.retro ? "#1A1A2E" : "#fff", border: `1.5px solid ${p.retro ? "#EF535044" : "#F0E6D0"}`, borderRadius: 10, padding: "8px 10px", marginBottom: 4, animation: "fadeUp .3s ease " + (i * .04) + "s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <span style={{ fontSize: 24, fontFamily: "serif" }}>{p.symbol}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: p.retro ? "#E8DCC8" : "#5C4A1E" }}>{p.name} <span style={{ fontWeight: 600, color: p.retro ? "#7A8BA0" : "#8A7A68" }}>in {p.sign}</span></div>
                  {p.retro && <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 1 }}>
                    <span style={{ fontSize: 11, fontWeight: 900, background: "#EF5350", color: "#fff", padding: "1px 5px", borderRadius: 3, animation: "blink 2s ease infinite" }}>℞ RETROGRADE</span>
                    <span style={{ fontSize: 11, color: "#7A8BA0" }}>{p.retroDates}</span>
                  </div>}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: p.color, background: p.color + "18", padding: "1px 6px", borderRadius: 4 }}>{p.intensity}</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: p.retro ? "#9AABBD" : "#8A7A68", lineHeight: 1.4, marginTop: 2 }}>{p.marketEffect}</div>
          </div>
        ))}

        {/* Retrograde Calendar */}
        <div style={{ background: "#1A1A2E", borderRadius: 10, padding: "8px 10px", marginTop: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#E8DCC8", fontFamily: "'Instrument Serif', serif", marginBottom: 6 }}>Retrograde Calendar 2026</div>
          {[
            { planet: "Mercury", dates: "Feb 4 – Feb 24", status: "ACTIVE", color: "#EF5350" },
            { planet: "Mercury", dates: "May 29 – Jun 22", status: "Upcoming", color: "#FFA726" },
            { planet: "Mercury", dates: "Sep 23 – Oct 15", status: "Upcoming", color: "#FFA726" },
            { planet: "Venus", dates: "Jul 10 – Aug 20", status: "Upcoming", color: "#FFA726" },
            { planet: "Mars", dates: "Oct 30 – Jan 12 '27", status: "Upcoming", color: "#FFA726" },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderTop: i > 0 ? "1px solid #ffffff11" : "none" }}>
              <span style={{ fontSize: 14, color: "#E8DCC8", fontWeight: 600 }}>{r.planet}</span>
              <span style={{ fontSize: 12, color: "#7A8BA0", fontFamily: "JetBrains Mono" }}>{r.dates}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: r.color, background: r.color + "22", padding: "1px 5px", borderRadius: 3 }}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>}

      {/* ── CYCLES VIEW ── */}
      {view === "cycles" && <div>
        <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 6, color: "#333334" }}>Astronomical Cycles × Market Correlation</div>
        {cycles.map((c, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "8px 10px", marginBottom: 4, animation: "fadeUp .3s ease " + (i * .04) + "s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <Icon name={c.icon} size={14} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: "#333334" }}>{c.name}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: c.phase === "IN RETROGRADE" ? "#EF5350" : "#8A7A68" }}>{c.phase}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 900, color: c.color }}>{c.correlation}</div>
                <div style={{ fontSize: 11, color: "#33333480" }}>correlation</div>
              </div>
            </div>
            {/* Correlation bar */}
            <div style={{ height: 4, background: "#F0E6D0", borderRadius: 2, marginBottom: 4 }}>
              <div style={{ height: "100%", width: c.barPct + "%", background: c.color, borderRadius: 2, transition: "width .5s" }} />
            </div>
            <div style={{ fontSize: 12, color: "#8A7A68", lineHeight: 1.4 }}>{c.note}</div>
          </div>
        ))}

        {/* Historical echo */}
        <div style={{ background: "linear-gradient(135deg, #0D1B2A, #162447)", borderRadius: 10, padding: "10px 12px", marginTop: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#E8DCC8", fontFamily: "'Instrument Serif', serif", marginBottom: 4 }}>Cyclical Echo: 2007 → 2026</div>
          <div style={{ fontSize: 12, color: "#9AABBD", lineHeight: 1.5 }}>
            The Metonic cycle (19 years) places 2026 as a lunar echo of 2007. Key parallels: yield curve normalization after prolonged inversion, housing market stretched, credit conditions tightening, and Saturn in the same sign. The 2007 analog suggests a <span style={{ fontWeight: 800, color: "#EF5350" }}>Q3 vulnerability window</span> — but Jupiter's Taurus transit (absent in 2007) provides a stabilizing counterweight through material wealth expansion.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 8 }}>
            <div style={{ background: "rgba(255,255,255,.06)", borderRadius: 6, padding: "6px 8px" }}>
              <div style={{ fontSize: 11, color: "#7A8BA0", fontWeight: 700, textTransform: "uppercase" }}>2007 Analog</div>
              <div style={{ fontSize: 14, color: "#EF5350", fontWeight: 800 }}>S&P peaked Oct</div>
            </div>
            <div style={{ background: "rgba(255,255,255,.06)", borderRadius: 6, padding: "6px 8px" }}>
              <div style={{ fontSize: 11, color: "#7A8BA0", fontWeight: 700, textTransform: "uppercase" }}>2026 Projection</div>
              <div style={{ fontSize: 14, color: "#FFA726", fontWeight: 800 }}>Watch Aug-Oct</div>
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}

// ═══════════════ WEATHER × MARKET ═══════════════
function WeatherMarketPage() {
  const [view, setView] = useState("current");

  const regions = [
    { name: "Northeast", icon: "city", temp: "28°F", condition: "Snow", wind: "18mph NW", sentiment: "Bearish", color: "#42A5F5",
      impact: "Heavy snow disrupts logistics + retail foot traffic. Energy demand spikes → nat gas +3.2%. Airlines delayed → carrier stocks -1.4%.",
      affected: [{ ticker: "UNG", move: "+3.2%", clr: "#5B8C5A" }, { ticker: "HD", move: "+1.8%", clr: "#5B8C5A" }, { ticker: "DAL", move: "-1.4%", clr: "#EF5350" }, { ticker: "WMT", move: "-0.6%", clr: "#EF5350" }] },
    { name: "Southeast", icon: "palm", temp: "72°F", condition: "Clear", wind: "8mph S", sentiment: "Bullish", color: "#5B8C5A",
      impact: "Mild weather supports construction + outdoor retail. Tourism steady. No disruption to ports or shipping lanes.",
      affected: [{ ticker: "DHI", move: "+0.8%", clr: "#5B8C5A" }, { ticker: "LOW", move: "+0.5%", clr: "#5B8C5A" }, { ticker: "DIS", move: "+0.3%", clr: "#5B8C5A" }, { ticker: "FDX", move: "+0.2%", clr: "#5B8C5A" }] },
    { name: "Midwest", icon: "wheat", temp: "15°F", condition: "Ice Storm", wind: "25mph N", sentiment: "Bearish", color: "#EF5350",
      impact: "Ice storms halt grain transport on Mississippi River. Commodity futures volatile. Agricultural equipment demand paused. Heating costs surge.",
      affected: [{ ticker: "CORN", move: "+2.1%", clr: "#5B8C5A" }, { ticker: "DE", move: "-1.2%", clr: "#EF5350" }, { ticker: "UNG", move: "+2.8%", clr: "#5B8C5A" }, { ticker: "RAIL", move: "-0.9%", clr: "#EF5350" }] },
    { name: "West Coast", icon: "wave", temp: "58°F", condition: "Rain", wind: "12mph W", sentiment: "Neutral", color: "#FFA726",
      impact: "Atmospheric river brings heavy rain to CA. Drought relief positive for agriculture long-term but short-term flooding risks. Tech corridor unaffected.",
      affected: [{ ticker: "AAPL", move: "0.0%", clr: "#A09080" }, { ticker: "DWA", move: "+0.4%", clr: "#5B8C5A" }, { ticker: "AGR", move: "+1.1%", clr: "#5B8C5A" }, { ticker: "PG", move: "-0.2%", clr: "#EF5350" }] },
    { name: "Gulf Coast", icon: "oil-barrel", temp: "65°F", condition: "Partly Cloudy", wind: "10mph SE", sentiment: "Bullish", color: "#5B8C5A",
      impact: "Calm conditions for Gulf oil operations. Refinery throughput at full capacity. No tropical threats in forecast. Energy production stable.",
      affected: [{ ticker: "XOM", move: "+0.5%", clr: "#5B8C5A" }, { ticker: "CVX", move: "+0.4%", clr: "#5B8C5A" }, { ticker: "PSX", move: "+0.7%", clr: "#5B8C5A" }, { ticker: "SLB", move: "+0.3%", clr: "#5B8C5A" }] },
  ];

  const seasonal = [
    { pattern: "January Effect", period: "Jan", correlation: "+72%", desc: "Small caps historically outperform in January as tax-loss harvesting reverses. Cold weather reinforces stay-at-home spending patterns.", barPct: 72, color: "#42A5F5", active: false },
    { pattern: "Winter Heating Season", period: "Nov–Mar", correlation: "+68%", desc: "Nat gas and heating oil futures rise with cold snaps. Every 5°F below average = ~2.1% boost to UNG. Utility stocks benefit from volume.", barPct: 68, color: "#EF5350", active: true },
    { pattern: "Spring Planting", period: "Mar–May", correlation: "+61%", desc: "Corn/soybean futures react to planting-season moisture. Too wet delays planting → futures spike. Ideal conditions → agri-stocks rally.", barPct: 61, color: "#5B8C5A", active: false },
    { pattern: "Hurricane Season", period: "Jun–Nov", correlation: "+77%", desc: "Gulf hurricanes disrupt 45% of US refining. Historical: Cat 3+ storm = oil +8%, insurance stocks -5%. Rebuilding boosts HD, LOW.", barPct: 77, color: "#FFA726", active: false },
    { pattern: "Summer Drought Risk", period: "Jun–Aug", correlation: "+65%", desc: "Corn belt drought = crop failure risk. 2012 drought: corn +50% in 8 weeks. Water utilities and irrigation companies benefit.", barPct: 65, color: "#EF5350", active: false },
    { pattern: "Harvest Pressure", period: "Sep–Oct", correlation: "+58%", desc: "Record harvests depress grain prices as supply floods market. Good weather = bearish crops, bullish food processors.", barPct: 58, color: "#C48830", active: false },
  ];

  const weatherAlpha = {
    score: 62,
    color: "#FFA726",
    label: "Mixed Signals",
    summary: "Northeast winter storm creates short-term energy tailwinds and logistics headwinds. Gulf calm supports energy production. Midwest ice disrupts grain transport. Net portfolio bias: slight energy overweight warranted, reduce transport exposure.",
    signals: [
      { signal: "Nat Gas Long", confidence: 85, color: "#5B8C5A", reason: "Cold snap NE + Midwest → heating demand surge" },
      { signal: "Airline Underweight", confidence: 72, color: "#EF5350", reason: "Snow delays → cancellations → revenue hit" },
      { signal: "Home Improvement Long", confidence: 68, color: "#5B8C5A", reason: "Storm damage → repair spending → HD/LOW" },
      { signal: "Ag Futures Watch", confidence: 55, color: "#FFA726", reason: "Ice on Mississippi disrupts barge transport" },
    ]
  };

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>Weather × Markets</h1>
        <p style={{ color: "#33333480", fontSize: 14, marginTop: 2 }}>US weather patterns & their impact on stock performance</p>
      </div>

      <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
        {[{ id: "current", l: "Live" }, { id: "seasonal", l: "Seasonal" }, { id: "alpha", l: "Alpha" }].map(t => (
          <button key={t.id} onClick={() => setView(t.id)} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: `1.5px solid ${view === t.id ? "#42A5F5" : "#F0E6D0"}`, background: view === t.id ? "#42A5F5" : "#fff", color: view === t.id ? "#fff" : "#A09080", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Quicksand" }}>{t.l}</button>
        ))}
      </div>

      {/* ── WEATHER ALPHA BANNER ── */}
      <div style={{ background: "linear-gradient(135deg, #1B3A5C, #2D5A87, #1B4B6C)", borderRadius: 14, padding: "10px 12px", marginBottom: 8, position: "relative", overflow: "hidden" }}>
        {/* Cloud/sun decorations */}
        <div style={{ position: "absolute", top: 4, right: 12, fontSize: 30, opacity: 0.15 }}></div>
        <div style={{ position: "absolute", bottom: 4, right: 40, fontSize: 21, opacity: 0.1 }}></div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#7AAEDB", textTransform: "uppercase", letterSpacing: 1 }}>Weather Alpha Score</div>
              <div style={{ fontSize: 21, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: weatherAlpha.color }}>{weatherAlpha.label}</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: "50%", border: `3px solid ${weatherAlpha.color}`, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.3)" }}>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 24, fontWeight: 900, color: weatherAlpha.color }}>{weatherAlpha.score}</span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#AECCE6", lineHeight: 1.4 }}>{weatherAlpha.summary}</p>
        </div>
      </div>

      {/* ── LIVE VIEW ── */}
      {view === "current" && <div>
        <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 6, color: "#333334" }}>US Regional Weather & Market Impact</div>
        {regions.map((r, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "8px 10px", marginBottom: 4, animation: "fadeUp .3s ease " + (i * .04) + "s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <Icon name={r.icon} size={14} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif" }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: "#33333480" }}>{r.condition} · {r.temp} · Wind {r.wind}</div>
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: r.color, background: r.color + "15", padding: "2px 6px", borderRadius: 4 }}>{r.sentiment}</span>
            </div>
            <div style={{ fontSize: 12, color: "#6B5A2E", lineHeight: 1.3, marginBottom: 6 }}>{r.impact}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 3 }}>
              {r.affected.map((a, j) => (
                <div key={j} style={{ background: "#FFFDF5", borderRadius: 6, padding: "4px 6px", textAlign: "center" }}>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 800 }}>{a.ticker}</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 700, color: a.clr }}>{a.move}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>}

      {/* ── SEASONAL VIEW ── */}
      {view === "seasonal" && <div>
        <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 6, color: "#333334" }}>Seasonal Weather Patterns × Market Correlation</div>
        {seasonal.map((s, i) => (
          <div key={i} style={{ background: s.active ? s.color + "08" : "#fff", border: `1.5px solid ${s.active ? s.color + "44" : "#F0E6D0"}`, borderRadius: 10, padding: "8px 10px", marginBottom: 4, animation: "fadeUp .3s ease " + (i * .04) + "s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: "#333334" }}>
                  {s.pattern} {s.active && <span style={{ fontSize: 11, background: s.color, color: "#fff", padding: "1px 5px", borderRadius: 3, marginLeft: 4 }}>ACTIVE</span>}
                </div>
                <div style={{ fontSize: 12, color: "#33333480" }}>{s.period}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 900, color: s.color }}>{s.correlation}</div>
                <div style={{ fontSize: 11, color: "#33333480" }}>correlation</div>
              </div>
            </div>
            <div style={{ height: 4, background: "#F0E6D0", borderRadius: 2, marginBottom: 4 }}>
              <div style={{ height: "100%", width: s.barPct + "%", background: s.color, borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 12, color: "#6B5A2E", lineHeight: 1.3 }}>{s.desc}</div>
          </div>
        ))}

        {/* Seasonal Calendar Mini */}
        <div style={{ background: "#fff", borderRadius: 10, padding: "8px 10px", marginTop: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 6 }}>Weather-Sensitive Calendar</div>
          <div className="month-grid" style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 2 }}>
            {["J","F","M","A","M","J","J","A","S","O","N","D"].map((m, i) => {
              const isCurrent = i === 1;
              const risk = i >= 5 && i <= 10 ? "#EF5350" : i >= 0 && i <= 2 ? "#42A5F5" : i >= 2 && i <= 4 ? "#5B8C5A" : "#FFA726";
              return (
                <div key={i} style={{ textAlign: "center", padding: "4px 0", borderRadius: 4, background: isCurrent ? risk : risk + "15", border: isCurrent ? `2px solid ${risk}` : "none" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: isCurrent ? "#fff" : risk }}>{m}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 6, fontSize: 11, color: "#33333480", justifyContent: "center" }}>
            <span><span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 1, background: "#42A5F5", marginRight: 2, verticalAlign: "middle" }} />Winter</span>
            <span><span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 1, background: "#5B8C5A", marginRight: 2, verticalAlign: "middle" }} />Planting</span>
            <span><span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 1, background: "#EF5350", marginRight: 2, verticalAlign: "middle" }} />Hurricane</span>
            <span><span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 1, background: "#FFA726", marginRight: 2, verticalAlign: "middle" }} />Harvest</span>
          </div>
        </div>
      </div>}

      {/* ── ALPHA VIEW ── */}
      {view === "alpha" && <div>
        <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 6, color: "#333334" }}>Weather-Driven Trade Signals</div>
        {weatherAlpha.signals.map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "8px 10px", marginBottom: 4, animation: "fadeUp .3s ease " + (i * .04) + "s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <span style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: s.color }}>{s.signal}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 40, height: 4, background: "#F0E6D0", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: s.confidence + "%", background: s.color, borderRadius: 2 }} />
                </div>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 800, color: s.color }}>{s.confidence}%</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#6B5A2E", lineHeight: 1.3 }}>{s.reason}</div>
          </div>
        ))}

        {/* Historical weather alpha */}
        <div style={{ background: "linear-gradient(135deg, #1B3A5C, #2D5A87)", borderRadius: 10, padding: "10px 12px", marginTop: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#E8DCC8", fontFamily: "'Instrument Serif', serif", marginBottom: 6 }}>Historical Weather Alpha (10yr backtest)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            {[
              { label: "Cold Snap → Nat Gas", win: "78%", avgReturn: "+4.2%", clr: "#5B8C5A" },
              { label: "Hurricane → Oil", win: "71%", avgReturn: "+8.1%", clr: "#5B8C5A" },
              { label: "Drought → Corn", win: "65%", avgReturn: "+12.4%", clr: "#5B8C5A" },
              { label: "Storm → Airlines", win: "73%", avgReturn: "-2.8%", clr: "#EF5350" },
              { label: "Mild Winter → Retail", win: "62%", avgReturn: "+1.9%", clr: "#5B8C5A" },
              { label: "Heat Wave → Utilities", win: "69%", avgReturn: "+3.1%", clr: "#5B8C5A" },
            ].map((h, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,.06)", borderRadius: 6, padding: "6px 8px" }}>
                <div style={{ fontSize: 12, color: "#AECCE6", fontWeight: 700, marginBottom: 2 }}>{h.label}</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 800, color: h.clr }}>{h.avgReturn}</span>
                  <span style={{ fontSize: 12, color: "#7AAEDB" }}>Win: {h.win}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: "#7AAEDB", textAlign: "center" }}>Based on NOAA data × equity returns 2015–2025</div>
        </div>
      </div>}
    </div>
  );
}


// ═══════════════ CURRENCIES SCENARIO ═══════════════
function CurrenciesScenarioPage() {
  const [pair, setPair] = useState("dxy");
  const pairs = {
    dxy: { name: "US Dollar Index", icon: "dollar", price: "104.2", change: "+0.3%", clr: "#5B8C5A",
      scenarios: [
        { name: "Dollar Bull", prob: "35%", target: "108-112", color: "#5B8C5A", desc: "Fed stays hawkish, US exceptionalism continues. EM currencies crushed." },
        { name: "Dollar Neutral", prob: "40%", target: "102-106", color: "#FFA726", desc: "Range-bound. Mixed data offsets. Carry trades persist." },
        { name: "Dollar Bear", prob: "25%", target: "96-100", color: "#EF5350", desc: "Fed pivots aggressively. Global risk-on. EM and commodities rally." }
      ] },
    eurusd: { name: "EUR/USD", icon: "flag-eu", price: "1.0785", change: "-0.2%", clr: "#EF5350",
      scenarios: [
        { name: "Euro Strength", prob: "30%", target: "1.12-1.15", color: "#5B8C5A", desc: "ECB lags Fed cuts. European recovery surprises. Flows rotate to EU assets." },
        { name: "Rangebound", prob: "45%", target: "1.06-1.10", color: "#FFA726", desc: "Both central banks converge. Trade balance neutral." },
        { name: "Parity Risk", prob: "25%", target: "0.98-1.04", color: "#EF5350", desc: "European recession deepens. Energy crisis redux. Capital flight to USD." }
      ] },
    usdjpy: { name: "USD/JPY", icon: "flag-jp", price: "151.8", change: "+0.5%", clr: "#5B8C5A",
      scenarios: [
        { name: "BOJ Tightens", prob: "35%", target: "140-145", color: "#5B8C5A", desc: "BOJ normalizes. Carry trade unwinds. JPY surges. Global vol spikes." },
        { name: "Gradual Drift", prob: "40%", target: "148-155", color: "#FFA726", desc: "Slow adjustment. MOF intervention threats. Range-bound with bias higher." },
        { name: "Carry Blowup", prob: "25%", target: "155-165", color: "#EF5350", desc: "Rate differential widens further. JPY freefalls. BOJ forced to intervene." }
      ] },
    btcusd: { name: "BTC/USD", icon: "bitcoin", price: "$97,200", change: "+2.1%", clr: "#5B8C5A",
      scenarios: [
        { name: "Supercycle", prob: "25%", target: "$150k-200k", color: "#5B8C5A", desc: "Halving supply shock. ETF inflows accelerate. Corporate adoption wave." },
        { name: "Consolidation", prob: "45%", target: "$80k-110k", color: "#FFA726", desc: "Post-halving range. Macro uncertainty caps upside. Institutional accumulation." },
        { name: "Crypto Winter", prob: "30%", target: "$40k-60k", color: "#EF5350", desc: "Regulatory crackdown. Liquidity drain. Leverage unwinds. Risk-off contagion." }
      ] }
  };
  const p = pairs[pair];
  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>Currency Scenarios</h1>
        <p style={{ color: "#33333480", fontSize: 14, marginTop: 2 }}>FX pair scenarios — rate differentials & macro flows</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4, marginBottom: 8 }}>
        {Object.entries(pairs).map(([id, pr]) => (
          <button key={id} onClick={() => setPair(id)} style={{ padding: "8px 4px", borderRadius: 10, border: `1.5px solid ${pair === id ? "#C48830" : "#F0E6D0"}`, background: pair === id ? "#FFF8EE" : "#fff", cursor: "pointer", textAlign: "center" }}>
            <div><Icon name={pr.icon} size={14} /></div>
            <div style={{ fontSize: 12, fontWeight: 800, color: pair === id ? "#C48830" : "#A09080" }}>{id.toUpperCase()}</div>
          </button>
        ))}
      </div>
      <div style={{ background: "#fff", borderRadius: 12, padding: "10px 12px", marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 17, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>{p.name}</div>
          <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700 }}>{p.price} <span style={{ color: p.clr, fontSize: 14 }}>{p.change}</span></div>
        </div>
        {p.scenarios.map((sc, i) => (
          <div key={i} style={{ background: sc.color + "11", borderRadius: 8, padding: "8px 10px", marginBottom: 4, border: `1px solid ${sc.color}22` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: sc.color }}>{sc.name}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 800, color: sc.color }}>{sc.target}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#33333480" }}>{sc.prob}</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#6B5A2E", lineHeight: 1.3 }}>{sc.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════ INDICATOR DETAIL PAGE ═══════════════
function IndicatorDetailPage({ indicatorId, onBack, onSelectIndicator, liveNews }) {
  const ind = macroDashboardData.find(i => i.id === indicatorId);
  const details = INDICATOR_DETAILS[indicatorId] || {};
  const newsMap = INDICATOR_NEWS_MAP[indicatorId] || { cats: [], keywords: [] };
  const [chartHover, setChartHover] = useState(null);
  const [period, setPeriod] = useState("2Y");
  const chartRef = useRef(null);
  if (!ind) return <div style={{ padding: 20, textAlign: "center", color: "#A09080" }}>Indicator not found</div>;

  const periodData = ind.periods?.[period] || ind.periods?.["2Y"] || { dates: [], data: [] };
  const pts = periodData.data;
  const dates = periodData.dates;
  const n = pts.length;
  const baseVal = pts[0];

  const analysis = analyzeHistory(pts);
  const sc = { bullish: "#5B8C5A", bearish: "#EF5350", neutral: "#A09080" };
  const delta = ind.value - ind.prev;
  const clr = sc[ind.signal] || "#A09080";

  // Related alerts & news
  const relatedAlerts = macroAlerts.filter(a =>
    a.tags.some(t => newsMap.keywords.some(kw => t.toLowerCase().includes(kw.toLowerCase()))) ||
    newsMap.keywords.some(kw => a.title.toLowerCase().includes(kw.toLowerCase()))
  );
  const newsSource = (liveNews && liveNews.length > 0) ? liveNews : terminalFeed;
  const relatedNews = newsSource.filter(f =>
    newsMap.cats.includes(f.cat) ||
    newsMap.keywords.some(kw => f.headline.toLowerCase().includes(kw.toLowerCase()))
  ).slice(0, 5);

  // Chart dimensions
  const W = 640, H = 170, PX = 42, PY = 18;
  const cW = W - PX * 2, cH = H - PY * 2;
  const spMin = analysis.min * 0.95, spMax = analysis.max * 1.02, spRange = (spMax - spMin) || 1;
  const step = cW / (n - 1);
  const chartPts = pts.map((v, i) => ({ x: PX + i * step, y: PY + (1 - (v - spMin) / spRange) * cH, v, i, label: dates[i] || (i === n - 1 ? "Now" : `T-${n - 1 - i}`) }));
  const linePath = chartPts.map((p, i) => { if (!i) return `M${p.x},${p.y}`; const pr = chartPts[i - 1]; return `C${pr.x + step * .4},${pr.y} ${p.x - step * .4},${p.y} ${p.x},${p.y}`; }).join(" ");
  const areaPath = linePath + ` L${chartPts[n - 1].x},${H - PY} L${chartPts[0].x},${H - PY} Z`;
  const toY = (v) => PY + (1 - (v - spMin) / spRange) * cH;

  // Chart hover handler
  const handleChartMove = (clientX) => {
    const r = chartRef.current.getBoundingClientRect();
    const mx = ((clientX - r.left) / r.width) * W;
    let closest = chartPts[0], minD = Infinity;
    chartPts.forEach(p => { const d = Math.abs(p.x - mx); if (d < minD) { minD = d; closest = p; } });
    setChartHover(closest);
  };
  const handleChartLeave = () => setChartHover(null);

  // Display values (update on hover)
  const displayVal = chartHover ? chartHover.v : ind.value;
  const displayDelta = chartHover ? (chartHover.v - baseVal) : delta;
  const displayPct = chartHover ? ((chartHover.v - baseVal) / (baseVal || 1)) * 100 : ((delta) / (ind.prev || 1)) * 100;
  const displayColor = displayDelta >= 0 ? "#5B8C5A" : "#EF5350";

  // Grid lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(p => ({ y: PY + (1 - p) * cH, val: (spMin + p * spRange).toFixed(ind.unit === "%" ? 2 : 1) }));

  // Key levels from details
  const keyLevelEntries = details.keyLevels ? Object.entries(details.keyLevels).filter(([, v]) => v >= spMin && v <= spMax) : [];

  return (
    <div style={{ animation: "fadeUp .3s ease both" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <button onClick={onBack} style={{ background: "#fff", borderRadius: 12, width: 34, height: 34, border: "1.5px solid #F0E6D0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>←</button>
        <Icon name={details.icon || "chart-bar"} size={16} color={clr} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>{ind.name}</div>
          <div style={{ fontSize: 12, color: "#33333480" }}>{ind.source} · {ind.freq}</div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 800, background: clr + "18", color: clr, padding: "3px 10px", borderRadius: 8, textTransform: "uppercase" }}>{ind.signal}</span>
      </div>

      {/* Combined Hero + Interactive Chart */}
      <div style={{ background: "#fff", borderRadius: 18, padding: "18px 16px 12px", marginBottom: 8, position: "relative", overflow: "hidden" }}>
        <div style={{ fontSize: 12, color: "#33333480", fontWeight: 700, marginBottom: 4 }}>
          {chartHover ? <span style={{ transition: "all .15s" }}>{chartHover.label}</span> : (details.fullName || ind.name)}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 42, fontWeight: 900, color: "#333334", lineHeight: 1, transition: "all .15s" }}>
            {typeof displayVal === "number" ? (displayVal >= 100 ? displayVal.toFixed(1) : displayVal.toFixed(2)) : displayVal}{ind.unit}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 700, color: displayColor, background: displayDelta >= 0 ? "#EDF5ED" : "#FFEBEE", padding: "2px 8px", borderRadius: 8, transition: "all .15s" }}>
            {displayDelta >= 0 ? "+" : ""}{displayPct.toFixed(2)}%
          </span>
          <span style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700, color: displayColor, transition: "all .15s" }}>
            {displayDelta >= 0 ? "▲" : "▼"} {displayDelta >= 0 ? "+" : ""}{displayDelta.toFixed(ind.unit === "%" ? 2 : 1)}
          </span>
          <span style={{ fontSize: 14, color: "#8A7A68", fontWeight: 600 }}>{chartHover ? "from start" : "vs prev"}</span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: sc[analysis.maSignal], background: sc[analysis.maSignal] + "15", padding: "2px 8px", borderRadius: 6 }}>MA-5: {analysis.ma5.toFixed(2)}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#33333480", background: "#F5F0E8", padding: "2px 8px", borderRadius: 6 }}>MA-10: {analysis.ma10.toFixed(2)}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#C48830", background: "#FFF8EE", padding: "2px 8px", borderRadius: 6 }}>Weight: {(ind.weight * 100).toFixed(0)}%</span>
        </div>

        {/* Interactive Chart */}
        <div style={{ position: "relative" }}>
          <svg ref={chartRef} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", touchAction: "none" }}
            onMouseMove={e => handleChartMove(e.clientX)}
            onTouchMove={e => { if (e.touches[0]) handleChartMove(e.touches[0].clientX); }}
            onMouseLeave={handleChartLeave}
            onTouchEnd={handleChartLeave}>
            {/* Grid lines */}
            {gridLines.map((g, i) => (
              <g key={i}>
                <line x1={PX} y1={g.y} x2={W - PX} y2={g.y} stroke="#F0E6D0" strokeWidth=".8" />
                <text x={PX - 6} y={g.y + 4} textAnchor="end" fontSize="9" fill="#A09080" fontFamily="JetBrains Mono">{g.val}</text>
              </g>
            ))}
            {/* Support & Resistance lines */}
            <line x1={PX} y1={toY(analysis.support)} x2={W - PX} y2={toY(analysis.support)} stroke="#5B8C5A" strokeWidth="1" strokeDasharray="4,3" />
            <text x={W - PX + 4} y={toY(analysis.support) + 4} fontSize="8" fill="#5B8C5A" fontWeight="700">S</text>
            <line x1={PX} y1={toY(analysis.resistance)} x2={W - PX} y2={toY(analysis.resistance)} stroke="#EF5350" strokeWidth="1" strokeDasharray="4,3" />
            <text x={W - PX + 4} y={toY(analysis.resistance) + 4} fontSize="8" fill="#EF5350" fontWeight="700">R</text>
            {/* MA-5 line */}
            {n >= 5 && (() => {
              const maPath = chartPts.map((_, i) => {
                if (i < 4) return null;
                const maVal = pts.slice(i - 4, i + 1).reduce((a, b) => a + b, 0) / 5;
                return `${i === 4 ? "M" : "L"}${chartPts[i].x.toFixed(1)},${toY(maVal).toFixed(1)}`;
              }).filter(Boolean).join(" ");
              return <path d={maPath} fill="none" stroke="#C48830" strokeWidth="1.2" strokeDasharray="3,3" opacity="0.6" />;
            })()}
            {/* Key levels */}
            {keyLevelEntries.map(([label, val], i) => (
              <g key={i}>
                <line x1={PX} y1={toY(val)} x2={W - PX} y2={toY(val)} stroke="#C4883060" strokeWidth="0.8" strokeDasharray="2,3" />
                <text x={PX + 4} y={toY(val) - 4} fontSize="8" fill="#C48830" fontWeight="600">{label} ({val})</text>
              </g>
            ))}
            {/* Area fill */}
            <defs><linearGradient id={`indGrad_${indicatorId}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={clr} stopOpacity="0.15" /><stop offset="100%" stopColor={clr} stopOpacity="0" /></linearGradient></defs>
            <path d={areaPath} fill={`url(#indGrad_${indicatorId})`} />
            {/* Line */}
            <path d={linePath} fill="none" stroke={clr} strokeWidth="3" strokeLinecap="round" />
            {/* Data points */}
            {chartPts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill="#fff" stroke={clr} strokeWidth="2" />)}
            {/* X-axis labels */}
            {[0, Math.floor(n / 4), Math.floor(n / 2), Math.floor(3 * n / 4), n - 1].map((i, idx) => (
              <text key={idx} x={chartPts[i].x} y={H - 1} textAnchor="middle" fontSize="9" fill="#A09080" fontFamily="Quicksand" fontWeight="600">{chartPts[i].label}</text>
            ))}
            {/* Hover indicator */}
            {chartHover && <g>
              <line x1={chartHover.x} y1={PY} x2={chartHover.x} y2={H - PY} stroke={clr} strokeWidth="1" strokeDasharray="4,4" opacity=".4" />
              <circle cx={chartHover.x} cy={chartHover.y} r="6" fill={clr} stroke="#fff" strokeWidth="3" />
            </g>}
          </svg>
          {/* Hover tooltip on chart */}
          {chartHover && <div style={{ position: "absolute", top: 6, right: 6, background: "#fff", borderRadius: 12, padding: "6px 12px", fontFamily: "JetBrains Mono", fontSize: 18, boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}>
            <span style={{ color: "#33333480" }}>{chartHover.label}</span>
            <span style={{ marginLeft: 8, color: clr, fontWeight: 700 }}>{chartHover.v.toFixed(ind.unit === "%" ? 2 : 1)}{ind.unit}</span>
          </div>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: 11, color: "#A09080", display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 10, height: 2, background: clr, borderRadius: 1 }} />Price</span>
            <span style={{ fontSize: 11, color: "#A09080", display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 10, height: 1, borderTop: "2px dashed #C48830" }} />MA-5</span>
            <span style={{ fontSize: 11, color: "#A09080", display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 10, height: 1, borderTop: "2px dashed #5B8C5A" }} />S</span>
            <span style={{ fontSize: 11, color: "#A09080", display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 10, height: 1, borderTop: "2px dashed #EF5350" }} />R</span>
          </div>
          <div style={{ display: "flex", gap: 1, background: "#FFFDF5", borderRadius: 8, padding: 2 }}>
            {["1Y","2Y","5Y","10Y"].map(t => (
              <button key={t} onClick={() => { setPeriod(t); setChartHover(null); }}
                style={{ padding: "3px 8px", borderRadius: 6, border: "none", background: period === t ? "#fff" : "transparent", color: period === t ? "#C48830" : "#A09080", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Quicksand", boxShadow: period === t ? "0 1px 4px rgba(0,0,0,.06)" : "none", transition: "all .15s" }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Pattern Recognition */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8, border: "1px solid #C4883022" }}>
        <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 8, color: "#C48830" }}>Pattern Recognition</div>
        {analysis.patterns.length > 0 ? (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
            {analysis.patterns.map((p, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 6, background: sc[p.type] + "15", color: sc[p.type], border: `1px solid ${sc[p.type]}30` }}>{p.label}</span>
            ))}
          </div>
        ) : <div style={{ fontSize: 12, color: "#A09080", marginBottom: 8 }}>No significant patterns detected</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <div style={{ background: "#FAFAFA", borderRadius: 8, padding: "6px 8px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#33333480", textTransform: "uppercase" }}>Trend</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: analysis.trendDirection === "rising" ? "#5B8C5A" : analysis.trendDirection === "falling" ? "#EF5350" : "#A09080", textTransform: "capitalize" }}>{analysis.trendDirection}</div>
            <div style={{ fontSize: 11, color: "#A09080", fontFamily: "JetBrains Mono" }}>slope {analysis.slope >= 0 ? "+" : ""}{analysis.slope.toFixed(3)}/p</div>
          </div>
          <div style={{ background: "#FAFAFA", borderRadius: 8, padding: "6px 8px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#33333480", textTransform: "uppercase" }}>Momentum</div>
            <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "JetBrains Mono", color: analysis.roc5 >= 0 ? "#5B8C5A" : "#EF5350" }}>{analysis.roc5 >= 0 ? "+" : ""}{analysis.roc5.toFixed(1)}%</div>
            <div style={{ fontSize: 11, color: "#A09080" }}>5-period ROC</div>
          </div>
          <div style={{ background: "#FAFAFA", borderRadius: 8, padding: "6px 8px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#33333480", textTransform: "uppercase" }}>Streak</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: analysis.streak > 0 ? "#5B8C5A" : analysis.streak < 0 ? "#EF5350" : "#A09080" }}>{analysis.streak > 0 ? "+" : ""}{analysis.streak} periods</div>
            <div style={{ fontSize: 11, color: "#A09080" }}>{analysis.streak > 0 ? "consecutive rises" : analysis.streak < 0 ? "consecutive falls" : "no streak"}</div>
          </div>
          <div style={{ background: "#FAFAFA", borderRadius: 8, padding: "6px 8px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#33333480", textTransform: "uppercase" }}>Volatility</div>
            <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "JetBrains Mono", color: "#333334" }}>{analysis.volatility.toFixed(3)}</div>
            <div style={{ fontSize: 11, color: "#A09080" }}>avg chg: {analysis.avgChange.toFixed(3)}</div>
          </div>
        </div>
      </div>

      {/* Statistical Profile */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 8 }}>Statistical Profile</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {[
            { label: "Range Low", val: analysis.min.toFixed(2) + (ind.unit || ""), clr: "#5B8C5A" },
            { label: "Range High", val: analysis.max.toFixed(2) + (ind.unit || ""), clr: "#EF5350" },
            { label: "Range", val: analysis.range.toFixed(2), clr: "#333334" },
            { label: "Support", val: analysis.support.toFixed(2) + (ind.unit || ""), clr: "#5B8C5A" },
            { label: "Resistance", val: analysis.resistance.toFixed(2) + (ind.unit || ""), clr: "#EF5350" },
            { label: "Percentile", val: analysis.percentile + "th", clr: "#C48830" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#FAFAFA", borderRadius: 8, padding: "5px 7px", textAlign: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#33333480", textTransform: "uppercase", marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "JetBrains Mono", color: s.clr }}>{s.val}</div>
            </div>
          ))}
        </div>
        {/* Range bar */}
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#33333480", marginBottom: 3 }}>Position in Range</div>
          <div style={{ position: "relative", height: 8, background: "#F5F0E8", borderRadius: 4 }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${analysis.percentile}%`, background: `linear-gradient(90deg, #5B8C5A, ${analysis.percentile > 70 ? "#EF5350" : "#C48830"})`, borderRadius: 4 }} />
            <div style={{ position: "absolute", top: -2, left: `${analysis.percentile}%`, transform: "translateX(-50%)", width: 12, height: 12, borderRadius: "50%", background: "#fff", border: `2px solid ${clr}`, boxShadow: "0 1px 4px rgba(0,0,0,.15)" }} />
          </div>
        </div>
      </div>

      {/* About */}
      {details.desc && <div style={{ background: "#FFF8EE", borderRadius: 12, padding: "10px 12px", marginBottom: 8, border: "1px solid #C4883022" }}>
        <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: "#C48830", marginBottom: 4 }}>About {ind.name}</div>
        <div style={{ fontSize: 12, color: "#6B5A2E", lineHeight: 1.5 }}>{details.desc}</div>
        {details.release && <div style={{ fontSize: 11, color: "#A09080", marginTop: 4 }}>Next release: <span style={{ fontWeight: 800, color: "#C48830" }}>{details.release}</span></div>}
      </div>}

      {/* Impact Assets */}
      {details.impactAssets && <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 6 }}>Impacted Assets</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {details.impactAssets.map(t => (
            <span key={t} style={{ fontSize: 12, fontWeight: 800, fontFamily: "JetBrains Mono", padding: "4px 10px", borderRadius: 8, background: "#F5F0E8", color: "#5C4A1E", cursor: "pointer" }}>{t}</span>
          ))}
        </div>
      </div>}

      {/* Active Alerts */}
      {relatedAlerts.length > 0 && <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 6 }}>Active Alerts ({relatedAlerts.length})</div>
        {relatedAlerts.map((a, i) => {
          const sevCol = { critical: "#EF5350", warning: "#FFA726", info: "#42A5F5" };
          const sevBg = { critical: "#FFEBEE", warning: "#FFF3E0", info: "#E3F2FD" };
          return (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none" }}>
              <Icon name={a.icon} size={11} color={sevCol[a.severity]} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: "#33333480" }}>{a.summary}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 11, fontWeight: 800, background: sevBg[a.severity], color: sevCol[a.severity], padding: "2px 6px", borderRadius: 4 }}>{a.severity.toUpperCase()}</span>
                <div style={{ fontSize: 11, color: "#A09080", marginTop: 2 }}>{a.time} ago</div>
              </div>
            </div>
          );
        })}
      </div>}

      {/* Related News */}
      {relatedNews.length > 0 && <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 6 }}>Related News</div>
        {relatedNews.map((f, i) => (
          <div key={f.id} style={{ padding: "8px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 5px", borderRadius: 4, background: f.impact === "bullish" ? "#5B8C5A18" : f.impact === "bearish" ? "#EF535018" : "#F5F0E8", color: f.impact === "bullish" ? "#5B8C5A" : f.impact === "bearish" ? "#EF5350" : "#A09080", flexShrink: 0, marginTop: 1 }}>{f.cat}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#333334", lineHeight: 1.3, marginBottom: 2 }}>{f.headline}</div>
                <div style={{ fontSize: 11, color: "#33333480", lineHeight: 1.4 }}>{f.desc.slice(0, 100)}...</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: "#A09080", fontFamily: "JetBrains Mono" }}>{f.time}</div>
                <div style={{ fontSize: 12, fontWeight: 800, fontFamily: "JetBrains Mono", color: f.impact === "bullish" ? "#5B8C5A" : f.impact === "bearish" ? "#EF5350" : "#A09080" }}>{f.move}</div>
              </div>
            </div>
          </div>
        ))}
      </div>}

      {/* Related Indicators */}
      {details.related && details.related.length > 0 && <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 6 }}>Related Indicators</div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
          {details.related.map(rid => {
            const ri = macroDashboardData.find(m => m.id === rid);
            if (!ri) return null;
            const rClr = sc[ri.signal] || "#A09080";
            const rDelta = ri.value - ri.prev;
            return (
              <div key={rid} onClick={() => onSelectIndicator && onSelectIndicator(rid)} style={{ background: "#fff", borderRadius: 10, padding: "8px 12px", border: `1px solid ${rClr}22`, cursor: "pointer", flexShrink: 0, minWidth: 100 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#33333480", textTransform: "uppercase", marginBottom: 2 }}>{ri.name}</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 20, fontWeight: 900, color: "#333334" }}>{ri.value}{ri.unit}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: rClr }}>{rDelta >= 0 ? "▲" : "▼"} {ri.signal}</div>
              </div>
            );
          })}
        </div>
      </div>}
    </div>
  );
}

// ═══════════════ 3D PIE CHART (Interactive) ═══════════════
function PieChartInteractive({ arcs, slices, cx, cy, rx, ry, depth, darken, divColor, divLabel, diversScore, totalVal }) {
  const [activeIdx, setActiveIdx] = useState(null);
  const active = activeIdx !== null ? arcs[activeIdx] : null;
  const fmt = n => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // Sort arcs for 3D rendering: back slices first (by midAngle, bottom half behind)
  const sortedForSides = [...arcs.map((a, i) => ({ ...a, idx: i }))]
    .filter(a => { const mid = a.midAngle % 360; return mid > 0 && mid < 180; })
    .sort((a, b) => a.midAngle - b.midAngle);

  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "12px 10px", border: "1px solid #F0E6D0", marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Instrument Serif', serif" }}>Portfolio Allocation</div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: divColor }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: divColor }}>{divLabel}</span>
          <span style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 800, color: divColor }}>{diversScore.toFixed(0)}%</span>
        </div>
      </div>

      {/* 3D Pie */}
      <div style={{ position: "relative", width: "100%", maxWidth: 260, margin: "0 auto" }}>
        <svg viewBox="0 0 200 180" style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <filter id="pie3d-shadow" x="-10%" y="-10%" width="130%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#00000015" />
            </filter>
          </defs>
          {/* 3D sides (render bottom-visible slices back-to-front) */}
          {sortedForSides.map((a) => (
            <path key={"side-" + a.idx} d={a.sideD} fill={darken(a.color, 50)} opacity={activeIdx !== null && activeIdx !== a.idx ? 0.4 : 0.85} style={{ transition: "opacity .2s" }} />
          ))}
          {/* Top faces */}
          <g filter="url(#pie3d-shadow)">
            {arcs.map((a, i) => {
              const isActive = activeIdx === i;
              const pullX = isActive ? 6 * Math.cos(a.midRad) : 0;
              const pullY = isActive ? 6 * Math.sin(a.midRad) : 0;
              return (
                <path key={i} d={a.topD} fill={a.color} stroke="#fff" strokeWidth="1"
                  opacity={activeIdx !== null && !isActive ? 0.5 : 1}
                  transform={`translate(${pullX},${pullY})`}
                  style={{ cursor: "pointer", transition: "opacity .2s, transform .25s ease" }}
                  onClick={() => setActiveIdx(isActive ? null : i)}
                  onMouseEnter={() => setActiveIdx(i)}
                  onMouseLeave={() => setActiveIdx(null)} />
              );
            })}
          </g>
          {/* Center donut hole */}
          <ellipse cx={cx} cy={cy} rx={30} ry={18} fill="#fff" />
          {/* Center label */}
          {active ? (
            <>
              <text x={cx} y={cy - 4} textAnchor="middle" style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 900, fill: active.color }}>{active.pct.toFixed(1)}%</text>
              <text x={cx} y={cy + 8} textAnchor="middle" style={{ fontFamily: "Quicksand", fontSize: 11, fontWeight: 700, fill: "#A09080" }}>{active.ticker}</text>
            </>
          ) : (
            <>
              <text x={cx} y={cy - 3} textAnchor="middle" style={{ fontFamily: "JetBrains Mono", fontSize: 18, fontWeight: 900, fill: "#333334" }}>{slices.length}</text>
              <text x={cx} y={cy + 8} textAnchor="middle" style={{ fontFamily: "Quicksand", fontSize: 11, fontWeight: 700, fill: "#A09080" }}>stocks</text>
            </>
          )}
        </svg>
      </div>

      {/* Tooltip card on select */}
      {active && (
        <div style={{ background: "#FFFDF5", borderRadius: 10, padding: "8px 10px", marginTop: 4, border: `1.5px solid ${active.color}33`, animation: "popIn .2s ease both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: active.color }} />
              <span style={{ fontWeight: 800, fontSize: 15, fontFamily: "'Instrument Serif', serif" }}>{active.ticker}</span>
              <span style={{ fontSize: 12, color: "#A09080" }}>{active.name}</span>
            </div>
            <span style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 900, color: active.color }}>{active.pct.toFixed(1)}%</span>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
            <div><div style={{ fontSize: 11, color: "#A09080", fontWeight: 700 }}>VALUE</div><div style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 800 }}>{fmt(active.value)}</div></div>
            <div><div style={{ fontSize: 11, color: "#A09080", fontWeight: 700 }}>OF TOTAL</div><div style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 800 }}>{fmt(totalVal)}</div></div>
          </div>
        </div>
      )}

      {/* Legend grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 10px", marginTop: 8 }}>
        {arcs.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 4px", borderRadius: 6, cursor: "pointer", background: activeIdx === i ? "#FFFDF5" : "transparent", transition: "background .15s" }}
            onClick={() => setActiveIdx(activeIdx === i ? null : i)}
            onMouseEnter={() => setActiveIdx(i)} onMouseLeave={() => setActiveIdx(null)}>
            <div style={{ width: 7, height: 7, borderRadius: 2, background: a.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#333334", flex: 1 }}>{a.ticker}</span>
            <span style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 800, color: activeIdx === i ? a.color : "#333334", transition: "color .15s" }}>{a.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════ MACRO DASHBOARD PAGE ═══════════════
function MacroDashboardPage({ onGoRiskLab, onNavigate, regime, alerts = [], onSelectIndicator }) {
  const [alertFilter, setAlertFilter] = useState("all");
  const sCol = { critical: "#EF5350", warning: "#FFA726", info: "#42A5F5" };
  const sBg = { critical: "#FFEBEE", warning: "#FFF3E0", info: "#E3F2FD" };
  const filteredAlerts = alertFilter === "all" ? alerts : alerts.filter(a => a.severity === alertFilter);

  // macroData is defined at module scope (macroDashboardData)

  const sourceColors = { BLS: "#B7950B", FRED: "#1A5276", BEA: "#6C3483" };

  return (
    <div>
      {/* ── Header with Back Button ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, animation: "fadeUp .3s ease both" }}>
        <button onClick={() => onNavigate("dashboard")} style={{ background: "#fff", borderRadius: 12, width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, border: "1.5px solid #F0E6D0", flexShrink: 0 }}>←</button>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>Macro Dashboard</h1>
          <p style={{ color: "#33333480", fontSize: 14, marginTop: 1 }}>FRED + BEA + BLS economic data & regime analysis</p>
        </div>
      </div>

      {/* ── Full Regime Banner ── */}
      <div style={{ background: regime.bg, border: `2px solid ${regime.color}33`, borderRadius: 14, padding: "12px 14px", marginBottom: 8, animation: "fadeUp .4s ease both" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <Icon name={regime.icon} size={14} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#33333480", textTransform: "uppercase", letterSpacing: 1 }}>Current Macro Regime</div>
            <div style={{ fontSize: 21, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: regime.color }}>{regime.name}</div>
          </div>
          <div style={{ background: "#fff", borderRadius: 10, padding: "6px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#33333480", fontWeight: 700 }}>Confidence</div>
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 20, fontWeight: 800, color: regime.color }}>{regime.confidence}%</div>
          </div>
        </div>
        <div style={{ fontSize: 14, color: "#6B5A2E", lineHeight: 1.5, marginBottom: 8 }}>{regime.desc}</div>
        <div style={{ fontSize: 14, color: "#8A7040", lineHeight: 1.5, background: "#fff", borderRadius: 10, padding: "7px 10px" }}>
          <span style={{ fontWeight: 800, color: regime.color }}>Playbook:</span> {regime.playbook}
        </div>
      </div>

      {/* ── Key Indicators Grid ── */}
      <div style={{ marginBottom: 8, animation: "fadeUp .4s ease .1s both" }}>
        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 6 }}>Key Indicators</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {macroDashboardData.map(ind => {
            const sc = { bullish: "#5B8C5A", bearish: "#EF5350", neutral: "#A09080" };
            const bg = { bullish: "#F0F7F0", bearish: "#FFEBEE", neutral: "#fff" };
            const delta = ind.value - ind.prev;
            const clr = sc[ind.signal];
            const pts = ind.periods?.["1Y"]?.data || [];
            const spMin = Math.min(...pts);
            const spMax = Math.max(...pts);
            const spRange = spMax - spMin || 1;
            const n = pts.length - 1;
            const sparkPath = pts.map((v, i) => `${i === 0 ? "M" : "L"}${(i / n) * 100},${28 - ((v - spMin) / spRange) * 24}`).join(" ");
            const areaPath = sparkPath + ` L100,30 L0,30 Z`;
            const isPercent = ind.unit === "%" || ind.unit === "bp";
            const srcClr = sourceColors[ind.source] || "#A09080";
            return (
              <div key={ind.id} onClick={() => onSelectIndicator && onSelectIndicator(ind.id)} style={{ background: bg[ind.signal], borderRadius: 10, padding: "8px 10px", border: `1px solid ${clr}22`, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: "#33333480", textTransform: "uppercase", letterSpacing: .5, maxWidth: "55%" }}>{ind.name}</div>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 21, fontWeight: 900, color: "#333334", lineHeight: 1 }}>{ind.value}{ind.unit}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 700, color: clr }}>
                      {delta >= 0 ? "▲" : "▼"}{Math.abs(delta).toFixed(isPercent ? 2 : 1)}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: clr, textTransform: "uppercase" }}>{ind.signal}</span>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: srcClr, background: srcClr + "15", padding: "1px 5px", borderRadius: 4 }}>{ind.source}</span>
                </div>
                <svg viewBox="0 0 100 30" style={{ width: "100%", height: 28, display: "block" }} preserveAspectRatio="none">
                  <defs><linearGradient id={`spk-${ind.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={clr} stopOpacity="0.2"/><stop offset="100%" stopColor={clr} stopOpacity="0"/></linearGradient></defs>
                  <path d={areaPath} fill={`url(#spk-${ind.id})`} />
                  <path d={sparkPath} fill="none" stroke={clr} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="100" cy={28 - ((pts[n] - spMin) / spRange) * 24} r="2" fill={clr} />
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                  <span style={{ fontSize: 9.5, color: "#A09080" }}>{ind.freq}</span>
                  <span style={{ fontSize: 9.5, color: "#A09080" }}>Released: {ind.release}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Regime Cycle ── */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8, animation: "fadeUp .4s ease .25s both" }}>
        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 8 }}>Regime Cycle</div>
        {[
          { regime: "Goldilocks", duration: 55, maxDays: 90, color: "#5B8C5A", icon: "leaf", label: "Growth + Low Inflation", period: "Nov 20 – Jan 14" },
          { regime: "Reflation", duration: 23, maxDays: 90, color: "#FFA726", icon: "fire", label: "Growth + Rising Prices", period: "Jan 15 – Present", active: true },
          { regime: "Stagflation", duration: 53, maxDays: 90, color: "#EF5350", icon: "warning", label: "Slow Growth + Inflation", period: "Aug 12 – Oct 4" },
          { regime: "Risk-Off", duration: 45, maxDays: 90, color: "#42A5F5", icon: "shield", label: "Flight to Safety", period: "Oct 5 – Nov 19" },
        ].map((r, i) => {
          const pct = r.duration / r.maxDays;
          const circumference = 2 * Math.PI * 16;
          const dashOffset = circumference * (1 - pct);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none", opacity: r.active ? 1 : 0.7 }}>
              <div style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
                <svg viewBox="0 0 40 40" style={{ width: 40, height: 40, transform: "rotate(-90deg)" }}>
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#F0E6D0" strokeWidth="3" />
                  <circle cx="20" cy="20" r="16" fill="none" stroke={r.color} strokeWidth="3"
                    strokeDasharray={circumference} strokeDashoffset={dashOffset}
                    strokeLinecap="round" style={r.active ? { animation: "pulse 2s infinite" } : {}} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 900, color: r.color, lineHeight: 1 }}>{r.duration}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#33333480", marginTop: 1 }}>days</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                  <Icon name={r.icon} size={11} color={r.color} />
                  <span style={{ fontSize: 17, fontWeight: 800, color: r.color, fontFamily: "'Instrument Serif', serif" }}>{r.regime}</span>
                  {r.active && <span style={{ fontSize: 9, background: r.color, color: "#fff", padding: "1px 5px", borderRadius: 3, fontWeight: 800, letterSpacing: 0.5 }}>ACTIVE</span>}
                </div>
                <div style={{ fontSize: 12, color: "#33333480" }}>{r.label}</div>
                <div style={{ fontSize: 11, color: "#A09080", marginTop: 1 }}>{r.period}</div>
              </div>
              {i < 3 && <div style={{ position: "absolute", right: 16, marginTop: 38, color: "#D0C8B8", fontSize: 15 }}></div>}
            </div>
          );
        })}
      </div>

      {/* ── What This Means For You ── */}
      <div style={{ background: regime.bg, border: `1.5px solid ${regime.color}33`, borderRadius: 12, padding: 10, marginBottom: 8, animation: "fadeUp .4s ease .3s both" }}>
        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: regime.color, marginBottom: 6 }}>Portfolio Impact</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {[
            { label: "Favors", items: "Energy, Gold, Value, Commodities", clr: "#5B8C5A" },
            { label: "Avoids", items: "Long Duration, Growth, REITs, Bonds", clr: "#EF5350" },
            { label: "Hedge With", items: "TIPS, Gold Futures, Put Spreads", clr: "#42A5F5" },
            { label: "Watch For", items: "CPI prints, Fed minutes, Oil supply", clr: "#FFA726" },
          ].map((item, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 8, padding: "6px 8px" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: item.clr, textTransform: "uppercase", marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: "#6B5A2E", lineHeight: 1.3 }}>{item.items}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Macro Alerts ── */}
      {alerts.length > 0 && <div style={{ marginBottom: 8, animation: "fadeUp .4s ease .35s both" }}>
        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 6 }}>Macro Alerts</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {[{ k: "all", l: "All", n: alerts.length, c: "#5C4A1E", bg: "#fff" }, { k: "critical", l: "Critical", n: alerts.filter(a => a.severity === "critical").length, c: "#EF5350", bg: "#FFEBEE" }, { k: "warning", l: "Warning", n: alerts.filter(a => a.severity === "warning").length, c: "#FFA726", bg: "#FFF3E0" }, { k: "info", l: "Info", n: alerts.filter(a => a.severity === "info").length, c: "#42A5F5", bg: "#E3F2FD" }].map(f => (
            <button key={f.k} onClick={() => setAlertFilter(f.k)} style={{ flex: "1 1 60px", padding: "8px 10px", borderRadius: 12, border: "1.5px solid " + (alertFilter === f.k ? f.c : "transparent"), background: f.bg, cursor: "pointer", textAlign: "left" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: f.c }}>{f.l}</div>
              <div style={{ fontSize: 17, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: f.c }}>{f.n}</div>
            </button>
          ))}
        </div>
        {filteredAlerts.map((a, i) => (
          <div key={a.id} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8, borderLeft: "4px solid " + sCol[a.severity], animation: "fadeUp .4s ease " + (i * .05) + "s both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <Icon name={a.icon} size={11} />
              <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 15, fontFamily: "'Instrument Serif', serif" }}>{a.title}</div></div>
              <span style={{ fontSize: 11, fontWeight: 800, background: sBg[a.severity], color: sCol[a.severity], padding: "2px 8px", borderRadius: 8 }}>{a.severity.toUpperCase()}</span>
              <span style={{ fontSize: 14, color: "#33333480" }}>{a.time} ago</span>
            </div>
            <div style={{ fontSize: 14, color: "#8A7040", lineHeight: 1.5 }}>{a.summary}</div>
          </div>
        ))}
      </div>}

      <button onClick={onGoRiskLab} style={{ width: "100%", padding: 11, background: "linear-gradient(135deg,#C48830,#D4A03C)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 900, cursor: "pointer", fontFamily: "'Instrument Serif', serif" }}>Open Risk Lab →</button>
    </div>
  );
}

function RiskLabPage({ onOpenMacro, hedges, regime }) {
  const [dismissedHedges, setDismissedHedges] = useState([]);
  const filteredHedges = hedges.filter(h => !dismissedHedges.includes(h.id));

  return (
    <div>
      <div style={{ marginBottom: 10, animation: "fadeUp .3s ease both" }}>
        <h1 style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>Risk Lab</h1>
        <p style={{ color: "#33333480", fontSize: 15, marginTop: 3 }}>Stress testing, hedging & portfolio risk analysis</p>
      </div>

      {/* ── 1. Regime Banner (compact, clickable) ── */}
      <div onClick={onOpenMacro} style={{ background: regime.bg, border: `1.5px solid ${regime.color}33`, borderRadius: 12, padding: "8px 12px", marginBottom: 8, animation: "fadeUp .4s ease both", cursor: "pointer", transition: "all .3s" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = regime.color} onMouseLeave={e => e.currentTarget.style.borderColor = regime.color + "33"}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name={regime.icon} size={11} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#33333480", textTransform: "uppercase", letterSpacing: .8 }}>Regime</div>
              <div style={{ fontSize: 17, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: regime.color }}>{regime.name} <span style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 700, opacity: .7 }}>{regime.confidence}%</span></div>
            </div>
          </div>
          <span style={{ fontSize: 14, color: regime.color, fontWeight: 800 }}>Details →</span>
        </div>
      </div>

      {/* ── 2. Hedge Recommendations ── */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8, animation: "fadeUp .4s ease .1s both" }}>
        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 7 }}>Hedge Recommendations</div>
        {filteredHedges.length === 0 && <div style={{ textAlign: "center", padding: "20px 0", color: "#33333480", fontSize: 14 }}>All hedges executed or expired ✓</div>}
        {filteredHedges.map((h, i) => {
          const aCol = { BUY: "#C48830", SELL: "#EF5350", ADD: "#C48830", REDUCE: "#EF5350", ROTATE: "#42A5F5" };
          const expPct = h.totalDuration > 0 ? ((h.totalDuration - (h.expiresIn * (h.expiresUnit === "hrs" ? 1 : 24))) / h.totalDuration) * 100 : 0;
          const circumference = 2 * Math.PI * 14;
          const strokeDashoffset = circumference * (1 - expPct / 100);
          return (
            <div key={h.id} style={{ padding: "10px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none", animation: "fadeUp .3s ease " + (i * .04) + "s both" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                {/* Expiration Circle */}
                <div style={{ flexShrink: 0, position: "relative", width: 36, height: 36 }}>
                  <svg width="36" height="36" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#F0E6D0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#A09080" strokeWidth="3"
                      strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 900, color: "#5C4A1E", lineHeight: 1 }}>{h.expiresIn}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#33333480", lineHeight: 1 }}>{h.expiresUnit}</div>
                  </div>
                </div>
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 3, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, fontWeight: 900, padding: "1px 6px", borderRadius: 4, background: aCol[h.action] || "#A09080", color: "#fff" }}>{h.action}</span>
                    <span style={{ fontWeight: 800, fontSize: 14, fontFamily: "'Instrument Serif', serif" }}>{h.instrument}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#6B5A2E", lineHeight: 1.3, marginBottom: 4 }}>{h.desc}</div>
                  <div style={{ display: "flex", gap: 4, fontSize: 12, color: "#33333480", flexWrap: "wrap" }}>
                    <span>{h.cost}</span>
                    <span>{h.impact}</span>
                  </div>
                </div>
                {/* Action buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 3, flexShrink: 0 }}>
                  <button style={{ background: "linear-gradient(135deg,#C48830,#D4A03C)", color: "#fff", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Execute</button>
                  <button onClick={() => setDismissedHedges(prev => [...prev, h.id])} style={{ background: "#F0E6D0", color: "#33333480", border: "none", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>Dismiss</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Portfolio Risk Metrics ── */}
      <div style={{ marginBottom: 8, animation: "fadeUp .4s ease .2s both" }}>
        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 7 }}>Portfolio Risk Metrics</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {[
            { label: "Sharpe", value: portfolioRisk.sharpe.toFixed(2), good: portfolioRisk.sharpe > 1 },
            { label: "Beta", value: portfolioRisk.beta.toFixed(2), good: portfolioRisk.beta < 1.3 },
            { label: "Ann. Vol", value: portfolioRisk.volatility.toFixed(1) + "%", good: portfolioRisk.volatility < 20 },
            { label: "Max DD", value: portfolioRisk.maxDrawdown.toFixed(1) + "%", good: portfolioRisk.maxDrawdown > -15 },
            { label: "VaR 95%", value: fmtS(portfolioRisk.var95), good: false },
            { label: "Calmar", value: portfolioRisk.calmar.toFixed(2), good: portfolioRisk.calmar > 1 },
          ].map((m, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 8, padding: "6px 8px", border: "1px solid #F0E6D0" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#33333480" }}>{m.label}</div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 800, color: m.good ? "#5B8C5A" : "#EF5350" }}>{m.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, padding: "6px 8px", background: "#fff", borderRadius: 8, border: "1px solid #F0E6D0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif" }}>Concentration</div><div style={{ fontSize: 12, color: "#8A7040" }}>Top: {portfolioRisk.topHolding.ticker} ({portfolioRisk.topHolding.pct}%)</div></div>
          <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700, color: "#EF5350" }}>{portfolioRisk.sectorConcentration}%</div>
        </div>
      </div>

      {/* ── 4. Basket Correlations ── */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8, animation: "fadeUp .4s ease .3s both" }}>
        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 7 }}>Basket Correlations</div>
        <div className="correlation-scroll mobile-scroll-x" style={{ display: "grid", gridTemplateColumns: "80px repeat(" + myBaskets.length + ", 1fr)", gap: 4, fontSize: 14 }}>
          <div />
          {myBaskets.map(b => <div key={b.id} style={{ textAlign: "center", fontWeight: 800, padding: 4, fontSize: 12 }}><Icon name={b.icon} size={8} /> {b.name.split(" ")[0]}</div>)}
          {myBaskets.map((b, ri) => (
            <React.Fragment key={b.id}>
              <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 3, padding: "3px 0" }}><Icon name={b.icon} size={10} /><span style={{ fontSize: 12 }}>{b.name.split(" ")[0]}</span></div>
              {basketCorrelations[ri] && basketCorrelations[ri].map((c, ci) => {
                const abs = Math.abs(c);
                const bg = ri === ci ? "#FFF5E6" : c > 0.5 ? "rgba(232,116,97," + (abs * 0.4) + ")" : c < -0.05 ? "rgba(91,155,213," + (abs * 0.6) + ")" : "rgba(107,155,110," + (abs * 0.3) + ")";
                return <div key={ci} style={{ textAlign: "center", padding: "8px 2px", borderRadius: 6, background: bg, fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 15, color: ri === ci ? "#A09080" : "#5C4A1E" }}>{c.toFixed(2)}</div>;
              })}
            </React.Fragment>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 14, color: "#8A7040", lineHeight: 1.5 }}>
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "rgba(232,116,97,0.35)", marginRight: 3, verticalAlign: "middle" }} /> High correlation
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "rgba(91,155,213,0.35)", marginRight: 3, marginLeft: 8, verticalAlign: "middle" }} /> Negative (hedge)
        </div>

        {/* Factor Exposure */}
        <div style={{ marginTop: 12, borderTop: "1px solid #33333420", paddingTop: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 6 }}>Factor Exposure</div>
          {factorExposures.map((f, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{f.factor}</span>
                <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", color: "#C48830" }}>{(f.exposure * 100).toFixed(0)}% vs {(f.benchmark * 100).toFixed(0)}%</span>
              </div>
              <div style={{ height: 4, background: "#FFF5E6", borderRadius: 2, position: "relative" }}>
                <div style={{ position: "absolute", height: "100%", width: (f.exposure * 100) + "%", background: "#C48830", borderRadius: 2 }} />
                <div style={{ position: "absolute", left: (f.benchmark * 100) + "%", top: -1, width: 2, height: 6, background: "#5C4A1E", borderRadius: 1 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════ STRESS TEST PAGE ═══════════════
function StressTestPage() {
  const [view, setView] = useState("scenarios");
  const [stressId, setStressId] = useState(null);
  const [monteCarloRun, setMonteCarloRun] = useState(false);
  const [customShocks, setCustomShocks] = useState({ spx: 0, rates: 0, vix: 0, oil: 0, dxy: 0, gold: 0 });
  const [sensitivity, setSensitivity] = useState("rates");

  const totalValue = myBaskets.reduce((s, b) => s + b.value, 0);

  // ── Historical Replay Scenarios (Bloomberg PORT-style) ──
  const historicalReplays = [
    { id: "gfc08", name: "2008 Global Financial Crisis", period: "Sep 2008 – Mar 2009", icon: "bank", color: "#EF5350",
      shocks: { spx: -56.8, nasdaq: -55.5, bonds: 5.2, gold: 25.5, vix: 80.9, oil: -71.4, dxy: 12.8, reits: -68.3, em: -54.2, hy: -26.4 },
      desc: "Lehman collapse triggered global credit freeze. Interbank lending froze. Mark-to-market losses cascaded through leveraged balance sheets. VIX hit 89.5.", duration: "6 months" },
    { id: "covid20", name: "2020 COVID-19 Crash", period: "Feb – Mar 2020", icon: "syringe", color: "#42A5F5",
      shocks: { spx: -33.9, nasdaq: -30.1, bonds: 8.9, gold: 3.4, vix: 82.7, oil: -65.2, dxy: 8.2, reits: -41.2, em: -31.8, hy: -12.6 },
      desc: "Fastest 30%+ selloff in history. Broad liquidation across all assets. Fed cut to zero and launched unlimited QE within 2 weeks.", duration: "23 trading days" },
    { id: "dotcom", name: "2000 Dot-Com Bust", period: "Mar 2000 – Oct 2002", icon: "laptop", color: "#FFA726",
      shocks: { spx: -49.1, nasdaq: -78.4, bonds: 38.6, gold: 12.4, vix: 43.7, oil: -48.8, dxy: 18.2, reits: 22.4, em: -42.6, hy: -8.2 },
      desc: "Tech valuation bubble burst. Nasdaq lost 78%. Rotation to bonds and value. Earnings didn't support prices — PE ratios compressed violently.", duration: "30 months" },
    { id: "rate22", name: "2022 Rate Shock", period: "Jan – Oct 2022", icon: "chart-up", color: "#C48830",
      shocks: { spx: -25.4, nasdaq: -33.1, bonds: -17.8, gold: -3.2, vix: 36.5, oil: 42.6, dxy: 16.8, reits: -28.7, em: -22.4, hy: -14.8 },
      desc: "Most aggressive Fed tightening since Volcker. Both stocks AND bonds fell — 60/40 had worst year since 1937. No safe haven except cash and energy.", duration: "10 months" },
    { id: "stagflation70s", name: "1970s Stagflation", period: "1973 – 1975", icon: "oil-barrel", color: "#7E57C2",
      shocks: { spx: -48.2, nasdaq: -59.9, bonds: -12.4, gold: 186.0, vix: null, oil: 289.0, dxy: -22.6, reits: -42.1, em: -38.4, hy: -16.2 },
      desc: "OPEC embargo quadrupled oil prices. Wage-price spiral drove CPI above 11%. Fed raised rates to 13%. Only gold and commodities survived.", duration: "21 months" },
    { id: "fed26", name: "2026 Fed Severely Adverse", period: "Hypothetical", icon: "warning", color: "#E57373",
      shocks: { spx: -54.0, nasdaq: -58.2, bonds: 14.6, gold: 32.0, vix: 72.0, oil: -44.0, dxy: -8.4, reits: -52.0, em: -48.2, hy: -22.8 },
      desc: "Based on the Federal Reserve's 2026 stress test scenario: equity prices fall ~54%, VIX spikes to 72, corporate spreads widen to 570bp, unemployment rises to 10%.", duration: "3 quarters" },
  ];

  // ── VaR & CVaR Analytics ──
  const varMetrics = {
    var95_1d: -1.82, var99_1d: -3.14, var95_10d: -5.76, var99_10d: -9.93,
    cvar95: -2.68, cvar99: -4.52, maxDD: -16.2, avgDD: -6.8,
    portfolioVol: 17.4, beta: 0.94, sharpe: 1.08, sortino: 1.34,
    skew: -0.42, kurtosis: 4.18,
  };

  // ── Monte Carlo Simulation Results ──
  const mcResults = {
    simulations: 10000, horizon: "1 Year", confidence: 95,
    percentiles: [
      { p: "1st", val: -38.4, color: "#EF5350" }, { p: "5th", val: -24.2, color: "#EF5350" },
      { p: "10th", val: -16.8, color: "#FFA726" }, { p: "25th", val: -6.2, color: "#FFA726" },
      { p: "50th (Median)", val: 8.4, color: "#5B8C5A" }, { p: "75th", val: 18.6, color: "#5B8C5A" },
      { p: "90th", val: 28.4, color: "#42A5F5" }, { p: "95th", val: 34.8, color: "#42A5F5" },
      { p: "99th", val: 48.2, color: "#7E57C2" },
    ],
    expectedReturn: 9.2, expectedVol: 18.6, probLoss: 34.2, probGain20: 42.8,
  };

  // ── Sensitivity Grid (Factor Analysis) ──
  const sensFactors = {
    rates: { label: "Interest Rates", icon: "bank", unit: "bp", steps: [-100, -50, -25, 0, 25, 50, 100, 200],
      impacts: [8.4, 4.6, 2.4, 0, -2.1, -4.8, -9.2, -16.4] },
    vix: { label: "Volatility (VIX)", icon: "wave", unit: "pts", steps: [-10, -5, 0, 5, 10, 20, 30, 50],
      impacts: [4.2, 2.1, 0, -1.8, -4.2, -9.6, -14.8, -22.4] },
    oil: { label: "Crude Oil", icon: "oil-barrel", unit: "%", steps: [-50, -30, -15, 0, 15, 30, 50, 100],
      impacts: [-4.8, -2.6, -1.2, 0, 2.4, 4.2, 6.8, 12.6] },
    dxy: { label: "US Dollar (DXY)", icon: "money", unit: "%", steps: [-15, -10, -5, 0, 5, 10, 15, 20],
      impacts: [3.6, 2.2, 1.2, 0, -0.8, -2.4, -4.2, -6.8] },
    gold: { label: "Gold", icon: "sparkle", unit: "%", steps: [-30, -20, -10, 0, 10, 20, 30, 50],
      impacts: [-2.4, -1.6, -0.8, 0, 1.4, 2.6, 3.8, 5.4] },
    credit: { label: "Credit Spreads (HY)", icon: "warning", unit: "bp", steps: [-100, -50, 0, 50, 100, 200, 300, 500],
      impacts: [3.8, 2.2, 0, -1.8, -4.2, -8.6, -12.4, -18.2] },
  };
  const sensData = sensFactors[sensitivity];

  // ── Custom Scenario Builder ──
  const customPortfolioImpact = (() => {
    const w = { spx: 0.40, rates: -0.08, vix: -0.12, oil: 0.15, dxy: -0.06, gold: 0.10 };
    return Object.entries(customShocks).reduce((sum, [k, v]) => sum + (v * (w[k] || 0)), 0);
  })();

  const activeReplay = historicalReplays.find(r => r.id === stressId);

  const views = [
    { id: "scenarios", label: "Historical Replay", icon: "scroll" },
    { id: "montecarlo", label: "Monte Carlo", icon: "chart-bar" },
    { id: "sensitivity", label: "Sensitivity", icon: "wave" },
    { id: "var", label: "VaR / CVaR", icon: "warning" },
    { id: "custom", label: "Custom", icon: "flask" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 8, animation: "fadeUp .3s ease both" }}>
        <h1 style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>Portfolio Stress Testing</h1>
        <p style={{ color: "#33333480", fontSize: 15, marginTop: 3 }}>Institutional-grade scenario analysis, Monte Carlo simulation & risk analytics</p>
      </div>

      {/* ── Tool Selector ── */}
      <div className="no-scrollbar" style={{ display: "flex", gap: 3, marginBottom: 8, overflowX: "auto" }}>
        {views.map(v => (
          <button key={v.id} onClick={() => setView(v.id)}
            style={{ display: "flex", alignItems: "center", gap: 3, padding: "5px 8px", borderRadius: 8, border: `1.5px solid ${view === v.id ? "#C48830" : "#F0E6D0"}`, background: view === v.id ? "#C48830" : "#fff", color: view === v.id ? "#fff" : "#A09080", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Quicksand", whiteSpace: "nowrap", transition: "all .2s" }}>
            <Icon name={v.icon} size={8} color={view === v.id ? "#fff" : "#A09080"} />{v.label}
          </button>
        ))}
      </div>

      {/* ════════ HISTORICAL REPLAY (Bloomberg PORT-style) ════════ */}
      {view === "scenarios" && <div style={{ animation: "fadeUp .3s ease both" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(90px,1fr))", gap: 6, marginBottom: 8 }}>
          {historicalReplays.map(r => (
            <button key={r.id} onClick={() => setStressId(stressId === r.id ? null : r.id)}
              style={{ background: stressId === r.id ? r.color + "15" : "#fff", border: `1.5px solid ${stressId === r.id ? r.color : "#F0E6D0"}`, borderRadius: 12, padding: "8px", cursor: "pointer", textAlign: "left", transition: "all .2s" }}>
              <Icon name={r.icon} size={12} color={stressId === r.id ? r.color : "#A09080"} />
              <div style={{ fontSize: 12, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginTop: 4, lineHeight: 1.2 }}>{r.name.split(" ").slice(0,2).join(" ")}</div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 700, color: "#EF5350", marginTop: 3 }}>{r.shocks.spx > 0 ? "+" : ""}{r.shocks.spx}%</div>
              <div style={{ fontSize: 11, color: "#33333480" }}>S&P 500</div>
            </button>
          ))}
        </div>

        {activeReplay && <div style={{ animation: "fadeUp .3s ease both" }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 12, border: `1.5px solid ${activeReplay.color}30`, marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: activeReplay.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={activeReplay.icon} size={14} color={activeReplay.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>{activeReplay.name}</div>
                <div style={{ fontSize: 12, color: "#33333480" }}>{activeReplay.period} · {activeReplay.duration}</div>
              </div>
            </div>
            <div style={{ fontSize: 14, color: "#4A4030", lineHeight: 1.6, marginBottom: 10, fontFamily: "Quicksand" }}>{activeReplay.desc}</div>

            {/* Asset Class Impact Grid */}
            <div style={{ fontSize: 12, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 6 }}>Asset Class Impacts</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(85px,1fr))", gap: 4, marginBottom: 10 }}>
              {[
                { key: "spx", label: "S&P 500", icon: "chart-bar" }, { key: "nasdaq", label: "Nasdaq", icon: "laptop" },
                { key: "bonds", label: "US Treasuries", icon: "bank" }, { key: "gold", label: "Gold", icon: "sparkle" },
                { key: "oil", label: "Crude Oil", icon: "oil-barrel" }, { key: "dxy", label: "US Dollar", icon: "money" },
                { key: "reits", label: "REITs", icon: "home" }, { key: "em", label: "EM Equities", icon: "globe" },
                { key: "hy", label: "High Yield", icon: "warning" }, { key: "vix", label: "VIX", icon: "wave" },
              ].map(a => {
                const v = activeReplay.shocks[a.key];
                if (v === null || v === undefined) return null;
                const isVix = a.key === "vix";
                const col = isVix ? (v > 30 ? "#EF5350" : "#FFA726") : (v >= 0 ? "#5B8C5A" : "#EF5350");
                return (
                  <div key={a.key} style={{ background: col + "0A", border: `1px solid ${col}22`, borderRadius: 10, padding: "6px 8px", textAlign: "center" }}>
                    <Icon name={a.icon} size={10} color={col} />
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#33333480", marginTop: 2 }}>{a.label}</div>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 800, color: col, marginTop: 2 }}>
                      {isVix ? v.toFixed(1) : (v >= 0 ? "+" : "") + v.toFixed(1) + "%"}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Portfolio Impact */}
            <div style={{ fontSize: 12, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 6 }}>Your Portfolio Under This Scenario</div>
            {myBaskets.map(b => {
              const impact = stressScenarios.find(s => s.id === (stressId === "gfc08" ? "recession" : stressId === "covid20" ? "recession" : stressId === "rate22" ? "rate_hike" : stressId === "dotcom" ? "tech_crash" : stressId === "fed26" ? "recession" : "recession"))?.impacts[b.id] || -5.0;
              const scaledImpact = impact * (Math.abs(activeReplay.shocks.spx) / 30);
              const dollarImpact = Math.round(b.value * scaledImpact / 100);
              return (
                <div key={b.id} style={{ background: scaledImpact >= 0 ? "#EDF5ED" : "#FFEBEE", borderRadius: 10, padding: "6px 10px", border: `1px solid ${scaledImpact >= 0 ? "#5B8C5A" : "#EF5350"}22`, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <Icon name={b.icon} size={10} />
                    <span style={{ fontWeight: 800, fontSize: 14, fontFamily: "'Instrument Serif', serif" }}>{b.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700, color: scaledImpact >= 0 ? "#5B8C5A" : "#EF5350" }}>{scaledImpact >= 0 ? "+" : ""}{scaledImpact.toFixed(1)}%</span>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 600, color: "#8A7040" }}>{fmtS(dollarImpact)}</span>
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: 4, padding: "8px 10px", background: "#FFEBEE", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 800, fontSize: 14, fontFamily: "'Instrument Serif', serif" }}>Total Portfolio Impact</span>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700, color: "#EF5350" }}>
                {((activeReplay.shocks.spx * 0.4 + (activeReplay.shocks.bonds || 0) * 0.15 + (activeReplay.shocks.gold || 0) * 0.1 + (activeReplay.shocks.oil || 0) * 0.08) ).toFixed(1)}% ({fmtS(Math.round(totalValue * (activeReplay.shocks.spx * 0.4 + (activeReplay.shocks.bonds || 0) * 0.15 + (activeReplay.shocks.gold || 0) * 0.1) / 100))})
              </span>
            </div>
          </div>
        </div>}
      </div>}

      {/* ════════ MONTE CARLO SIMULATION ════════ */}
      {view === "montecarlo" && <div style={{ animation: "fadeUp .3s ease both" }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8, border: "1px solid #F0E6D0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>Monte Carlo Simulation</div>
              <div style={{ fontSize: 12, color: "#33333480", marginTop: 2 }}>{mcResults.simulations.toLocaleString()} paths · {mcResults.horizon} horizon · {mcResults.confidence}% CI</div>
            </div>
            <button onClick={() => setMonteCarloRun(!monteCarloRun)}
              style={{ padding: "6px 14px", borderRadius: 10, border: "none", background: monteCarloRun ? "#5B8C5A" : "#C48830", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Quicksand" }}>
              {monteCarloRun ? "Re-run" : "Run Simulation"}
            </button>
          </div>

          {/* Distribution Visualization */}
          <div style={{ marginBottom: 10 }}>
            <svg viewBox="0 0 600 140" style={{ width: "100%", height: 100, display: "block" }}>
              <defs>
                <linearGradient id="mcGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#EF5350" /><stop offset="20%" stopColor="#FFA726" />
                  <stop offset="45%" stopColor="#5B8C5A" /><stop offset="70%" stopColor="#42A5F5" />
                  <stop offset="100%" stopColor="#7E57C2" />
                </linearGradient>
              </defs>
              <rect x="30" y="120" width="540" height="1" fill="#F0E6D0" />
              {/* Bell curve approximation */}
              <path d="M30,120 Q60,118 90,112 Q130,100 170,82 Q210,55 250,30 Q280,15 310,10 Q340,15 370,30 Q410,55 450,82 Q490,100 520,112 Q550,118 570,120" fill="url(#mcGrad)" fillOpacity="0.12" stroke="url(#mcGrad)" strokeWidth="2" />
              {/* 5th percentile line */}
              <line x1="120" y1="5" x2="120" y2="120" stroke="#EF5350" strokeWidth="1.5" strokeDasharray="4,3" />
              <text x="120" y="135" textAnchor="middle" fill="#EF5350" fontSize="7" fontWeight="700">5th: {mcResults.percentiles[1].val}%</text>
              {/* Median line */}
              <line x1="310" y1="5" x2="310" y2="120" stroke="#5B8C5A" strokeWidth="1.5" strokeDasharray="4,3" />
              <text x="310" y="135" textAnchor="middle" fill="#5B8C5A" fontSize="7" fontWeight="700">Median: +{mcResults.percentiles[4].val}%</text>
              {/* 95th percentile line */}
              <line x1="490" y1="5" x2="490" y2="120" stroke="#42A5F5" strokeWidth="1.5" strokeDasharray="4,3" />
              <text x="490" y="135" textAnchor="middle" fill="#42A5F5" fontSize="7" fontWeight="700">95th: +{mcResults.percentiles[7].val}%</text>
            </svg>
          </div>

          {/* Percentile Table */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(80px,1fr))", gap: 4, marginBottom: 10 }}>
            {mcResults.percentiles.map((p, i) => {
              const dollarVal = Math.round(totalValue * p.val / 100);
              return (
                <div key={i} style={{ background: p.val >= 0 ? "#EDF5ED" : "#FFEBEE", borderRadius: 8, padding: "5px 6px", textAlign: "center", border: `1px solid ${p.color}18` }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#33333480" }}>{p.p}</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 800, color: p.color }}>{p.val >= 0 ? "+" : ""}{p.val}%</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 600, color: "#8A7040" }}>{fmtS(dollarVal)}</div>
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4 }}>
            {[
              { label: "Expected Return", val: "+" + mcResults.expectedReturn + "%", color: "#5B8C5A" },
              { label: "Expected Vol", val: mcResults.expectedVol + "%", color: "#FFA726" },
              { label: "P(Loss)", val: mcResults.probLoss + "%", color: "#EF5350" },
              { label: "P(Gain >20%)", val: mcResults.probGain20 + "%", color: "#42A5F5" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#F9F6F0", borderRadius: 8, padding: "5px 6px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#33333480", textTransform: "uppercase" }}>{s.label}</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 800, color: s.color, marginTop: 2 }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>}

      {/* ════════ SENSITIVITY ANALYSIS (Factor Shock Grid) ════════ */}
      {view === "sensitivity" && <div style={{ animation: "fadeUp .3s ease both" }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: 12, border: "1px solid #F0E6D0" }}>
          <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif", marginBottom: 3 }}>Factor Sensitivity Analysis</div>
          <div style={{ fontSize: 12, color: "#33333480", marginBottom: 10 }}>How your portfolio responds to individual factor shocks</div>

          {/* Factor Selector */}
          <div className="no-scrollbar" style={{ display: "flex", gap: 4, marginBottom: 10, overflowX: "auto" }}>
            {Object.entries(sensFactors).map(([key, f]) => (
              <button key={key} onClick={() => setSensitivity(key)}
                style={{ display: "flex", alignItems: "center", gap: 3, padding: "5px 10px", borderRadius: 8, border: `1.5px solid ${sensitivity === key ? "#C48830" : "#F0E6D0"}`, background: sensitivity === key ? "#FFF8EE" : "#fff", color: sensitivity === key ? "#C48830" : "#A09080", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Quicksand", whiteSpace: "nowrap" }}>
                <Icon name={f.icon} size={9} color={sensitivity === key ? "#C48830" : "#A09080"} /> {f.label}
              </button>
            ))}
          </div>

          {/* Sensitivity Bar Chart */}
          <div style={{ marginBottom: 8 }}>
            <svg viewBox="0 0 600 180" style={{ width: "100%", height: 140, display: "block" }}>
              <rect x="30" y="90" width="540" height="1" fill="#C4883044" />
              <text x="15" y="93" fill="#33333480" fontSize="7" fontWeight="700" textAnchor="end">0%</text>
              {sensData.steps.map((step, i) => {
                const imp = sensData.impacts[i];
                const x = 40 + i * (540 / sensData.steps.length);
                const barW = (540 / sensData.steps.length) * 0.7;
                const barH = Math.abs(imp) * 4;
                const y = imp >= 0 ? 90 - barH : 90;
                const col = imp >= 0 ? "#5B8C5A" : "#EF5350";
                return (
                  <g key={i}>
                    <rect x={x} y={y} width={barW} height={barH} rx="3" fill={col} fillOpacity="0.7" />
                    <text x={x + barW / 2} y={imp >= 0 ? y - 4 : y + barH + 10} textAnchor="middle" fill={col} fontSize="8" fontWeight="800" fontFamily="JetBrains Mono">{imp >= 0 ? "+" : ""}{imp}%</text>
                    <text x={x + barW / 2} y={165} textAnchor="middle" fill="#33333480" fontSize="7" fontWeight="700">{step >= 0 ? "+" : ""}{step}{sensData.unit}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Impact Table */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(70px,1fr))", gap: 4 }}>
            {sensData.steps.map((step, i) => {
              const imp = sensData.impacts[i];
              const dollarImp = Math.round(totalValue * imp / 100);
              const col = imp >= 0 ? "#5B8C5A" : "#EF5350";
              return (
                <div key={i} style={{ background: col + "0A", borderRadius: 8, padding: "5px 6px", textAlign: "center", border: `1px solid ${col}15` }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#33333480" }}>{step >= 0 ? "+" : ""}{step}{sensData.unit}</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 800, color: col }}>{imp >= 0 ? "+" : ""}{imp}%</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 600, color: "#8A7040" }}>{fmtS(dollarImp)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>}

      {/* ════════ VaR / CVaR ANALYTICS ════════ */}
      {view === "var" && <div style={{ animation: "fadeUp .3s ease both" }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8, border: "1px solid #F0E6D0" }}>
          <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif", marginBottom: 3 }}>Value at Risk & Expected Shortfall</div>
          <div style={{ fontSize: 12, color: "#33333480", marginBottom: 10 }}>Parametric VaR using variance-covariance method · CVaR (ES) for tail risk</div>

          {/* Primary VaR Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
            {[
              { label: "VaR 95% (1-Day)", val: varMetrics.var95_1d, dollar: Math.round(totalValue * varMetrics.var95_1d / 100), desc: "5% chance of losing more than this in one day", color: "#FFA726" },
              { label: "VaR 99% (1-Day)", val: varMetrics.var99_1d, dollar: Math.round(totalValue * varMetrics.var99_1d / 100), desc: "1% chance of losing more than this in one day", color: "#EF5350" },
              { label: "VaR 95% (10-Day)", val: varMetrics.var95_10d, dollar: Math.round(totalValue * varMetrics.var95_10d / 100), desc: "5% chance of losing more in 2 trading weeks", color: "#FFA726" },
              { label: "VaR 99% (10-Day)", val: varMetrics.var99_10d, dollar: Math.round(totalValue * varMetrics.var99_10d / 100), desc: "1% chance of losing more in 2 trading weeks", color: "#EF5350" },
            ].map((v, i) => (
              <div key={i} style={{ background: v.color + "08", border: `1.5px solid ${v.color}22`, borderRadius: 12, padding: "8px 10px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#33333480", textTransform: "uppercase" }}>{v.label}</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 21, fontWeight: 900, color: v.color, marginTop: 3 }}>{v.val}%</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 600, color: "#8A7040", marginTop: 1 }}>{fmtS(v.dollar)}</div>
                <div style={{ fontSize: 11, color: "#33333480", marginTop: 3, lineHeight: 1.3 }}>{v.desc}</div>
              </div>
            ))}
          </div>

          {/* CVaR / Expected Shortfall */}
          <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 6 }}>Conditional VaR (Expected Shortfall)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
            {[
              { label: "CVaR 95%", val: varMetrics.cvar95, desc: "Average loss in the worst 5% of scenarios", color: "#FFA726" },
              { label: "CVaR 99%", val: varMetrics.cvar99, desc: "Average loss in the worst 1% of scenarios", color: "#EF5350" },
            ].map((v, i) => (
              <div key={i} style={{ background: "#F9F6F0", borderRadius: 10, padding: "8px 10px", border: `1px solid ${v.color}18` }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#33333480", textTransform: "uppercase" }}>{v.label}</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 18, fontWeight: 900, color: v.color, marginTop: 2 }}>{v.val}%</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 600, color: "#8A7040" }}>{fmtS(Math.round(totalValue * v.val / 100))}</div>
                <div style={{ fontSize: 11, color: "#33333480", marginTop: 2 }}>{v.desc}</div>
              </div>
            ))}
          </div>

          {/* Risk Characteristics */}
          <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 6 }}>Risk Characteristics</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(80px,1fr))", gap: 4 }}>
            {[
              { label: "Annualized Vol", val: varMetrics.portfolioVol + "%", color: "#FFA726" },
              { label: "Beta to SPX", val: varMetrics.beta.toFixed(2), color: "#42A5F5" },
              { label: "Sharpe Ratio", val: varMetrics.sharpe.toFixed(2), color: "#5B8C5A" },
              { label: "Sortino Ratio", val: varMetrics.sortino.toFixed(2), color: "#5B8C5A" },
              { label: "Max Drawdown", val: varMetrics.maxDD + "%", color: "#EF5350" },
              { label: "Avg Drawdown", val: varMetrics.avgDD + "%", color: "#FFA726" },
              { label: "Skewness", val: varMetrics.skew.toFixed(2), color: varMetrics.skew < 0 ? "#EF5350" : "#5B8C5A" },
              { label: "Kurtosis", val: varMetrics.kurtosis.toFixed(2), color: varMetrics.kurtosis > 3 ? "#FFA726" : "#5B8C5A" },
            ].map((m, i) => (
              <div key={i} style={{ background: "#F9F6F0", borderRadius: 8, padding: "5px 6px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#33333480", textTransform: "uppercase" }}>{m.label}</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 800, color: m.color, marginTop: 2 }}>{m.val}</div>
              </div>
            ))}
          </div>

          {/* Fat Tails Warning */}
          {varMetrics.kurtosis > 3 && <div style={{ marginTop: 8, padding: "8px 10px", background: "#FFF3E0", borderRadius: 10, border: "1px solid #FFA72622", display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="warning" size={14} color="#FFA726" />
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#FFA726" }}>Fat Tails Detected (Kurtosis: {varMetrics.kurtosis.toFixed(2)})</div>
              <div style={{ fontSize: 12, color: "#8A7040", marginTop: 2 }}>Your portfolio has excess kurtosis &gt; 3, meaning extreme events are more likely than a normal distribution predicts. Parametric VaR may understate true tail risk — consider using Monte Carlo or Historical VaR for more accurate estimates.</div>
            </div>
          </div>}
        </div>
      </div>}

      {/* ════════ CUSTOM SCENARIO BUILDER ════════ */}
      {view === "custom" && <div style={{ animation: "fadeUp .3s ease both" }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: 12, border: "1px solid #F0E6D0" }}>
          <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif", marginBottom: 3 }}>Custom Scenario Builder</div>
          <div style={{ fontSize: 12, color: "#33333480", marginBottom: 10 }}>Define your own macro shocks and see the estimated portfolio impact</div>

          {/* Shock Sliders */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[
              { key: "spx", label: "S&P 500", icon: "chart-bar", min: -60, max: 40, unit: "%" },
              { key: "rates", label: "Interest Rates", icon: "bank", min: -200, max: 300, unit: "bp" },
              { key: "vix", label: "VIX Change", icon: "wave", min: -15, max: 60, unit: "pts" },
              { key: "oil", label: "Crude Oil", icon: "oil-barrel", min: -70, max: 100, unit: "%" },
              { key: "dxy", label: "US Dollar", icon: "money", min: -20, max: 25, unit: "%" },
              { key: "gold", label: "Gold", icon: "sparkle", min: -30, max: 50, unit: "%" },
            ].map(s => {
              const val = customShocks[s.key];
              const col = val === 0 ? "#A09080" : val > 0 ? "#5B8C5A" : "#EF5350";
              return (
                <div key={s.key}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Icon name={s.icon} size={9} color={col} />
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#5C4A1E" }}>{s.label}</span>
                    </div>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 800, color: col }}>
                      {val >= 0 ? "+" : ""}{val}{s.unit}
                    </span>
                  </div>
                  <input type="range" min={s.min} max={s.max} value={val}
                    onChange={e => setCustomShocks(prev => ({ ...prev, [s.key]: Number(e.target.value) }))}
                    style={{ width: "100%", height: 4, appearance: "none", background: `linear-gradient(to right, #EF5350, #F0E6D0, #5B8C5A)`, borderRadius: 2, outline: "none", cursor: "pointer" }} />
                </div>
              );
            })}
          </div>

          {/* Custom Impact Result */}
          <div style={{ padding: "10px 12px", background: customPortfolioImpact >= 0 ? "#EDF5ED" : "#FFEBEE", borderRadius: 12, border: `1.5px solid ${customPortfolioImpact >= 0 ? "#5B8C5A" : "#EF5350"}22`, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#33333480", textTransform: "uppercase" }}>Estimated Portfolio Impact</div>
                <div style={{ fontSize: 11, color: "#8A7040", marginTop: 2 }}>Based on factor loadings and historical betas</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 24, fontWeight: 900, color: customPortfolioImpact >= 0 ? "#5B8C5A" : "#EF5350" }}>{customPortfolioImpact >= 0 ? "+" : ""}{customPortfolioImpact.toFixed(1)}%</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 600, color: "#8A7040" }}>{fmtS(Math.round(totalValue * customPortfolioImpact / 100))}</div>
              </div>
            </div>
          </div>

          {/* Reset & Preset Buttons */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <button onClick={() => setCustomShocks({ spx: 0, rates: 0, vix: 0, oil: 0, dxy: 0, gold: 0 })}
              style={{ padding: "5px 10px", borderRadius: 8, border: "1.5px solid #F0E6D0", background: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", color: "#A09080" }}>Reset All</button>
            <button onClick={() => setCustomShocks({ spx: -30, rates: -100, vix: 40, oil: -40, dxy: 5, gold: 15 })}
              style={{ padding: "5px 10px", borderRadius: 8, border: "1.5px solid #EF535044", background: "#FFEBEE", fontSize: 12, fontWeight: 800, cursor: "pointer", color: "#EF5350" }}>Recession</button>
            <button onClick={() => setCustomShocks({ spx: -15, rates: 200, vix: 25, oil: 50, dxy: 10, gold: 20 })}
              style={{ padding: "5px 10px", borderRadius: 8, border: "1.5px solid #FFA72644", background: "#FFF3E0", fontSize: 12, fontWeight: 800, cursor: "pointer", color: "#FFA726" }}>Stagflation</button>
            <button onClick={() => setCustomShocks({ spx: 20, rates: -50, vix: -10, oil: 15, dxy: -8, gold: 5 })}
              style={{ padding: "5px 10px", borderRadius: 8, border: "1.5px solid #5B8C5A44", background: "#EDF5ED", fontSize: 12, fontWeight: 800, cursor: "pointer", color: "#5B8C5A" }}>Goldilocks</button>
            <button onClick={() => setCustomShocks({ spx: -8, rates: 100, vix: 15, oil: -20, dxy: 12, gold: -5 })}
              style={{ padding: "5px 10px", borderRadius: 8, border: "1.5px solid #42A5F544", background: "#E3F2FD", fontSize: 12, fontWeight: 800, cursor: "pointer", color: "#42A5F5" }}>Rate Hike</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

// ═══════════════ HISTORICAL PATTERNS PAGE ═══════════════
function HistoricalPatternsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("2008");
  const [view, setView] = useState("comparison");

  const historicalPeriods = [
    { id: "2008", label: "2008 GFC", icon: "bank", similarity: 34, color: "#EF5350", desc: "Credit freeze, bank failures, housing collapse", spxDrawdown: -56.8, duration: "17 months", recovery: "4.3 years", trigger: "Lehman Brothers collapse", indicators: { unemployment: 10.0, gdpGrowth: -4.3, cpi: -0.4, fedRate: 0.25, vix: 80.9 } },
    { id: "2000", label: "2000 Dot-Com", icon: "laptop", similarity: 52, color: "#FFA726", desc: "Tech bubble burst, valuation reset, Nasdaq -78%", spxDrawdown: -49.1, duration: "30 months", recovery: "7.1 years", trigger: "Tech valuation euphoria collapse", indicators: { unemployment: 6.3, gdpGrowth: 0.8, cpi: 3.4, fedRate: 1.0, vix: 43.7 } },
    { id: "2020", label: "2020 COVID", icon: "syringe", similarity: 28, color: "#42A5F5", desc: "Pandemic shock, V-shaped recovery, massive stimulus", spxDrawdown: -33.9, duration: "1 month", recovery: "5 months", trigger: "Global pandemic lockdowns", indicators: { unemployment: 14.7, gdpGrowth: -31.2, cpi: 0.1, fedRate: 0.0, vix: 82.7 } },
    { id: "2022", label: "2022 Rate Shock", icon: "chart-up", similarity: 71, color: "#5B8C5A", desc: "Fed tightening cycle, inflation battle, growth scare", spxDrawdown: -25.4, duration: "10 months", recovery: "14 months", trigger: "Aggressive Fed rate hikes", indicators: { unemployment: 3.7, gdpGrowth: 2.1, cpi: 9.1, fedRate: 4.5, vix: 36.5 } },
    { id: "1970s", label: "1970s Stagflation", icon: "oil-barrel", similarity: 45, color: "#C48830", desc: "Oil shocks, wage-price spiral, double-dip recession", spxDrawdown: -48.2, duration: "21 months", recovery: "3.3 years", trigger: "OPEC oil embargo + monetary policy failure", indicators: { unemployment: 9.0, gdpGrowth: -1.4, cpi: 11.0, fedRate: 13.0, vix: null } },
  ];

  const currentIndicators = { unemployment: 4.1, gdpGrowth: 2.6, cpi: 3.4, fedRate: 5.25, vix: 18.2 };

  const patternMatches = [
    { pattern: "Yield Curve Inversion", current: "Inverted 14mo", historical: "Avg 16mo before recession", confidence: 72, icon: "chart-line", color: "#EF5350" },
    { pattern: "Fed Pause Duration", current: "5 months", historical: "Avg 8mo before first cut", confidence: 61, icon: "bank", color: "#FFA726" },
    { pattern: "Earnings Growth Decel", current: "+4.2% YoY", historical: "Slows to <2% before recession", confidence: 38, icon: "chart-bar", color: "#5B8C5A" },
    { pattern: "Credit Spreads", current: "HY +340bp", historical: "Widens to +500bp in stress", confidence: 44, icon: "warning", color: "#FFA726" },
    { pattern: "M2 Money Supply", current: "-2.1% YoY", historical: "First contraction since 1930s", confidence: 67, icon: "money", color: "#EF5350" },
    { pattern: "Consumer Sentiment", current: "67.4", historical: "Sub-60 precedes recessions", confidence: 42, icon: "person", color: "#5B8C5A" },
  ];

  const period = historicalPeriods.find(p => p.id === selectedPeriod);

  return (
    <div>
      <div style={{ marginBottom: 10, animation: "fadeUp .3s ease both" }}>
        <h1 style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>Historical Patterns</h1>
        <p style={{ color: "#33333480", fontSize: 15, marginTop: 3 }}>Compare current market conditions to historical periods & detect rhyming patterns</p>
      </div>

      <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
        {[{ id: "comparison", l: "Compare" }, { id: "patterns", l: "Patterns" }, { id: "indicators", l: "Indicators" }].map(t => (
          <button key={t.id} onClick={() => setView(t.id)} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: `1.5px solid ${view === t.id ? "#C48830" : "#F0E6D0"}`, background: view === t.id ? "#C48830" : "#fff", color: view === t.id ? "#fff" : "#A09080", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Quicksand" }}>{t.l}</button>
        ))}
      </div>

      {view === "comparison" && <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(90px,1fr))", gap: 6, marginBottom: 8, animation: "fadeUp .4s ease .05s both" }}>
          {historicalPeriods.map(p => (
            <button key={p.id} onClick={() => setSelectedPeriod(p.id)} style={{ background: selectedPeriod === p.id ? p.color + "15" : "#fff", border: `1.5px solid ${selectedPeriod === p.id ? p.color : "#F0E6D0"}`, borderRadius: 12, padding: "8px", cursor: "pointer", textAlign: "left", transition: "all .2s" }}>
              <Icon name={p.icon} size={12} color={selectedPeriod === p.id ? p.color : "#A09080"} />
              <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginTop: 4 }}>{p.label}</div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700, color: p.color, marginTop: 2 }}>{p.similarity}%</div>
              <div style={{ fontSize: 11, color: "#33333480" }}>similarity</div>
            </button>
          ))}
        </div>

        {period && (
          <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8, border: "1px solid #F0E6D0", animation: "fadeUp .3s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: period.color + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={period.icon} size={16} color={period.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>{period.label}</div>
                <div style={{ fontSize: 12, color: "#33333480" }}>{period.desc}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#33333480" }}>Match</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 21, fontWeight: 900, color: period.color }}>{period.similarity}%</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 8 }}>
              {[
                { label: "S&P Drawdown", value: period.spxDrawdown + "%", color: "#EF5350" },
                { label: "Duration", value: period.duration, color: "#FFA726" },
                { label: "Recovery", value: period.recovery, color: "#5B8C5A" },
              ].map((s, i) => (
                <div key={i} style={{ background: "#F9F6F0", borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#33333480", textTransform: "uppercase" }}>{s.label}</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 800, color: s.color, marginTop: 2 }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: "6px 10px", background: period.color + "10", borderRadius: 8, border: `1px solid ${period.color}22`, marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: period.color, textTransform: "uppercase" }}>Trigger</div>
              <div style={{ fontSize: 14, color: "#5C4A1E", marginTop: 2 }}>{period.trigger}</div>
            </div>

            <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 6 }}>Then vs Now</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#33333480" }}>METRIC</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: period.color, textAlign: "center" }}>{period.label.toUpperCase()}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#C48830", textAlign: "center" }}>NOW</div>
              {[
                { label: "Unemployment", key: "unemployment", unit: "%" },
                { label: "GDP Growth", key: "gdpGrowth", unit: "%" },
                { label: "CPI", key: "cpi", unit: "%" },
                { label: "Fed Rate", key: "fedRate", unit: "%" },
                { label: "VIX", key: "vix", unit: "" },
              ].map((m, i) => (
                <React.Fragment key={i}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#5C4A1E", padding: "4px 0", borderTop: "1px solid #F0E6D0" }}>{m.label}</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 700, color: period.color, textAlign: "center", padding: "4px 0", borderTop: "1px solid #F0E6D0" }}>{period.indicators[m.key] !== null ? period.indicators[m.key] + m.unit : "N/A"}</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 700, color: "#C48830", textAlign: "center", padding: "4px 0", borderTop: "1px solid #F0E6D0" }}>{currentIndicators[m.key]}{m.unit}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </>}

      {view === "patterns" && (
        <div style={{ animation: "fadeUp .3s ease both" }}>
          <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 7 }}>Pattern Recognition</div>
          {patternMatches.map((p, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "10px 12px", marginBottom: 6, border: "1px solid #F0E6D0", animation: "fadeUp .3s ease " + (i * .05) + "s both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Icon name={p.icon} size={11} color={p.color} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif" }}>{p.pattern}</div>
                </div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 900, color: p.color }}>{p.confidence}%</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <div style={{ background: "#F9F6F0", borderRadius: 8, padding: "5px 8px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#33333480", textTransform: "uppercase" }}>Current</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#5C4A1E", marginTop: 1 }}>{p.current}</div>
                </div>
                <div style={{ background: "#F9F6F0", borderRadius: 8, padding: "5px 8px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#33333480", textTransform: "uppercase" }}>Historical</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#5C4A1E", marginTop: 1 }}>{p.historical}</div>
                </div>
              </div>
              <div style={{ marginTop: 6, height: 4, background: "#F0E6D0", borderRadius: 2 }}>
                <div style={{ height: "100%", width: p.confidence + "%", background: p.color, borderRadius: 2, transition: "width .5s ease" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "indicators" && (
        <div style={{ animation: "fadeUp .3s ease both" }}>
          <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 7 }}>Macro Indicators Timeline</div>
          <div style={{ background: "#fff", borderRadius: 14, padding: 12, border: "1px solid #F0E6D0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 8 }}>
              {[
                { label: "Unemployment", value: "4.1%", trend: "flat", icon: "person" },
                { label: "GDP Growth", value: "+2.6%", trend: "up", icon: "chart-up" },
                { label: "CPI (YoY)", value: "3.4%", trend: "down", icon: "fire" },
                { label: "Fed Funds", value: "5.25%", trend: "flat", icon: "bank" },
                { label: "VIX", value: "18.2", trend: "down", icon: "wave" },
                { label: "10Y Yield", value: "4.31%", trend: "up", icon: "chart-line" },
              ].map((ind, i) => (
                <div key={i} style={{ background: "#F9F6F0", borderRadius: 8, padding: "6px 8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                    <Icon name={ind.icon} size={9} color="#A09080" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#33333480" }}>{ind.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 800, color: "#5C4A1E" }}>{ind.value}</span>
                    <span style={{ fontSize: 12, color: ind.trend === "up" ? "#5B8C5A" : ind.trend === "down" ? "#EF5350" : "#FFA726", fontWeight: 700 }}>
                      {ind.trend === "up" ? "▲" : ind.trend === "down" ? "▼" : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "8px 10px", background: "#FFEBEE", borderRadius: 10, border: "1px solid #EF535022" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#EF5350", textTransform: "uppercase" }}>Recession Probability (12mo)</div>
                  <div style={{ fontSize: 12, color: "#8A7040", marginTop: 2 }}>Based on yield curve, PMI, and leading indicators</div>
                </div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 24, fontWeight: 900, color: "#EF5350" }}>32%</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════ CONTRARIAN SIGNALS PAGE ═══════════════
function ContrarianSignalsPage() {
  const [view, setView] = useState("flows");

  const tradeFlows = [
    { ticker: "NVDA", name: "NVIDIA", volume: "142M", avgVol: "58M", ratio: 2.45, sentiment: "Extreme Greed", contrarianSignal: "Caution", color: "#EF5350", icon: "bolt" },
    { ticker: "TSLA", name: "Tesla", volume: "98M", avgVol: "72M", ratio: 1.36, sentiment: "Greedy", contrarianSignal: "Neutral", color: "#FFA726", icon: "car" },
    { ticker: "AAPL", name: "Apple", volume: "45M", avgVol: "52M", ratio: 0.87, sentiment: "Neutral", contrarianSignal: "Hold", color: "#42A5F5", icon: "apple-fruit" },
    { ticker: "META", name: "Meta", volume: "38M", avgVol: "22M", ratio: 1.73, sentiment: "Greedy", contrarianSignal: "Trim", color: "#EF5350", icon: "goggles" },
    { ticker: "AMZN", name: "Amazon", volume: "52M", avgVol: "48M", ratio: 1.08, sentiment: "Neutral", contrarianSignal: "Hold", color: "#5B8C5A", icon: "cart" },
  ];

  const underloved = [
    { ticker: "PFE", name: "Pfizer", sector: "Healthcare", ytd: -18.4, pe: 9.2, div: 6.1, neglectScore: 92, reason: "Post-COVID narrative collapse. Pipeline underappreciated. Deep value territory.", icon: "pill" },
    { ticker: "MMM", name: "3M", sector: "Industrials", ytd: -12.8, pe: 10.8, div: 5.8, neglectScore: 87, reason: "Litigation overhang priced in. Restructuring underway. Spinoff catalyst ahead.", icon: "wrench" },
    { ticker: "VZ", name: "Verizon", sector: "Telecom", ytd: -8.2, pe: 8.4, div: 7.2, neglectScore: 84, reason: "Telecom out of favor. Fiber buildout nearing completion. FCF machine.", icon: "signal" },
    { ticker: "INTC", name: "Intel", sector: "Technology", ytd: -31.2, pe: 14.6, div: 1.4, neglectScore: 88, reason: "Foundry skepticism extreme. CHIPS Act catalysts. 18A node could surprise.", icon: "laptop" },
    { ticker: "BMY", name: "Bristol-Myers", sector: "Healthcare", ytd: -22.6, pe: 7.8, div: 5.4, neglectScore: 90, reason: "Patent cliff fears overdone. New drug pipeline not priced in. Deep value.", icon: "syringe" },
  ];

  const overtraded = [
    { ticker: "NVDA", name: "NVIDIA", crowding: 96, shortInterest: 1.2, callPutRatio: 4.8, rsi: 78, risk: "Extreme crowding. Any miss triggers cascade.", color: "#EF5350" },
    { ticker: "ARM", name: "Arm Holdings", crowding: 88, shortInterest: 8.4, callPutRatio: 3.2, rsi: 72, risk: "Momentum trade. Valuation detached from fundamentals.", color: "#EF5350" },
    { ticker: "PLTR", name: "Palantir", crowding: 82, shortInterest: 3.8, callPutRatio: 5.1, rsi: 74, risk: "Retail darling. Government contract cycle risk.", color: "#FFA726" },
    { ticker: "SMCI", name: "Super Micro", crowding: 91, shortInterest: 12.4, callPutRatio: 2.8, rsi: 68, risk: "Accounting concerns. Short squeeze potential but fundamentally risky.", color: "#EF5350" },
  ];

  const commoditySignals = [
    { name: "Gold", icon: "gold-medal", price: "$2,340", positioning: "Overcrowded Long", cot: "+284K net long", contrarianView: "Near-term pullback likely. Extreme spec longs historically lead to 5-8% corrections. Buy dips.", signal: "Wait", color: "#FFA726" },
    { name: "Oil (WTI)", icon: "oil-barrel", price: "$78.20", positioning: "Balanced", cot: "+42K net long", contrarianView: "Positioning neutral. Supply cuts vs demand uncertainty. Range-bound. No edge.", signal: "Neutral", color: "#42A5F5" },
    { name: "Copper", icon: "pickaxe", price: "$4.12", positioning: "Underloved", cot: "-18K net short", contrarianView: "Specs hate it. But EV + grid buildout = structural demand. Contrarian long.", signal: "Buy", color: "#5B8C5A" },
    { name: "Natural Gas", icon: "fire", price: "$2.84", positioning: "Extreme Short", cot: "-142K net short", contrarianView: "Most hated commodity. Winter wildcards + LNG export growth = squeeze candidate.", signal: "Strong Buy", color: "#5B8C5A" },
    { name: "Silver", icon: "coin", price: "$28.40", positioning: "Mildly Crowded", cot: "+62K net long", contrarianView: "Gold/silver ratio at 82x, historically mean-reverts to 65x. Industrial demand tailwind.", signal: "Buy Dip", color: "#5B8C5A" },
  ];

  const futuresSignals = [
    { name: "E-mini S&P 500", ticker: "ES", icon: "chart-bar", price: "$5,248", openInterest: "2.4M", netSpec: "+142K", signal: "Crowded Long", color: "#EF5350", note: "Specs heavily long. Vulnerable to any hawkish catalyst or growth scare." },
    { name: "10Y Treasury", ticker: "ZN", icon: "bank", price: "110.25", openInterest: "4.1M", netSpec: "-284K", signal: "Contrarian Buy", color: "#5B8C5A", note: "Largest net short in history. Mean reversion trade if inflation cools." },
    { name: "VIX Futures", ticker: "VX", icon: "wave", price: "18.40", openInterest: "380K", netSpec: "-98K", signal: "Cheap Protection", color: "#5B8C5A", note: "Vol sellers complacent. Tail hedges historically cheap at these levels." },
    { name: "Euro FX", ticker: "6E", icon: "globe", price: "1.0785", openInterest: "680K", netSpec: "+28K", signal: "Neutral", color: "#42A5F5", note: "Mild long positioning. No strong contrarian edge either way." },
  ];

  return (
    <div>
      <div style={{ marginBottom: 10, animation: "fadeUp .3s ease both" }}>
        <h1 style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>Contrarian Signals</h1>
        <p style={{ color: "#33333480", fontSize: 15, marginTop: 3 }}>Go against the crowd — find what's overloved, underloved & mispriced</p>
      </div>

      <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
        {[{ id: "flows", l: "Flows" }, { id: "underloved", l: "Underloved" }, { id: "crowded", l: "Crowded" }, { id: "commodities", l: "Commodities" }].map(t => (
          <button key={t.id} onClick={() => setView(t.id)} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: `1.5px solid ${view === t.id ? "#C48830" : "#F0E6D0"}`, background: view === t.id ? "#C48830" : "#fff", color: view === t.id ? "#fff" : "#A09080", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Quicksand" }}>{t.l}</button>
        ))}
      </div>

      {view === "flows" && (
        <div style={{ animation: "fadeUp .3s ease both" }}>
          <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 4 }}>Trade Flow Analysis</div>
          <div style={{ fontSize: 12, color: "#33333480", marginBottom: 8 }}>Volume vs average — when the crowd piles in, contrarians step back.</div>
          {tradeFlows.map((t, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "10px 12px", marginBottom: 6, border: "1px solid #F0E6D0", animation: "fadeUp .3s ease " + (i * .05) + "s both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Icon name={t.icon} size={12} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 800 }}>{t.ticker}</span>
                    <span style={{ fontSize: 12, color: "#33333480" }}>{t.name}</span>
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: t.color + "15", color: t.color }}>{t.contrarianSignal}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4 }}>
                {[
                  { label: "Volume", value: t.volume },
                  { label: "Avg Vol", value: t.avgVol },
                  { label: "Ratio", value: t.ratio.toFixed(2) + "x" },
                  { label: "Sentiment", value: t.sentiment },
                ].map((s, j) => (
                  <div key={j} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#33333480" }}>{s.label}</div>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 700, color: "#5C4A1E" }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 6, height: 4, background: "#F0E6D0", borderRadius: 2, position: "relative" }}>
                <div style={{ height: "100%", width: Math.min(t.ratio / 3 * 100, 100) + "%", background: t.color, borderRadius: 2 }} />
                <div style={{ position: "absolute", left: "33.3%", top: -1, width: 2, height: 6, background: "#5C4A1E", borderRadius: 1 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#33333480", marginTop: 2 }}>
                <span>Normal</span><span style={{ fontWeight: 700, color: "#5C4A1E" }}>1x avg</span><span>3x+ (crowded)</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "underloved" && (
        <div style={{ animation: "fadeUp .3s ease both" }}>
          <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 4 }}>Underloved & Overlooked</div>
          <div style={{ fontSize: 12, color: "#33333480", marginBottom: 8 }}>Stocks the market has abandoned. High neglect = potential contrarian opportunity.</div>
          {underloved.map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "10px 12px", marginBottom: 6, border: "1px solid #F0E6D0", animation: "fadeUp .3s ease " + (i * .05) + "s both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Icon name={s.icon} size={12} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 800 }}>{s.ticker}</span>
                    <span style={{ fontSize: 12, color: "#33333480" }}>{s.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#A09080" }}>{s.sector}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#33333480" }}>Neglect</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 900, color: "#C48830" }}>{s.neglectScore}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 6 }}>
                <div style={{ background: "#FFEBEE", borderRadius: 6, padding: "4px 6px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#EF5350" }}>YTD</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 700, color: "#EF5350" }}>{s.ytd}%</div>
                </div>
                <div style={{ background: "#EDF5ED", borderRadius: 6, padding: "4px 6px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#5B8C5A" }}>P/E</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 700, color: "#5B8C5A" }}>{s.pe}x</div>
                </div>
                <div style={{ background: "#FFF8EE", borderRadius: 6, padding: "4px 6px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#C48830" }}>Div %</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 700, color: "#C48830" }}>{s.div}%</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#6B5A2E", lineHeight: 1.4 }}>{s.reason}</div>
            </div>
          ))}
        </div>
      )}

      {view === "crowded" && (
        <div style={{ animation: "fadeUp .3s ease both" }}>
          <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 4 }}>Overly Crowded Trades</div>
          <div style={{ fontSize: 12, color: "#33333480", marginBottom: 8 }}>When everyone is on one side of the trade, the exit gets narrow.</div>
          {overtraded.map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "10px 12px", marginBottom: 6, border: "1px solid #F0E6D0", animation: "fadeUp .3s ease " + (i * .05) + "s both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 800 }}>{s.ticker}</span>
                    <span style={{ fontSize: 12, color: "#33333480" }}>{s.name}</span>
                  </div>
                </div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 18, fontWeight: 900, color: s.color }}>{s.crowding}%</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 6 }}>
                {[
                  { label: "Short Interest", value: s.shortInterest + "%" },
                  { label: "Call/Put", value: s.callPutRatio + "x" },
                  { label: "RSI", value: s.rsi },
                ].map((m, j) => (
                  <div key={j} style={{ background: "#F9F6F0", borderRadius: 6, padding: "4px 6px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#33333480" }}>{m.label}</div>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 700, color: "#5C4A1E" }}>{m.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ height: 4, background: "#F0E6D0", borderRadius: 2, marginBottom: 4 }}>
                <div style={{ height: "100%", width: s.crowding + "%", background: s.color, borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: 12, color: "#6B5A2E", lineHeight: 1.4 }}>{s.risk}</div>
            </div>
          ))}

          <div style={{ marginTop: 8, animation: "fadeUp .3s ease .25s both" }}>
            <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 7 }}>Futures Positioning</div>
            {futuresSignals.map((f, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "10px 12px", marginBottom: 6, border: "1px solid #F0E6D0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <Icon name={f.icon} size={12} color={f.color} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Instrument Serif', serif" }}>{f.name}</div>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 700, color: "#33333480" }}>{f.ticker} · {f.price}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: f.color + "15", color: f.color }}>{f.signal}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 4 }}>
                  <div style={{ background: "#F9F6F0", borderRadius: 6, padding: "4px 8px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#33333480" }}>OPEN INTEREST</div>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 700, color: "#5C4A1E" }}>{f.openInterest}</div>
                  </div>
                  <div style={{ background: "#F9F6F0", borderRadius: 6, padding: "4px 8px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#33333480" }}>NET SPEC</div>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 700, color: "#5C4A1E" }}>{f.netSpec}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#6B5A2E", lineHeight: 1.4 }}>{f.note}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "commodities" && (
        <div style={{ animation: "fadeUp .3s ease both" }}>
          <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 4 }}>Commodity Contrarian Signals</div>
          <div style={{ fontSize: 12, color: "#33333480", marginBottom: 8 }}>COT positioning data reveals when speculators are offside.</div>
          {commoditySignals.map((c, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "10px 12px", marginBottom: 6, border: "1px solid #F0E6D0", animation: "fadeUp .3s ease " + (i * .05) + "s both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Icon name={c.icon} size={12} color={c.color} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif" }}>{c.name}</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 700, color: "#5C4A1E" }}>{c.price}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, padding: "3px 8px", borderRadius: 6, background: c.color + "15", color: c.color }}>{c.signal}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 6 }}>
                <div style={{ background: "#F9F6F0", borderRadius: 6, padding: "4px 8px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#33333480" }}>POSITIONING</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#5C4A1E", marginTop: 1 }}>{c.positioning}</div>
                </div>
                <div style={{ background: "#F9F6F0", borderRadius: 6, padding: "4px 8px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#33333480" }}>COT NET</div>
                  <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "JetBrains Mono", color: "#5C4A1E", marginTop: 1 }}>{c.cot}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#6B5A2E", lineHeight: 1.4 }}>{c.contrarianView}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CheckoutModal({ cart, onClose, onExecute }) {
  const [step, setStep] = useState("review"); const total = cart.reduce((s, b) => s + b.price, 0);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(45,32,22,.4)", backdropFilter: "blur(12px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "18vh", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "calc(100% - 24px)", maxWidth: 360, maxHeight: "65vh", overflow: "auto", animation: "popIn .4s ease" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "18px 24px", borderBottom: "2px solid #F0E6D0", display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ fontSize: 18 }}>🧺</span><span style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>{step === "review" ? "Checkout" : step === "executing" ? "Processing..." : "Done!"}</span></div><button onClick={onClose} style={{ background: "#fff", border: "none", width: 32, height: 32, borderRadius: 10, cursor: "pointer", fontSize: 17, color: "#33333480" }}>✕</button></div>
        <div style={{ padding: "18px 24px" }}>
          {step === "review" && <div>{cart.map((b, i) => <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: i < cart.length - 1 ? "1px solid #F0E6D0" : "none" }}><div style={{ display: "flex", gap: 6, alignItems: "center" }}><Icon name={b.icon} size={11} /><div><div style={{ fontWeight: 800, fontFamily: "'Instrument Serif', serif" }}>{b.name}</div><div style={{ fontSize: 15, color: "#33333480" }}>{b.stocks.length} stocks</div></div></div><div style={{ fontFamily: "JetBrains Mono", fontWeight: 700 }}>{fmt(b.price)}</div></div>)}<div style={{ display: "flex", justifyContent: "space-between", paddingTop: 14, borderTop: "2px solid #F0E6D0", marginTop: 6 }}><span style={{ fontWeight: 800 }}>Total</span><span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, fontWeight: 900, color: "#C48830" }}>{fmt(total)}</span></div><button onClick={() => { setStep("executing"); setTimeout(() => setStep("done"), 2200); }} style={{ width: "100%", marginTop: 16, padding: 13, background: "linear-gradient(135deg,#C48830,#EF5350)", color: "#fff", border: "none", borderRadius: 16, fontSize: 17, fontWeight: 900, cursor: "pointer", fontFamily: "'Instrument Serif', serif" }}>Execute</button></div>}
          {step === "executing" && <div style={{ textAlign: "center", padding: "40px 0" }}><div style={{ fontSize: 72, animation: "wiggle .5s ease infinite", marginBottom: 8 }}>🚀</div><div style={{ width: 40, height: 40, borderRadius: "50%", border: "4px solid #F0E6D0", borderTopColor: "#C48830", margin: "0 auto 18px", animation: "spin .8s linear infinite" }} /><div style={{ fontWeight: 800, fontFamily: "'Instrument Serif', serif" }}>Filling your Hatch...</div></div>}
          {step === "done" && <div style={{ textAlign: "center", padding: "36px 0" }}><div style={{ fontSize: 78, animation: "popIn .5s ease" }}>🎉</div><div style={{ fontSize: 17, fontWeight: 900, fontFamily: "'Instrument Serif', serif", margin: "10px 0" }}>Complete!</div><button onClick={() => { onExecute(); onClose(); }} style={{ marginTop: 14, padding: "10px 28px", background: "#C48830", color: "#fff", border: "none", borderRadius: 14, fontWeight: 800, cursor: "pointer" }}>Dashboard</button></div>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════���═══════ MAIN APP ═══════════════════════════

export default function App() {
  const { user, loading, logout, isFirebaseConfigured } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(t); }, []);
  const [page, setPage] = useState("dashboard");
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedBasket, setSelectedBasket] = useState(null);
  const [activeScenario, setActiveScenario] = useState(null);
  const [flippedCards, setFlippedCards] = useState({});
  useEffect(() => {
    const flipped = Object.entries(flippedCards).filter(([, v]) => v);
    if (flipped.length === 0) return;
    const timers = flipped.map(([id]) => setTimeout(() => setFlippedCards(f => ({ ...f, [id]: false })), 5000));
    return () => timers.forEach(clearTimeout);
  }, [flippedCards]);
  const [shopShares, setShopShares] = useState({});
  const [selectedShopBasket, setSelectedShopBasket] = useState(null);
  const [stockSearch, setStockSearch] = useState("");
  const [customBaskets, setCustomBaskets] = useState([]);
  const [basketView, setBasketView] = useState("baskets");
  const [showPortfolioMetrics, setShowPortfolioMetrics] = useState(false);
  const [riskLabTab, setRiskLabTab] = useState("risklab");
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [chartHover, setChartHover] = useState(null);
  const [portfolioView, setPortfolioView] = useState(false);
  const [viewStockTicker, setViewStockTicker] = useState(null); // For standalone stock pages
  const [viewIndicatorId, setViewIndicatorId] = useState(null); // For indicator detail pages
  const scrollRef = React.useRef(null);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  // AI Agent System
  const { agentState, runAgents, hasAIData } = useAgentSystem();

  // Live stock prices from Yahoo Finance
  const { isLive, prices: livePrices, explorerPrices: liveExplorerPrices, lastUpdate: priceLastUpdate, status: priceStatus } = useStockPrices();
  const explorerStockPrices = isLive ? liveExplorerPrices : INITIAL_EXPLORER_PRICES;

  // Live news from Finnhub
  const { news: liveNews, status: newsStatus, isLive: newsIsLive } = useNewsStream();

  // Inject live news into PortfolioService for agents
  React.useEffect(() => {
    PortfolioService.setLiveNews(liveNews);
  }, [liveNews]);

  // Use agent data with fallbacks
  const displaySignals = hasAIData ? agentState.signals : tradeSignals;
  const displayHedges = hasAIData ? agentState.hedges : hedgeRecommendations;
  const displayRegime = hasAIData ? agentState.regime : currentRegime;

  React.useEffect(() => {
    setHeaderCollapsed(false);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [page]);

  // Reset to home when user signs in
  React.useEffect(() => {
    if (user) {
      setPage("dashboard");
      setSelectedBasket(null);
      setPortfolioView(false);
      setViewStockTicker(null);
    }
  }, [user]);

  // Auth gates — render after all hooks
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFEF9", fontFamily: "'Quicksand',sans-serif" }}>
        <style>{STYLES}</style>
        <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease both" }}>
          <div style={{ fontSize: 60, marginBottom: 12 }}>🥚</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#33333480" }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ fontFamily: "'Quicksand',sans-serif", background: "#FFFDF5", height: "100%", width: "100%", display: "flex", flexDirection: "column", paddingTop: "env(safe-area-inset-top, 0px)", overflow: "hidden" }}>
        <style>{STYLES}</style>
        <AuthPage />
      </div>
    );
  }

  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 2200); };
  const addToCart = (b) => { if (cart.find(c => c.id === b.id)) setCart(cart.filter(c => c.id !== b.id)); else { setCart([...cart, b]); notify(b.icon + " " + b.name + " added to cart!"); } };
  const handleCreate = (data) => { const nb = { id: Date.now(), name: data.name, icon: data.icon, strategy: data.strategy, color: "terracotta", stocks: data.instruments.map(i => i.ticker), value: 0, change: 0, allocation: 0, desc: data.instruments.length + " instruments · " + data.strategy, costBasis: 0, dayPL: 0, totalPL: 0 }; setCustomBaskets([...customBaskets, nb]); notify(data.icon + " " + data.name + " created!"); };
  const goToStock = (ticker) => { if (/^[A-Z.]{1,6}$/.test(ticker)) { setViewStockTicker(ticker); setPage("stock"); setSelectedBasket(null); setPortfolioView(false); } };

  const filteredExplorer = activeScenario ? explorerBaskets.filter(b => b.scenario === activeScenario) : explorerBaskets;
  const maxExplorerYoY = Math.max(...filteredExplorer.map(b => b.stocks.reduce((sum, t) => sum + (stockYoYReturns[t] || 0), 0) / b.stocks.length));
  const critCount = macroAlerts.filter(a => a.severity === "critical").length;
  const todayEvents = calendarEvents.filter(e => e.date === "2026-02-06").length;

  // Header nav items (moved from sidebar)
  const headerNavItems = [
    { id: "calendar", label: "Calendar", icon: "calendar" },
    { id: "account", label: "Account", icon: "person" },
  ];

  // RISC Labs subtabs for left sidebar
  const riscLabTabs = [
    { id: "risklab", label: "Risk", icon: "flask" },
    { id: "hedge", label: "Hedge", icon: "shield" },
    { id: "stresstest", label: "Stress", icon: "explosion" },
    { id: "historical", label: "History", icon: "scroll" },
    { id: "contrarian", label: "Contrarian", icon: "compass" },
    { id: "tides", label: "Tides", icon: "wave" },
    { id: "weather", label: "Weather", icon: "cloud-sun" },
    { id: "horoscope", label: "Horoscope", icon: "sparkle" },
  ];

  // Watchlist tickers for right sidebar
  const watchlistTickers = [
    { ticker: "SPY", name: "S&P 500" },
    { ticker: "QQQ", name: "Nasdaq 100" },
    { ticker: "AAPL", name: "Apple" },
    { ticker: "NVDA", name: "NVIDIA" },
    { ticker: "MSFT", name: "Microsoft" },
    { ticker: "TSLA", name: "Tesla" },
    { ticker: "AMZN", name: "Amazon" },
    { ticker: "GLD", name: "Gold" },
  ];

  // Macro bullet points for right sidebar
  const macroBullets = [
    { text: `CPI at ${macroDashboardData[0]?.value || 3.4}% YoY — ${(macroDashboardData[0]?.value || 0) > (macroDashboardData[0]?.prev || 0) ? "rising" : "cooling"}`, signal: macroDashboardData[0]?.signal || "bearish" },
    { text: `Unemployment steady at ${macroDashboardData[3]?.value || 3.7}%`, signal: macroDashboardData[3]?.signal || "neutral" },
    { text: `NFP +${macroDashboardData[2]?.value || 353}K jobs added`, signal: macroDashboardData[2]?.signal || "bullish" },
  ];

  return (
    <div style={{ fontFamily: "'Quicksand',sans-serif", background: "#FFFDF5", height: "100%", width: "100%", position: "relative", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{STYLES}</style>

        {/* ── Header Bar ── */}
        <header className="web-header">
          <div className="web-header-brand" onClick={() => { setPage("dashboard"); setSelectedBasket(null); setPortfolioView(false); setViewStockTicker(null); setViewIndicatorId(null); }}>
            <svg width="28" height="28" viewBox="0 0 64 64" style={{ animation: "basketBounce 2.5s ease-in-out infinite" }}>
              <defs>
                <linearGradient id="bsk" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D4A76A"/><stop offset="100%" stopColor="#A67C52"/></linearGradient>
                <linearGradient id="bskH" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C49A5C"/><stop offset="100%" stopColor="#8B6914"/></linearGradient>
              </defs>
              <path d="M16 26 Q32 4 48 26" fill="none" stroke="url(#bskH)" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M10 28 L14 50 Q32 54 50 50 L54 28 Z" fill="url(#bsk)" stroke="#8B6914" strokeWidth="1"/>
              <rect x="8" y="26" width="48" height="4" rx="2" fill="#C49A5C" stroke="#8B6914" strokeWidth="0.8"/>
              <ellipse cx="24" cy="24" rx="7.5" ry="9.5" fill="#FFF8E1" stroke="#F0D9A0" strokeWidth="1"/>
              <ellipse cx="40" cy="24" rx="7" ry="9" fill="#FAFAFA" stroke="#E0E0E0" strokeWidth="1"/>
              <ellipse cx="32" cy="21" rx="7.5" ry="9.5" fill="#FFF9C4" stroke="#FFE082" strokeWidth="1"/>
            </svg>
            <span style={{ fontWeight: 900, fontSize: 20, fontFamily: "'Instrument Serif', serif", background: "linear-gradient(135deg,#C48830,#D4A03C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Hatch</span>
          </div>

          {/* Timestamp + Live indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "JetBrains Mono", color: "#A09080", letterSpacing: 0.3 }}>
              {currentTime.toLocaleDateString("en-US", { month: "short", day: "numeric" })} {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
            {isLive && <>
              <span style={{ width: 1, height: 14, background: "#F0E6D0" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5B8C5A", animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#5B8C5A", letterSpacing: 1, textTransform: "uppercase" }}>Live</span>
              </div>
            </>}
          </div>

          {/* Search Bar with dropdown results */}
          <div style={{ position: "relative", marginLeft: 16, flex: 1, maxWidth: 480 }}>
            <div className="web-header-search">
              <Icon name="search" size={13} color="#C8B898" />
              <input
                type="text"
                placeholder="Search tickers, baskets..."
                value={stockSearch}
                onChange={e => setStockSearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && stockSearch.trim()) {
                    const ticker = stockSearch.trim().toUpperCase();
                    if (/^[A-Z.]{1,6}$/.test(ticker)) { goToStock(ticker); setStockSearch(""); }
                  }
                  if (e.key === "Escape") setStockSearch("");
                }}
              />
              {stockSearch && <button onClick={() => setStockSearch("")} style={{ border: "none", background: "#F0E6D0", borderRadius: "50%", width: 16, height: 16, cursor: "pointer", fontSize: 10, color: "#33333480", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>}
            </div>
            {stockSearch.length >= 1 && (() => {
              const q = stockSearch.toUpperCase();
              const searchStockNames = { XOM:"Exxon Mobil", CVX:"Chevron", GLD:"SPDR Gold", "BRK.B":"Berkshire Hathaway", COST:"Costco", AAPL:"Apple", MSFT:"Microsoft", GOOGL:"Alphabet", AMZN:"Amazon", NVDA:"NVIDIA", AMD:"AMD", AVGO:"Broadcom", TSLA:"Tesla", COIN:"Coinbase", LMT:"Lockheed Martin", RTX:"RTX Corp", GD:"General Dynamics", NOC:"Northrop Grumman", O:"Realty Income", AMT:"American Tower", XLU:"Utilities ETF", TLT:"20+ Yr Treasury", PLD:"Prologis", JNJ:"Johnson & Johnson", PG:"Procter & Gamble", WMT:"Walmart", KO:"Coca-Cola", MCD:"McDonald's", PEP:"PepsiCo", MMM:"3M", ENPH:"Enphase Energy", SEDG:"SolarEdge", FSLR:"First Solar", RUN:"Sunrun", PLUG:"Plug Power", PLTR:"Palantir", PATH:"UiPath", ISRG:"Intuitive Surgical", TQQQ:"ProShares 3x QQQ", SPXL:"Direxion 3x SPX", ARKK:"ARK Innovation", UNH:"UnitedHealth", LLY:"Eli Lilly", ABBV:"AbbVie", MRK:"Merck", TMO:"Thermo Fisher" };
              const results = Object.entries(explorerStockPrices).filter(([ticker]) => {
                const name = (searchStockNames[ticker] || "").toUpperCase();
                return ticker.toUpperCase().includes(q) || name.includes(q);
              }).slice(0, 6);
              if (results.length === 0) return (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: "#fff", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,.12)", border: "1px solid #F0E6D0", padding: "12px 14px", textAlign: "center", zIndex: 200, minWidth: 280 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#33333480" }}>No results for "{stockSearch}"</div>
                </div>
              );
              return (
                <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, background: "#fff", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,.12)", border: "1px solid #F0E6D0", overflow: "hidden", zIndex: 200, minWidth: 280 }}>
                  <div style={{ padding: "5px 12px", background: "#FFFDF5", borderBottom: "1px solid #33333415" }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "#33333460", textTransform: "uppercase", letterSpacing: 0.5 }}>Stocks</span>
                  </div>
                  {results.map(([ticker, price], i) => (
                    <div key={ticker} onClick={() => { goToStock(ticker); setStockSearch(""); }}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderBottom: i < results.length - 1 ? "1px solid #FFF5E6" : "none", cursor: "pointer", transition: "background .1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#FFFDF5"}
                      onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                      <StockLogo ticker={ticker} size={22} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 800, color: "#333334" }}>{ticker}</div>
                        <div style={{ fontSize: 10, color: "#33333480", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{searchStockNames[ticker] || ticker}</div>
                      </div>
                      <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 700, color: "#333334" }}>${price >= 1000 ? (price / 1000).toFixed(2) + "k" : price.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Header Navigation: Market, Calendar, Account */}
          <div className="web-header-nav">
            {headerNavItems.map(p => {
              const isActive = page === p.id && !selectedBasket;
              return (
                <div key={p.id} className={`web-header-item${isActive ? " active" : ""}`}
                  onClick={() => { setPage(p.id); setSelectedBasket(null); setPortfolioView(false); setViewStockTicker(null); setViewIndicatorId(null); }}>
                  <Icon name={p.icon} size={14} color={isActive ? "#C48830" : "#A09080"} />
                  <span>{p.label}</span>
                  {p.id === "calendar" && todayEvents > 0 && <span style={{ marginLeft: 2, width: 16, height: 16, borderRadius: "50%", background: "#FFA726", color: "#fff", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{todayEvents}</span>}
                </div>
              );
            })}

            {/* Cart button in header */}
            {cart.length > 0 && <div onClick={() => setShowCheckout(true)}
              style={{ padding: "6px 12px", background: "linear-gradient(135deg,#C48830,#D4A03C)", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
              <Icon name="cart" size={13} color="#fff" />
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 12, fontFamily: "Quicksand" }}>{cart.length}</span>
            </div>}
          </div>
        </header>

        {notification && <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 350, background: "#fff", color: "#C48830", padding: "10px 24px", borderRadius: 14, fontSize: 17, fontWeight: 800, animation: "popIn .3s ease", boxShadow: "0 6px 20px rgba(0,0,0,.1)", border: "1px solid #33333440", whiteSpace: "nowrap" }}>{notification}</div>}

        {/* ── Body: Sidebar + Content + Right Sidebar ── */}
        <div className="web-body">

        {/* ── Left Sidebar (auto-collapses on mouse leave) ── */}
        <nav className="web-sidebar">
          {/* Home */}
          <div className={`web-sidebar-item${page === "dashboard" && !selectedBasket ? " active" : ""}`}
            onClick={() => { setPage("dashboard"); setSelectedBasket(null); setPortfolioView(false); setViewStockTicker(null); setViewIndicatorId(null); }}>
            <Icon name="home" size={16} color={page === "dashboard" && !selectedBasket ? "#C48830" : "#A09080"} />
            <span>Home</span>
          </div>

          {/* Market */}
          <div className={`web-sidebar-item${page === "explorer" && !selectedBasket ? " active" : ""}`}
            onClick={() => { setPage("explorer"); setSelectedBasket(null); setPortfolioView(false); setViewStockTicker(null); setViewIndicatorId(null); }}>
            <Icon name="cart" size={16} color={page === "explorer" && !selectedBasket ? "#C48830" : "#A09080"} />
            <span>Market</span>
          </div>

          {/* RISC Labs - clickable item that reveals subtabs */}
          <div className={`web-sidebar-item${page === "risklab" && !selectedBasket ? " active" : ""}`}
            onClick={() => { setPage("risklab"); setRiskLabTab("risklab"); setSelectedBasket(null); setPortfolioView(false); setViewStockTicker(null); setViewIndicatorId(null); }}>
            <Icon name="flask" size={16} color={page === "risklab" && !selectedBasket ? "#C48830" : "#A09080"} />
            <span>RISC Labs</span>
          </div>

          {/* RISC Labs subtabs - only shown when RiskLab page is active */}
          {page === "risklab" && riscLabTabs.filter(t => t.id !== "risklab").map(t => {
            const isActive = riskLabTab === t.id && !selectedBasket;
            return (
              <div key={t.id} className={`web-sidebar-item${isActive ? " active" : ""}`}
                style={{ paddingLeft: 32 }}
                onClick={() => { setRiskLabTab(t.id); setSelectedBasket(null); setPortfolioView(false); setViewStockTicker(null); setViewIndicatorId(null); }}>
                <Icon name={t.icon} size={13} color={isActive ? "#C48830" : "#B0A090"} />
                <span style={{ fontSize: 12 }}>{t.label}</span>
              </div>
            );
          })}

          {/* Divider */}
          <div style={{ height: 1, background: "#F0E6D0", margin: "8px 12px" }} />

          {/* Macro */}
          {(() => { const isActive = page === "macro" && !selectedBasket; return (
            <div className={`web-sidebar-item${isActive ? " active" : ""}`}
              onClick={() => { setPage("macro"); setSelectedBasket(null); setPortfolioView(false); setViewStockTicker(null); setViewIndicatorId(null); }}>
              <Icon name="globe" size={16} color={isActive ? "#C48830" : "#A09080"} />
              <span>Macro</span>
              {critCount > 0 && <span style={{ marginLeft: "auto", width: 16, height: 16, borderRadius: "50%", background: "#EF5350", color: "#fff", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{critCount}</span>}
            </div>
          ); })()}

          {/* News */}
          {(() => { const isActive = page === "news" && !selectedBasket; return (
            <div className={`web-sidebar-item${isActive ? " active" : ""}`}
              onClick={() => { setPage("news"); setSelectedBasket(null); setPortfolioView(false); setViewStockTicker(null); setViewIndicatorId(null); }}>
              <Icon name="newspaper" size={16} color={isActive ? "#C48830" : "#A09080"} />
              <span>News</span>
            </div>
          ); })()}

          {/* Spacer to push Hatch AI to bottom */}
          <div style={{ flex: 1 }} />

          {/* Divider */}
          <div style={{ height: 1, background: "#F0E6D0", margin: "8px 12px" }} />

          {/* Hatch AI */}
          <div className={`web-sidebar-item${aiChatOpen ? " active" : ""}`}
            onClick={() => setAiChatOpen(!aiChatOpen)}
            style={{ marginBottom: 8 }}>
            <svg width={18} height={22} viewBox="0 0 56 70" fill="none" style={{ flexShrink: 0, animation: aiChatOpen ? "none" : "eggGlow 2.5s ease infinite" }}>
              <defs>
                <radialGradient id="sidebarEgg" cx="50%" cy="38%" r="62%">
                  <stop offset="0%" stopColor="#FFE07A" />
                  <stop offset="35%" stopColor="#DDA630" />
                  <stop offset="70%" stopColor="#C08A20" />
                  <stop offset="100%" stopColor="#9A6A14" />
                </radialGradient>
                <radialGradient id="sidebarEggHi" cx="55%" cy="22%" r="38%">
                  <stop offset="0%" stopColor="#FFF4C8" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#F0C048" stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="28" cy="37" rx="22" ry="28" fill="url(#sidebarEgg)" />
              <ellipse cx="28" cy="37" rx="22" ry="28" fill="url(#sidebarEggHi)" />
            </svg>
            <span>Hatch AI</span>
          </div>
        </nav>

        {/* ── Scrollable Content ── */}
        <div className="web-content" ref={scrollRef} onScroll={(e) => {
          if (page === "dashboard") {
            const st = e.target.scrollTop;
            setHeaderCollapsed(st > 30);
          }
        }}>
        <div className="web-content-inner">
        {selectedBasket && <BasketDetail basket={selectedBasket} onBack={() => setSelectedBasket(null)} onGoToStock={goToStock} />}

        {/* ══ PORTFOLIO FULL VIEW ══ */}
        {portfolioView && !selectedBasket && (() => {
          const tv = myBaskets.reduce((s, b) => s + b.value, 0);
          const tc = myBaskets.reduce((s, b) => s + b.costBasis, 0);
          const tp = tv - tc;
          const dp = myBaskets.reduce((s, b) => s + b.dayPL, 0);
          const allStks = [];
          [...myBaskets, ...customBaskets].forEach(b => {
            const sts = basketStocks[b.id] || [];
            sts.forEach(st => allStks.push({ ...st, basket: b.name, basketIcon: b.icon, basketColor: b.color, basketId: b.id }));
          });
          allStks.sort((a, bb) => {
            const plA = (a.current - a.avgCost) * a.shares * ((a.dir || "long") === "short" ? -1 : 1);
            const plB = (bb.current - bb.avgCost) * bb.shares * ((bb.dir || "long") === "short" ? -1 : 1);
            return plB - plA;
          });
          return (
            <div style={{ animation: "slideRight .4s ease both" }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <button onClick={() => setPortfolioView(false)} style={{ width: 30, height: 30, borderRadius: 10, border: "1px solid #33333440", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#C48830" }}>←</button>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: "#333334" }}>Portfolio Overview</div>
                  <div style={{ fontSize: 14, color: "#33333480" }}>{myBaskets.length} baskets · {allStks.length} holdings</div>
                </div>
              </div>

              {/* Portfolio Value Hero */}
              <div style={{ background: "#fff", borderRadius: 16, padding: 14, marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#33333480", textTransform: "uppercase", marginBottom: 2 }}>Total Portfolio Value</div>
                <div style={{ fontSize: 36, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: "#333334", letterSpacing: "-1px" }}>{fmt(tv)}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700, color: tp >= 0 ? "#5B8C5A" : "#EF5350" }}>{tp >= 0 ? "+" : ""}{fmtS(Math.round(tp))} total</span>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700, color: dp >= 0 ? "#5B8C5A" : "#EF5350", background: dp >= 0 ? "#EDF5ED" : "#FFEBEE", padding: "2px 6px", borderRadius: 5 }}>{dp >= 0 ? "+" : ""}{fmtS(Math.round(dp))} today</span>
                </div>
              </div>

              {/* Basket Breakdown */}
              <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 6 }}>Basket Breakdown</div>
                {myBaskets.map((b, i) => {
                  const c = CL[b.color] || CL.terracotta;
                  const pct = tv > 0 ? (b.value / tv * 100).toFixed(1) : 0;
                  return (
                    <div key={b.id} onClick={() => { setPortfolioView(false); if (basketStocks[b.id]) setSelectedBasket(b); }}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none", cursor: "pointer" }}>
                      <Icon name={b.icon} size={16} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: "#333334" }}>{b.name}</div>
                        <div style={{ height: 4, background: "#F5F0E8", borderRadius: 2, marginTop: 3 }}>
                          <div style={{ height: "100%", width: pct + "%", background: c.a, borderRadius: 2 }} />
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700 }}>{fmt(b.value)}</div>
                        <div style={{ fontSize: 12, color: "#33333480" }}>{pct}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* All Holdings (sparkline rows) */}
              <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ padding: "8px 12px", borderBottom: "1.5px solid #F0E6D0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: "#333334" }}>All Holdings</span>
                  <span style={{ fontSize: 12, color: "#33333480", fontWeight: 600 }}>{allStks.length} instruments</span>
                </div>
                {allStks.map((st, i) => {
                  const pl = (st.current - st.avgCost) * st.shares * ((st.dir || "long") === "short" ? -1 : 1);
                  const plPct = ((st.current - st.avgCost) / st.avgCost * 100) * ((st.dir || "long") === "short" ? -1 : 1);
                  const sparkData = genSparkline(st.avgCost, st.current, st.ticker, st._sparkCloses);
                  const sparkColor = st.change >= 0 ? "#5B8C5A" : "#EF5350";
                  const c2 = CL[st.basketColor] || CL.terracotta;
                  return (
                    <div key={st.ticker + st.basket + i} onClick={() => goToStock(st.ticker)}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderBottom: i < allStks.length - 1 ? "1px solid #F0E6D0" : "none", transition: "background .15s", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#FFFDF5"} onMouseLeave={e => e.currentTarget.style.background = ""}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: "#333334", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{st.name || st.ticker}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 1 }}>
                          <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: "#33333480", fontWeight: 600 }}>{st.ticker}</span>
                          <span style={{ fontSize: 11, color: "#33333480" }}>·</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: c2.a, background: c2.l, padding: "0px 4px", borderRadius: 3, display: "inline-flex", alignItems: "center", gap: 2 }}><Icon name={st.basketIcon} size={7} color={c2.a} />{st.basket.split(" ")[0]}</span>
                        </div>
                      </div>
                      <div style={{ width: 54, flexShrink: 0 }}>
                        <SparkSVG data={sparkData} color={sparkColor} w={54} h={18} />
                      </div>
                      <div style={{ textAlign: "right", minWidth: 64, flexShrink: 0 }}>
                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 800, color: "#333334" }}>
                          ${st.current >= 1000 ? st.current.toLocaleString() : st.current.toFixed(2)}
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2, marginTop: 1 }}>
                          <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", fontWeight: 700, color: pl >= 0 ? "#5B8C5A" : "#EF5350" }}>
                            {pl >= 0 ? "+" : ""}{Math.abs(pl) >= 1000 ? (pl / 1000).toFixed(1) + "k" : Math.round(pl)}
                          </span>
                          <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 3px", borderRadius: 3, background: (plPct >= 0 ? "#5B8C5A" : "#EF5350") + "14", color: plPct >= 0 ? "#5B8C5A" : "#EF5350" }}>
                            {plPct >= 0 ? "+" : ""}{plPct.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Portfolio Risk Metrics */}
              <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 7 }}>Portfolio Risk Metrics</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 8 }}>
                  {[
                    { label: "Sharpe", val: portfolioRisk.sharpe.toFixed(2), good: portfolioRisk.sharpe > 1, icon: "ruler" },
                    { label: "Beta", val: portfolioRisk.beta.toFixed(2), good: portfolioRisk.beta < 1.3, icon: "chart-bar" },
                    { label: "Vol", val: portfolioRisk.volatility.toFixed(1) + "%", good: portfolioRisk.volatility < 20, icon: "wave" },
                    { label: "Max DD", val: portfolioRisk.maxDrawdown.toFixed(1) + "%", good: portfolioRisk.maxDrawdown > -15, icon: "chart-down" },
                    { label: "VaR 95%", val: fmtS(portfolioRisk.var95), good: false, icon: "warning" },
                    { label: "Calmar", val: portfolioRisk.calmar.toFixed(2), good: portfolioRisk.calmar > 1, icon: "target" },
                  ].map((m, mi) => (
                    <div key={mi} style={{ background: m.good ? "#EDF5ED" : "#FFEBEE", borderRadius: 8, padding: "6px 6px", textAlign: "center" }}>
                      <div style={{ marginBottom: 1 }}><Icon name={m.icon} size={11} /></div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#33333480", textTransform: "uppercase" }}>{m.label}</div>
                      <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 800, color: m.good ? "#5B8C5A" : "#EF5350" }}>{m.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "6px 8px", background: portfolioRisk.sectorConcentration > 40 ? "#FFEBEE" : "#FFF8EE", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, fontFamily: "'Instrument Serif', serif" }}>Concentration</div>
                    <div style={{ fontSize: 11, color: "#8A7040" }}>Top: {portfolioRisk.topHolding.ticker} ({portfolioRisk.topHolding.pct}%)</div>
                  </div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700, color: "#EF5350" }}>{portfolioRisk.sectorConcentration}%</div>
                </div>
              </div>

              {/* Per-Hatch Metrics */}
              <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 7 }}>Per-Hatch Metrics</div>
                <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #F0E6D0" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.4fr .7fr .7fr .7fr", padding: "6px 10px", background: "#FFFDF5", fontSize: 11, fontWeight: 800, color: "#33333480", textTransform: "uppercase", letterSpacing: .5, borderBottom: "1.5px solid #F0E6D0" }}>
                    <div>Basket</div><div>Sharpe</div><div>Beta</div><div>Alpha</div>
                  </div>
                  {myBaskets.map((b, mi) => { const brm = basketRiskMetrics[b.id]; if (!brm) return null; return (
                    <div key={b.id} style={{ display: "grid", gridTemplateColumns: "1.4fr .7fr .7fr .7fr", padding: "6px 10px", borderBottom: mi < myBaskets.length - 1 ? "1px solid #F0E6D0" : "none", fontSize: 15, alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}><Icon name={b.icon} size={9} /><span style={{ fontWeight: 700, fontFamily: "'Instrument Serif', serif", fontSize: 12 }}>{b.name}</span></div>
                      <div style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 14, color: brm.sharpe > 1 ? "#C48830" : "#FFA726" }}>{brm.sharpe.toFixed(2)}</div>
                      <div style={{ fontFamily: "JetBrains Mono", fontWeight: 600, fontSize: 14, color: brm.beta < 1.3 ? "#5B8C5A" : "#EF5350" }}>{brm.beta.toFixed(2)}</div>
                      <div style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 14, color: brm.alpha > 0 ? "#5B8C5A" : "#EF5350" }}>{brm.alpha > 0 ? "+" : ""}{brm.alpha.toFixed(1)}%</div>
                    </div>); })}
                </div>
              </div>

              {/* Factor Exposures */}
              <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 7 }}>Factor Exposures</div>
                {factorExposures.map((f, fi) => {
                  const overweight = f.exposure > f.benchmark;
                  return (
                    <div key={fi} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0", borderTop: fi > 0 ? "1px solid #F0E6D020" : "none" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#333334", width: 55 }}>{f.factor}</span>
                      <div style={{ flex: 1, position: "relative", height: 8, background: "#F5F0E8", borderRadius: 4 }}>
                        <div style={{ position: "absolute", left: (f.benchmark * 100) + "%", top: 0, bottom: 0, width: 1.5, background: "#A0908066", zIndex: 1 }} />
                        <div style={{ height: "100%", width: (f.exposure * 100) + "%", background: overweight ? "#C48830" : "#5B8C5A", borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", fontWeight: 800, color: overweight ? "#C48830" : "#5B8C5A", minWidth: 24, textAlign: "right" }}>{(f.exposure * 100).toFixed(0)}%</span>
                    </div>
                  );
                })}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: 11, color: "#33333480" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 8, height: 2, background: "#A0908066", borderRadius: 1 }} /><span>Benchmark</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 8, height: 4, background: "#C48830", borderRadius: 1 }} /><span>Overweight</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 8, height: 4, background: "#5B8C5A", borderRadius: 1 }} /><span>Underweight</span></div>
                </div>
              </div>

              {/* Basket Correlations */}
              <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", marginBottom: 7 }}>Basket Correlations</div>
                <div className="correlation-scroll mobile-scroll-x" style={{ display: "grid", gridTemplateColumns: "80px repeat(" + myBaskets.length + ", 1fr)", gap: 4, fontSize: 14 }}>
                  <div />
                  {myBaskets.map(b => <div key={b.id} style={{ textAlign: "center", fontWeight: 800, padding: 4, fontSize: 12 }}><Icon name={b.icon} size={8} /> {b.name.split(" ")[0]}</div>)}
                  {myBaskets.map((b, ri) => (
                    <React.Fragment key={b.id}>
                      <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 3, padding: "3px 0" }}><Icon name={b.icon} size={10} /><span style={{ fontSize: 12 }}>{b.name.split(" ")[0]}</span></div>
                      {basketCorrelations[ri] && basketCorrelations[ri].map((cv, ci) => {
                        const abs = Math.abs(cv);
                        const bg = ri === ci ? "#FFF5E6" : cv > 0.5 ? "rgba(232,116,97," + (abs * 0.4) + ")" : cv < -0.05 ? "rgba(91,155,213," + (abs * 0.6) + ")" : "rgba(107,155,110," + (abs * 0.3) + ")";
                        return <div key={ci} style={{ textAlign: "center", padding: "8px 2px", borderRadius: 6, background: bg, fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 15, color: ri === ci ? "#A09080" : "#5C4A1E" }}>{cv.toFixed(2)}</div>;
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ══ DASHBOARD ══ */}
        {page === "dashboard" && !selectedBasket && !portfolioView && <div>

          {/* ── Macro Regime Mini-Banner (TOP) ── */}
          <div onClick={() => setPage("macro")} style={{ background: displayRegime.bg, border: `1.5px solid ${displayRegime.color}33`, borderRadius: 12, padding: "8px 10px", marginBottom: 8, cursor: "pointer", transition: "all .3s", animation: "fadeUp .3s ease both" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = displayRegime.color} onMouseLeave={e => e.currentTarget.style.borderColor = displayRegime.color + "33"}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name={currentRegime.icon} size={11} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#33333480", textTransform: "uppercase", letterSpacing: .8 }}>Macro Regime</div>
                  <div style={{ fontSize: 17, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: currentRegime.color }}>{currentRegime.name} <span style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 700, opacity: .7 }}>{currentRegime.confidence}%</span></div>
                </div>
              </div>
              <span style={{ fontSize: 14, color: currentRegime.color, fontWeight: 800 }}>Details →</span>
            </div>
          </div>

          {/* ── Portfolio Hero ── */}
          <div style={{ background: "#fff", borderRadius: 18, padding: "18px 16px 14px", marginBottom: 7, animation: "fadeUp .4s ease .05s both", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 8, right: 50, fontSize: 17, opacity: 0.12, animation: "float 4s ease-in-out infinite" }}></div>
            <div style={{ position: "absolute", top: 30, right: 16, fontSize: 18, opacity: 0.08, animation: "float 3.5s ease-in-out .5s infinite" }}></div>
            <div style={{ position: "relative", zIndex: 1 }}>
              {(() => {
                const currentVal = 41240;
                const displayVal = chartHover ? chartHover.v : currentVal;
                const displayLabel = chartHover ? chartHover.l : null;
                const baseVal = portfolioHistory[0].v;
                const changeDollar = chartHover ? (chartHover.v - baseVal) : 771;
                const changePct = chartHover ? (((chartHover.v - baseVal) / baseVal) * 100) : 1.90;
                const isPositive = changeDollar >= 0;
                const changeColor = isPositive ? "#5B8C5A" : "#EF5350";
                return (<>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#8B6914", marginBottom: 3 }}>
                    {chartHover ? <span style={{ transition: "all .15s" }}>{displayLabel}</span> : "Good morning, John"}
                  </div>
                  <div style={{ fontSize: 39, fontWeight: 900, fontFamily: "'Instrument Serif', serif", letterSpacing: "-1px", lineHeight: 1.1, color: "#333334", transition: "all .15s" }}>
                    ${displayVal >= 1000 ? displayVal.toLocaleString() : displayVal}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700, color: changeColor, transition: "all .15s" }}>{isPositive ? "+" : ""}{fmt(Math.abs(changeDollar))}</span>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 700, color: changeColor, background: isPositive ? "#EDF5ED" : "#FFEBEE", padding: "2px 8px", borderRadius: 8, transition: "all .15s" }}>{isPositive ? "+" : ""}{changePct.toFixed(2)}%</span>
                    <span style={{ fontSize: 15, color: "#8A7A68", fontWeight: 600 }}>{chartHover ? "from Jan" : "Today"}</span>
                  </div>
                </>);
              })()}
            </div>
            <div style={{ margin: "18px 0 10px" }}>
              <MiniChart data={portfolioHistory} color="#C48830" chartId="main" onHover={setChartHover} />
            </div>
            <div style={{ display: "flex", gap: 1, background: "#FFFDF5", borderRadius: 8, padding: 2, width: "fit-content" }}>
              {["1D","1W","1M","3M","1Y","ALL"].map(t => <button key={t} style={{ padding: "3px 8px", borderRadius: 6, border: "none", background: t === "1Y" ? "#fff" : "transparent", color: t === "1Y" ? "#C48830" : "#A09080", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Quicksand", boxShadow: t === "1Y" ? "0 1px 4px rgba(0,0,0,.06)" : "none" }}>{t}</button>)}
            </div>
          </div>

          {/* ── Alerts (auto-rotating) ── */}
          <div style={{ marginBottom: 8 }}>
            <AlertsWidget alerts={macroAlerts} onViewAll={() => setPage("macro")} />
          </div>

          {/* ── Trade Signals ── */}
          <div style={{ marginBottom: 8, animation: "fadeUp .4s ease .15s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 17 }}></span>
                <span style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Instrument Serif', serif" }}>Trade Signals</span>
                <span style={{ fontSize: 15, fontWeight: 800, background: "#FFF8EE", color: "#C48830", padding: "2px 8px", borderRadius: 10 }}>{displaySignals.filter(s => s.status === "pending").length} pending</span>
              </div>
              <button onClick={() => setPage("risklab")} style={{ background: "none", border: "none", color: "#C48830", fontWeight: 800, fontSize: 17, cursor: "pointer" }}>View All →</button>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {displaySignals.slice(0, 4).map(s => {
                const sigCol = { BUY: "#C48830", SELL: "#EF5350", HOLD: "#FFA726", TRIM: "#FFA726" };
                const sigBg = { BUY: "#FFF8EE", SELL: "#FFEBEE", HOLD: "#FFF3E0", TRIM: "#FFF3E0" };
                return (
                  <div key={s.id} onClick={() => goToStock(s.ticker)} style={{ flex: "1 1 calc(50% - 4px)", minWidth: 0, background: "#fff", border: "1px solid #33333420", borderRadius: 12, padding: "7px 10px", cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <span style={{ fontSize: 12, fontWeight: 900, padding: "1px 5px", borderRadius: 4, background: sigBg[s.signal], color: sigCol[s.signal] }}>{s.signal}</span>
                      <span style={{ fontSize: 12, color: "#33333480" }}>{s.time}</span>
                    </div>
                    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                      <span style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 800 }}>{s.ticker}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#8A7040", lineHeight: 1.3, marginTop: 2 }}>{s.reason.slice(0, 50)}...</div>
                    <div style={{ marginTop: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ height: 3, flex: 1, background: "#FFF5E6", borderRadius: 2, marginRight: 6 }}>
                        <div style={{ height: "100%", width: s.strength + "%", background: sigCol[s.signal], borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", fontWeight: 700, color: sigCol[s.signal] }}>{s.strength}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── My Baskets ── */}
          <div style={{ marginBottom: 8, animation: "fadeUp .5s ease .3s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>My Baskets</div>
                <button onClick={() => setShowCreate(true)} style={{ background: "#C48830", color: "#fff", border: "none", padding: "4px 8px", borderRadius: 8, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>+ New</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span onClick={() => setBasketView("baskets")} style={{ cursor: "pointer", transition: "color .2s" }}>⊞</span>
                <span onClick={() => setBasketView("stocks")} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}><Icon name="list" size={15} color={basketView === "stocks" ? "#C48830" : "#D0C8B8"} /></span>
                <span onClick={() => setPortfolioView(true)} style={{ fontSize: 15, fontWeight: 800, color: "#C48830", cursor: "pointer", fontFamily: "Quicksand" }}>View →</span>
              </div>
            </div>

            {/* Create CTA */}
            <div onClick={() => setShowCreate(true)} style={{ background: "linear-gradient(135deg,#fff,#FFF8EE)", border: "2px dashed #FFA726", borderRadius: 18, padding: "18px 20px", marginBottom: 7, cursor: "pointer", transition: "all .3s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#C48830"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#FFA726"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="egg" size={24} color="#C48830" /></div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 17, fontWeight: 900, fontFamily: "'Instrument Serif', serif" }}>Create Your Own Hatch</div><div style={{ fontSize: 17, color: "#8A7040", marginTop: 1 }}>Mix stocks, options, futures & crypto</div></div>
                <div style={{ display: "flex", gap: 4 }}>{["chart-up","chart-bar","hourglass","bitcoin"].map(t => <span key={t} style={{ background: "#fff", width: 28, height: 28, borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name={t} size={14} color="#C48830" /></span>)}</div>
              </div>
            </div>

            {/* ── Baskets View (rich cards, clickable) ── */}
            {basketView === "baskets" && (() => { const _allBkts = [...myBaskets, ...customBaskets]; const _maxChg = Math.max(..._allBkts.map(b => b.change)); const _maxRetPct = Math.max(..._allBkts.filter(b => b.costBasis > 0).map(b => b.totalPL / b.costBasis)); return <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6 }}>
              {_allBkts.map((b, i) => { const c = CL[b.color] || CL.terracotta; const health = getBasketHealth(b); const isBad = health.status === "critical" || health.status === "warning"; const retPct = b.costBasis > 0 ? b.totalPL / b.costBasis : 0; const isHighestReturn = retPct === _maxRetPct && _maxRetPct > 0; const isTrendiest = b.change === _maxChg && _maxChg > 0; return (
                <div key={b.id} onClick={() => { if (basketStocks[b.id]) setSelectedBasket(b); }} style={{ background: isHighestReturn ? "#FFFDF0" : "#FFFDF5", border: `2px solid ${isHighestReturn ? "#DAA52066" : isBad ? health.clr + "44" : "#F0E6D0"}`, borderRadius: 18, cursor: "pointer", transition: "all .3s", overflow: "hidden" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = isHighestReturn ? "#DAA520" : c.a; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = isHighestReturn ? "#DAA52066" : isBad ? health.clr + "44" : "#F0E6D0"; e.currentTarget.style.transform = ""; }}>
                  <div style={{ background: isHighestReturn ? "linear-gradient(135deg, #FFF8E1, #FFF3CD)" : c.l, padding: "10px 16px 8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{isHighestReturn ? <Icon name="egg" size={14} color="#DAA520" /> : <Icon name={b.icon} size={12} />}<div><div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: isHighestReturn ? "#B8860B" : undefined }}>{b.name}</div><div style={{ fontSize: 14, color: isHighestReturn ? "#DAA520" : c.a, fontWeight: 700, textTransform: "uppercase" }}>{b.strategy}</div></div></div>
                      <div style={{ textAlign: "right" }}><div style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 700, color: isHighestReturn ? "#DAA520" : undefined }}>{b.value > 0 ? fmt(b.value) : "—"}</div>{b.change !== 0 && <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>{isTrendiest && !isHighestReturn && <Icon name="fire" size={12} color="#FF6B35" />}<span style={{ fontSize: 15, fontWeight: 700, color: isHighestReturn ? "#DAA520" : b.change >= 0 ? "#5B8C5A" : "#EF5350" }}>{b.change >= 0 ? "+" : ""}{b.change}%</span></div>}</div>
                    </div>
                  </div>
                  <div style={{ padding: "8px 16px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, padding: "5px 8px", background: health.bg, borderRadius: 8, border: isBad ? `1px solid ${health.clr}33` : "1px solid transparent" }}>
                      {isBad ? <span style={{ width: 18, height: 18, borderRadius: "50%", background: health.clr, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff", fontWeight: 900, flexShrink: 0, animation: health.status === "critical" ? "pulse 2s ease infinite" : "none" }}>!</span> : <Icon name={health.icon} size={10} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: health.clr, fontFamily: "'Instrument Serif', serif" }}>{health.label}</div>
                        <div style={{ fontSize: 12, color: "#8A7040", lineHeight: 1.3, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{health.tip}</div>
                      </div>
                    </div>
                    {b.totalPL !== 0 && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 15, color: "#33333480", fontWeight: 700 }}>P&L</span><span style={{ fontFamily: "JetBrains Mono", fontSize: 17, fontWeight: 700, color: b.totalPL >= 0 ? "#5B8C5A" : "#EF5350" }}>{fmtS(b.totalPL)}</span></div>}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>{b.stocks.slice(0, 5).map(s => <span key={s} onClick={(e) => { e.stopPropagation(); goToStock(s); }} style={{ fontSize: 14, fontFamily: "JetBrains Mono", fontWeight: 600, background: c.l, color: c.a, padding: "2px 6px", borderRadius: 6, cursor: "pointer" }}>{s}</span>)}{b.stocks.length > 5 && <span style={{ fontSize: 14, color: "#33333480" }}>+{b.stocks.length - 5}</span>}</div>
                  </div>
                </div>); })}
            </div>; })()}

            {/* ── Stocks List View (sparkline rows) ── */}
            {basketView === "stocks" && <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #F0E6D0", background: "#fff" }}>
              <div style={{ padding: "8px 12px", borderBottom: "1.5px solid #F0E6D0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: "#333334" }}>All Holdings</span>
                <span style={{ fontSize: 12, color: "#33333480", fontWeight: 600 }}>sorted by P&L</span>
              </div>
              {(() => {
                const allStks = [];
                [...myBaskets, ...customBaskets].forEach(b => {
                  const sts = basketStocks[b.id] || [];
                  sts.forEach(st => allStks.push({ ...st, basket: b.name, basketIcon: b.icon, basketColor: b.color, basketId: b.id }));
                });
                allStks.sort((a, bb) => {
                  const plA = (a.current - a.avgCost) * a.shares * ((a.dir || "long") === "short" ? -1 : 1);
                  const plB = (bb.current - bb.avgCost) * bb.shares * ((bb.dir || "long") === "short" ? -1 : 1);
                  return plB - plA;
                });
                return allStks.map((st, i) => {
                  const pl = (st.current - st.avgCost) * st.shares * ((st.dir || "long") === "short" ? -1 : 1);
                  const plPct = ((st.current - st.avgCost) / st.avgCost * 100) * ((st.dir || "long") === "short" ? -1 : 1);
                  const sparkData = genSparkline(st.avgCost, st.current, st.ticker, st._sparkCloses);
                  const sparkColor = st.change >= 0 ? "#5B8C5A" : "#EF5350";
                  const c2 = CL[st.basketColor] || CL.terracotta;
                  return (
                    <div key={st.ticker + st.basket + i} onClick={() => goToStock(st.ticker)}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderBottom: i < allStks.length - 1 ? "1px solid #F0E6D0" : "none", cursor: "pointer", transition: "background .15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#FFFDF5"} onMouseLeave={e => e.currentTarget.style.background = ""}>
                      {/* Left: name + ticker + basket */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: "#333334", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{st.name || st.ticker}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 1 }}>
                          <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: "#33333480", fontWeight: 600 }}>{st.ticker.length > 10 ? st.ticker.slice(0, 10) + ".." : st.ticker}</span>
                          <span style={{ fontSize: 11, color: "#33333480" }}>·</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: c2.a, background: c2.l, padding: "0px 4px", borderRadius: 3, display: "inline-flex", alignItems: "center", gap: 2 }}><Icon name={st.basketIcon} size={7} color={c2.a} />{st.basket.split(" ")[0]}</span>
                        </div>
                      </div>
                      {/* Center: sparkline */}
                      <div style={{ width: 54, flexShrink: 0 }}>
                        <SparkSVG data={sparkData} color={sparkColor} w={54} h={18} />
                      </div>
                      {/* Right: price + P&L */}
                      <div style={{ textAlign: "right", minWidth: 64, flexShrink: 0 }}>
                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 800, color: "#333334" }}>
                          ${st.current >= 1000 ? st.current.toLocaleString() : st.current.toFixed(2)}
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2, marginTop: 1 }}>
                          <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", fontWeight: 700, color: pl >= 0 ? "#5B8C5A" : "#EF5350" }}>
                            {pl >= 0 ? "+" : ""}{Math.abs(pl) >= 1000 ? (pl / 1000).toFixed(1) + "k" : Math.round(pl)}
                          </span>
                          <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 3px", borderRadius: 3, background: (plPct >= 0 ? "#5B8C5A" : "#EF5350") + "14", color: plPct >= 0 ? "#5B8C5A" : "#EF5350" }}>
                            {plPct >= 0 ? "+" : ""}{plPct.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <span style={{ fontSize: 14, color: "#D0C8B8" }}>›</span>
                    </div>
                  );
                });
              })()}
            </div>}
          </div>

          {/* ── Realized P&L (closed trades only) ── */}
          <div style={{ animation: "fadeUp .5s ease .5s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
              <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Instrument Serif', serif" }}>Realized P&L</div>
              <span style={{ fontSize: 12, color: "#33333480", fontWeight: 600 }}>Closed trades only</span>
            </div>
            {(() => {
              const totalRealized = realizedTrades.reduce((s, t) => s + t.pl, 0);
              const wins = realizedTrades.filter(t => t.pl > 0);
              const losses = realizedTrades.filter(t => t.pl < 0);
              return <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
                  <div style={{ background: totalRealized >= 0 ? "#EDF5ED" : "#FFEBEE", borderRadius: 10, padding: "8px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#33333480", fontWeight: 700, textTransform: "uppercase" }}>Net Realized</div>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 18, fontWeight: 800, color: totalRealized >= 0 ? "#5B8C5A" : "#EF5350" }}>{fmtS(Math.round(totalRealized))}</div>
                  </div>
                  <div style={{ background: "#EDF5ED", borderRadius: 10, padding: "8px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#33333480", fontWeight: 700, textTransform: "uppercase" }}>Wins ({wins.length})</div>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 18, fontWeight: 800, color: "#5B8C5A" }}>{fmtS(Math.round(wins.reduce((s, t) => s + t.pl, 0)))}</div>
                  </div>
                  <div style={{ background: "#FFEBEE", borderRadius: 10, padding: "8px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#33333480", fontWeight: 700, textTransform: "uppercase" }}>Losses ({losses.length})</div>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 18, fontWeight: 800, color: "#EF5350" }}>{fmtS(Math.round(losses.reduce((s, t) => s + t.pl, 0)))}</div>
                  </div>
                </div>
                <div style={{ background: "#fff", borderRadius: 12, padding: "4px 10px", overflow: "hidden" }}>
                {realizedTrades.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none" }}>
                    <Icon name={t.icon} size={14} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: "#333334" }}>{t.ticker} <span style={{ fontWeight: 600, color: "#33333480" }}>· {t.shares} shares</span></div>
                      <div style={{ fontSize: 12, color: "#33333480" }}>${t.buyPrice.toFixed(2)} → ${t.sellPrice.toFixed(2)} · {t.date}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 800, color: t.pl >= 0 ? "#5B8C5A" : "#EF5350" }}>{t.pl >= 0 ? "+" : ""}{fmtS(Math.round(t.pl))}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: t.pl >= 0 ? "#5B8C5A" : "#EF5350" }}>{t.pl >= 0 ? "+" : ""}{(((t.sellPrice - t.buyPrice) / t.buyPrice) * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
                </div>
              </>;
            })()}
          </div>
        </div>}


        {/* ══ EXPLORER ══ */}
        {page === "explorer" && !selectedBasket && <div>
          {/* ── Basket Detail Modal ── */}
          {selectedShopBasket && (() => {
            const b = selectedShopBasket;
            const clr = CL[b.color] || CL.terracotta;
            const getShares = (ticker) => (shopShares[b.id + "_" + ticker] || 1);
            const setShareCount = (ticker, delta) => { setShopShares(prev => { const key = b.id + "_" + ticker; return { ...prev, [key]: Math.max(1, (prev[key] || 1) + delta) }; }); };
            const totalCost = b.stocks.reduce((sum, s) => sum + (explorerStockPrices[s] || 0) * getShares(s), 0);
            const inCart = !!cart.find(cc => cc.id === b.id);
            const tickerEmojis = { XOM:"⛽", CVX:"⛽", GLD:"🥇", "BRK.B":"🏢", COST:"🏪", AAPL:"🍎", MSFT:"🪟", GOOGL:"🔍", AMZN:"📦", NVDA:"🎮", AMD:"💎", AVGO:"🛰️", TSLA:"⚡", COIN:"🪙", LMT:"✈️", RTX:"🚀", GD:"🛡️", NOC:"🚁", O:"🏠", AMT:"🛰️", XLU:"💡", TLT:"📜", PLD:"🏗️", JNJ:"💊", PG:"🧼", WMT:"🛒", KO:"🥤", MCD:"🍔", PEP:"🥤", MMM:"🔧", ENPH:"☀️", SEDG:"☀️", FSLR:"🌞", RUN:"🏃", PLUG:"🔌", PLTR:"👁️", PATH:"🤖", ISRG:"🏥", TQQQ:"📈", SPXL:"📊", ARKK:"🚀", UNH:"🏥", LLY:"💉", ABBV:"💊", MRK:"🧬", TMO:"🔬" };
            return (
              <div style={{ position: "absolute", inset: 0, background: "rgba(45,32,22,.5)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setSelectedShopBasket(null)}>
                <div style={{ background: "#FFFDF8", borderRadius: 22, width: "calc(100% - 24px)", maxHeight: 700, overflow: "auto", animation: "popIn .35s ease both" }} onClick={e => e.stopPropagation()}>
                  <div style={{ background: `linear-gradient(135deg, ${clr.a}12, ${clr.a}06)`, padding: "18px 16px 14px", textAlign: "center", position: "relative" }}>
                    <button onClick={() => setSelectedShopBasket(null)} style={{ position: "absolute", top: 12, right: 14, width: 28, height: 28, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.8)", cursor: "pointer", fontSize: 18, color: "#33333480" }}>✕</button>
                    {isLive && <div style={{ position: "absolute", top: 12, left: 14, display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5B8C5A", animation: "pulse 2s infinite" }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#5B8C5A", textTransform: "uppercase", letterSpacing: .5 }}>Live</span>
                    </div>}
                    <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 6px" }}>
                      <div style={{ fontSize: 69, lineHeight: 1 }}>🧺</div>
                      {b.stocks.slice(0, 4).map((t, i) => {
                        const positions = [{ top: -6, left: -8 }, { top: -8, right: -8 }, { top: 22, left: -14 }, { top: 20, right: -14 }];
                        return <span key={t} style={{ position: "absolute", ...positions[i], fontSize: 23, animation: `float ${3 + i * .5}s ease-in-out ${i * .2}s infinite` }}>{tickerEmojis[t] || "📈"}</span>;
                      })}
                    </div>
                    <div style={{ fontSize: 21, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: "#333334" }}><span style={{display:"inline-flex",alignItems:"center",gap:4}}><Icon name={b.icon} size={16} />{b.name}</span></div>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, padding: "2px 7px", borderRadius: 5, background: clr.a + "18", color: clr.a }}>{b.strategy}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#8A7040", lineHeight: 1.4, marginTop: 6, maxWidth: 280, margin: "6px auto 0" }}>{b.desc}</p>
                  </div>
                  <div style={{ padding: "0 12px 12px" }}>
                    <div className="trading-table-header" style={{ display: "grid", gridTemplateColumns: "auto 1fr 58px 36px 40px 52px", padding: "8px 4px 5px", fontSize: 11, fontWeight: 800, color: "#33333480", textTransform: "uppercase", letterSpacing: .5, borderBottom: "1.5px solid #F0E6D0" }}>
                      <div style={{ width: 24 }}></div><div>Item</div><div style={{ textAlign: "right" }}>Price</div><div style={{ textAlign: "right" }}>Chg</div><div style={{ textAlign: "center" }}>Qty</div><div></div>
                    </div>
                    {b.stocks.map((ticker, ti) => {
                      const price = explorerStockPrices[ticker] || 0;
                      const shares = getShares(ticker);
                      const tickerData = livePrices[ticker];
                      const chgPct = tickerData?.changePercent ?? 0;
                      const chgColor = chgPct >= 0 ? "#5B8C5A" : "#EF5350";
                      return (
                        <div key={ticker} className="trading-table-row" style={{ display: "grid", gridTemplateColumns: "auto 1fr 58px 36px 40px 52px", padding: "7px 4px", alignItems: "center", borderBottom: "1px solid #FFF5E6" }}>
                          <div style={{ width: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <StockLogo ticker={ticker} size={20} />
                          </div>
                          <div onClick={() => goToStock(ticker)} style={{ fontFamily: "JetBrains Mono", fontWeight: 800, fontSize: 15, cursor: "pointer", color: "#C48830" }}>{ticker}</div>
                          <div style={{ textAlign: "right", fontFamily: "JetBrains Mono", fontSize: 14, color: "#6B5A2E" }}>${price >= 1000 ? (price / 1000).toFixed(1) + "k" : price.toFixed(0)}</div>
                          <div style={{ textAlign: "right", fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 700, color: chgColor }}>{chgPct >= 0 ? "+" : ""}{chgPct.toFixed(1)}%</div>
                          <div style={{ textAlign: "center", fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 800 }}>{shares}</div>
                          <div style={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                            <button onClick={() => setShareCount(ticker, -1)} style={{ width: 20, height: 20, borderRadius: "50%", border: "1px solid #33333440", background: "#fff", cursor: "pointer", fontSize: 15, color: "#EF5350", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                            <button onClick={() => setShareCount(ticker, 1)} style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid " + clr.a + "44", background: clr.a + "08", cursor: "pointer", fontSize: 15, color: clr.a, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 4px 4px", borderTop: "2px solid #F0E6D0", marginTop: 4 }}>
                      <div>
                        <div style={{ fontSize: 11, color: "#33333480", textTransform: "uppercase", fontWeight: 700 }}>Basket Total</div>
                        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 23, fontWeight: 900, color: "#333334" }}>${totalCost >= 1000 ? (totalCost / 1000).toFixed(1) + "k" : totalCost.toFixed(0)}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <button onClick={() => addToCart(b)} style={{ width: 34, height: 34, borderRadius: 10, border: inCart ? "2px solid #5B8C5A" : "1.5px solid #F0E6D0", background: inCart ? "#E8F5E9" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {inCart ? <span style={{ fontSize: 21 }}>✅</span> : <Icon name="cart" size={14} />}
                        </button>
                        <button onClick={() => { addToCart(b); setShowCheckout(true); setSelectedShopBasket(null); }} style={{ background: "linear-gradient(135deg,#C48830,#D4A03C)", color: "#fff", border: "none", borderRadius: 12, padding: "9px 18px", fontSize: 15, fontWeight: 900, cursor: "pointer", fontFamily: "'Instrument Serif', serif" }}>Buy Now</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── Market Header + Cart ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: "#333334" }}>Market</h1>
              <p style={{ color: "#33333480", fontSize: 12, marginTop: 1 }}>Search stocks or browse baskets</p>
            </div>
            <button onClick={() => setShowCheckout(true)} style={{ position: "relative", display: "flex", alignItems: "center", gap: 3, padding: "5px 10px", borderRadius: 10, background: cart.length > 0 ? "linear-gradient(135deg,#C48830,#D4A03C)" : "#fff", color: cart.length > 0 ? "#fff" : "#A09080", border: cart.length > 0 ? "none" : "1.5px solid #F0E6D0", cursor: "pointer", fontSize: 15, fontWeight: 800 }}>
              <Icon name="cart" size={12} /> {cart.length > 0 ? cart.length : ""}
              {cart.length > 0 && <span style={{ position: "absolute", top: -4, right: -4, width: 14, height: 14, borderRadius: "50%", background: "#FF7043", color: "#fff", fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #fff" }}>{cart.length}</span>}
            </button>
          </div>

          {/* ── Stock Search Bar ── */}
          <div style={{ background: "#fff", borderRadius: 12, padding: "8px 12px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 21, color: "#33333480" }}></span>
              <input
                type="text"
                placeholder="Search stocks by ticker or name..."
                value={stockSearch}
                onChange={e => setStockSearch(e.target.value)}
                style={{ flex: 1, border: "none", outline: "none", fontSize: 15, fontFamily: "Quicksand", fontWeight: 600, color: "#333334", background: "transparent" }}
              />
              {stockSearch && <button onClick={() => setStockSearch("")} style={{ border: "none", background: "#F0E6D0", borderRadius: "50%", width: 18, height: 18, cursor: "pointer", fontSize: 14, color: "#33333480", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>}
            </div>
          </div>

          {/* ── Stock Search Results ── */}
          {stockSearch.length >= 1 && (() => {
            const q = stockSearch.toUpperCase();
            const stockNames = { XOM:"Exxon Mobil", CVX:"Chevron", GLD:"SPDR Gold", "BRK.B":"Berkshire Hathaway", COST:"Costco", AAPL:"Apple", MSFT:"Microsoft", GOOGL:"Alphabet", AMZN:"Amazon", NVDA:"NVIDIA", AMD:"AMD", AVGO:"Broadcom", TSLA:"Tesla", COIN:"Coinbase", LMT:"Lockheed Martin", RTX:"RTX Corp", GD:"General Dynamics", NOC:"Northrop Grumman", O:"Realty Income", AMT:"American Tower", XLU:"Utilities ETF", TLT:"20+ Yr Treasury", PLD:"Prologis", JNJ:"Johnson & Johnson", PG:"Procter & Gamble", WMT:"Walmart", KO:"Coca-Cola", MCD:"McDonald's", PEP:"PepsiCo", MMM:"3M", ENPH:"Enphase Energy", SEDG:"SolarEdge", FSLR:"First Solar", RUN:"Sunrun", PLUG:"Plug Power", PLTR:"Palantir", PATH:"UiPath", ISRG:"Intuitive Surgical", TQQQ:"ProShares 3x QQQ", SPXL:"Direxion 3x SPX", ARKK:"ARK Innovation", UNH:"UnitedHealth", LLY:"Eli Lilly", ABBV:"AbbVie", MRK:"Merck", TMO:"Thermo Fisher" };
            const tickerIcons = { XOM:"gas-pump", CVX:"gas-pump", GLD:"gold-medal", "BRK.B":"building", COST:"store", AAPL:"apple-fruit", MSFT:"window", GOOGL:"search", AMZN:"package", NVDA:"gamepad", AMD:"diamond", AVGO:"satellite", TSLA:"bolt", COIN:"coin", LMT:"plane", RTX:"rocket", GD:"shield", NOC:"helicopter", O:"home", AMT:"satellite", XLU:"lightbulb", TLT:"scroll", PLD:"construction", JNJ:"pill", PG:"soap", WMT:"cart", KO:"drink", MCD:"burger", PEP:"drink", MMM:"wrench", ENPH:"sun", SEDG:"sun", FSLR:"sun-face", RUN:"runner", PLUG:"plug", PLTR:"eye", PATH:"robot", ISRG:"hospital", TQQQ:"chart-up", SPXL:"chart-bar", ARKK:"rocket", UNH:"hospital", LLY:"syringe", ABBV:"pill", MRK:"dna", TMO:"microscope" };
            const allStocks = Object.entries(explorerStockPrices).filter(([ticker, price]) => {
              const name = (stockNames[ticker] || "").toUpperCase();
              return ticker.toUpperCase().includes(q) || name.includes(q);
            }).slice(0, 8);
            if (allStocks.length === 0) return (
              <div style={{ background: "#fff", borderRadius: 12, padding: "16px", marginBottom: 10, textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 4 }}></div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#33333480" }}>No stocks found for "{stockSearch}"</div>
              </div>
            );
            return (
              <div style={{ background: "#fff", borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
                <div style={{ padding: "6px 12px", background: "#FFFDF5", borderBottom: "1px solid #33333420" }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#33333480", textTransform: "uppercase" }}>Individual Stocks</span>
                </div>
                {allStocks.map(([ticker, price], i) => (
                  <div key={ticker} onClick={() => goToStock(ticker)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: i < allStocks.length - 1 ? "1px solid #FFF5E6" : "none", cursor: "pointer" }}>
                    <StockLogo ticker={ticker} size={24} />
                    <span style={{ fontSize: 24, display: "none" }}>{tickerIcons[ticker] || "chart-up"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 800, color: "#333334" }}>{ticker}</div>
                      <div style={{ fontSize: 12, color: "#33333480", fontWeight: 600 }}>{stockNames[ticker] || ticker}</div>
                    </div>
                    <div style={{ textAlign: "right", marginRight: 6 }}>
                      <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700, color: "#333334" }}>${price >= 1000 ? (price / 1000).toFixed(2) + "k" : price.toFixed(2)}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); notify("" + ticker + " added!"); }} style={{ background: "linear-gradient(135deg,#C48830,#D4A03C)", color: "#fff", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Buy</button>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* ── Baskets Section Label ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Instrument Serif', serif", color: "#333334" }}>Baskets</div>
            <div style={{ flex: 1, height: 1, background: "#F0E6D0" }} />
            <div style={{ display: "flex", gap: 3 }}>
              <button onClick={() => setActiveScenario(null)} style={{ padding: "3px 8px", borderRadius: 6, border: "1px solid " + (!activeScenario ? "#C48830" : "#F0E6D0"), background: !activeScenario ? "#FFF8EE" : "#fff", color: !activeScenario ? "#C48830" : "#A09080", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>All</button>
              {macroScenarios.slice(0, 4).map(s => (
                <button key={s.id} onClick={() => setActiveScenario(activeScenario === s.id ? null : s.id)} style={{ padding: "3px 8px", borderRadius: 6, border: "1px solid " + (activeScenario === s.id ? "#C48830" : "#F0E6D0"), background: activeScenario === s.id ? "#FFF8EE" : "#fff", color: activeScenario === s.id ? "#C48830" : "#A09080", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>{s.name}</button>
              ))}
            </div>
          </div>

          {/* ── 2-Column Flippable Card Grid ── */}
          <div className="explorer-card-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {filteredExplorer.map((b, i) => {
              const clr = CL[b.color] || CL.terracotta;
              const inCart = !!cart.find(cc => cc.id === b.id);
              const relevance = getRegimeRelevance(b, displayRegime);
              const rm = explorerRiskMetrics[b.id];
              const isFlipped = !!flippedCards[b.id];
              const basketYoY = b.stocks.reduce((sum, t) => sum + (stockYoYReturns[t] || 0), 0) / b.stocks.length;
              const retColor = basketYoY >= 0 ? "#5B8C5A" : "#EF5350";
              const isTopPerformer = basketYoY === maxExplorerYoY;
              return (
                <div key={b.id} style={{ perspective: 800, animation: "fadeUp .3s ease " + (i * .03) + "s both" }}>
                  <div style={{
                    position: "relative", width: "100%", height: 260, transition: "transform .5s ease",
                    transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0)",
                  }}>

                    {/* ═══ FRONT ═══ */}
                    <div style={{
                      position: "absolute", inset: 0, backfaceVisibility: "hidden",
                      backgroundImage: isTopPerformer ? "url(/gold-texture.jpeg)" : undefined,
                      backgroundSize: isTopPerformer ? "cover" : undefined,
                      backgroundPosition: isTopPerformer ? "center" : undefined,
                      background: isTopPerformer ? undefined : "#fff",
                      borderRadius: 14, padding: "10px 10px 8px", cursor: "pointer",
                      display: "flex", flexDirection: "column", overflow: "hidden",
                    }}
                      onMouseEnter={e => { if (!isFlipped) { e.currentTarget.style.borderColor = "#33333466"; e.currentTarget.style.boxShadow = "0 6px 18px #33333412"; }}}
                      onMouseLeave={e => { if (!isFlipped) { e.currentTarget.style.borderColor = "#33333440"; e.currentTarget.style.boxShadow = ""; }}}>

                      {/* 80% white overlay to lighten gold */}
                      {isTopPerformer && <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.8)", borderRadius: 12, pointerEvents: "none", zIndex: 0 }} />}

                      {/* Top row: YoY return badge + chart flip icon on far right */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "JetBrains Mono", color: isTopPerformer ? "#8B6914" : retColor, background: isTopPerformer ? "#DAA52025" : retColor + "12", padding: "2px 6px", borderRadius: 5 }}>
                          {isTopPerformer && <span style={{ fontSize: 14, marginRight: 2 }}>👑</span>}
                          {basketYoY >= 0 ? "+" : ""}{basketYoY.toFixed(1)}% <span style={{ fontSize: 9, fontWeight: 700, opacity: .8 }}>YoY</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          {inCart && <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#5B8C5A", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span></div>}
                          {relevance >= 70 && !inCart && <div style={{ background: displayRegime.color, borderRadius: 4, padding: "1px 5px" }}><span style={{ color: "#fff", fontSize: 9, fontWeight: 900 }}>FIT</span></div>}
                          <button onClick={(e) => { e.stopPropagation(); setFlippedCards(f => ({ ...f, [b.id]: !f[b.id] })); }}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", alignItems: "center", justifyContent: "center" }}
                            title="View metrics"><Icon name="chart-bar" size={13} color="#A09080" /></button>
                        </div>
                      </div>

                      {/* Big emoji + bold name */}
                      <div style={{ textAlign: "center", marginBottom: 4, position: "relative", zIndex: 1 }} onClick={() => setSelectedShopBasket({ ...b, relevance })}>
                        <div style={{ lineHeight: 1, marginBottom: 3, fontSize: 48 }}>{b.emoji}</div>
                        <div style={{ fontSize: 17, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: "#333334", lineHeight: 1.15 }}>{b.name}</div>
                        <div style={{ fontSize: 11, color: "#33333480", fontWeight: 700, marginTop: 2 }}>{b.strategy} · {b.risk}</div>
                      </div>

                      {/* Ticker list — max 5 + overflow */}
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, margin: "4px 0 6px", position: "relative", zIndex: 1 }} onClick={() => setSelectedShopBasket({ ...b, relevance })}>
                        {b.stocks.slice(0, 5).map(t => {
                          const yoy = stockYoYReturns[t] || 0;
                          const yoyC = yoy >= 0 ? "#5B8C5A" : "#EF5350";
                          return (
                            <div key={t} onClick={(e) => { e.stopPropagation(); goToStock(t); }} style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6,
                              fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 800, color: "#333334",
                              background: isTopPerformer ? "rgba(255,255,255,0.5)" : "#33333406", padding: "4px 8px", borderRadius: 6,
                              border: "1px solid " + (isTopPerformer ? "rgba(218,165,32,0.15)" : "#33333410"), cursor: "pointer",
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <StockLogo ticker={t} size={16} />
                                <span>{t}</span>
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 800, color: yoyC }}>{yoy >= 0 ? "+" : ""}{yoy.toFixed(1)}%</span>
                            </div>
                          );
                        })}
                        {b.stocks.length > 5 && (
                          <div style={{ textAlign: "center", fontSize: 12, fontWeight: 800, color: "#33333480", padding: "2px 0" }}>+{b.stocks.length - 5} more</div>
                        )}
                      </div>

                    </div>

                    {/* ═══ BACK: Metrics ═══ */}
                    <div style={{
                      position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)",
                      backgroundImage: isTopPerformer ? "url(/gold-texture.jpeg)" : undefined,
                      backgroundSize: isTopPerformer ? "cover" : undefined,
                      backgroundPosition: isTopPerformer ? "center" : undefined,
                      background: isTopPerformer ? undefined : "#fff",
                      border: "1px solid #33333440", borderRadius: 14, padding: "8px",
                      display: "flex", flexDirection: "column", overflow: "hidden",
                    }}>
                      {/* 80% white overlay to lighten gold */}
                      {isTopPerformer && <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.8)", borderRadius: 12, pointerEvents: "none", zIndex: 0 }} />}

                      {/* Back header */}
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6, position: "relative", zIndex: 1 }}>
                        <Icon name={b.icon} size={12} color={clr.a} />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: "#333334" }}>{b.name}</div>
                          <div style={{ fontSize: 11, color: clr.a, fontWeight: 800 }}>Risk & Performance</div>
                        </div>
                      </div>

                      {/* Basket YoY Return */}
                      <div style={{ background: isTopPerformer ? "#DAA52018" : retColor + "0C", borderRadius: 8, padding: "6px 6px", textAlign: "center", marginBottom: 6, position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: 9, color: "#33333480", fontWeight: 700, textTransform: "uppercase", marginBottom: 1 }}>Basket YoY Return</div>
                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 24, fontWeight: 900, color: isTopPerformer ? "#8B6914" : retColor }}>{isTopPerformer && "👑 "}{basketYoY >= 0 ? "+" : ""}{basketYoY.toFixed(1)}%</div>
                      </div>

                      {/* Risk Metrics */}
                      {rm && <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, position: "relative", zIndex: 1 }}>
                        {[
                          { label: "Sharpe", val: rm.sharpe.toFixed(2), good: rm.sharpe > 1, icon: "ruler" },
                          { label: "Beta", val: rm.beta.toFixed(2), good: rm.beta < 1.5, icon: "chart-down" },
                          { label: "Vol", val: rm.volatility.toFixed(0) + "%", good: rm.volatility < 25, icon: "wave" },
                          { label: "Max DD", val: rm.maxDD.toFixed(0) + "%", good: rm.maxDD > -15, icon: "arrow-down" },
                          { label: "Sortino", val: rm.sortino.toFixed(2), good: rm.sortino > 1, icon: "target" },
                        ].map((m, mi) => (
                          <div key={mi} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 6px", background: m.good ? "#EDF5ED" : "#FFF5F5", borderRadius: 6 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <Icon name={m.icon} size={9} color={m.good ? "#5B8C5A" : "#EF5350"} />
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#333334" }}>{m.label}</span>
                            </div>
                            <span style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 900, color: m.good ? "#5B8C5A" : "#EF5350" }}>{m.val}</span>
                          </div>
                        ))}
                      </div>}

                      {/* Risk level bar */}
                      <div style={{ marginTop: 4, padding: "4px 8px", background: "#33333408", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#33333480", textTransform: "uppercase" }}>Risk Level</span>
                        <span style={{ fontSize: 14, fontWeight: 900, color: b.risk === "Low" ? "#5B8C5A" : b.risk === "Medium" ? "#FFA726" : "#EF5350" }}>{b.risk}</span>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>}
        {/* ══ CALENDAR ══ */}
        {page === "calendar" && !selectedBasket && <CalendarPage onNavigate={setPage} />}

        {/* ══ MACRO DASHBOARD (includes alerts) ══ */}
        {page === "macro" && !selectedBasket && <MacroDashboardPage onGoRiskLab={() => { setPage("risklab"); setRiskLabTab("risklab"); }} onNavigate={setPage} regime={displayRegime} alerts={macroAlerts} onSelectIndicator={(id) => { setViewIndicatorId(id); setPage("indicator"); }} />}

        {/* ══ INDICATOR DETAIL ══ */}
        {page === "indicator" && viewIndicatorId && !selectedBasket && <IndicatorDetailPage indicatorId={viewIndicatorId} onBack={() => { setViewIndicatorId(null); setPage("macro"); }} onSelectIndicator={(id) => { setViewIndicatorId(id); }} liveNews={liveNews} />}

        {/* ══ RISK LAB (subtabs controlled from left sidebar) ══ */}
        {page === "risklab" && !selectedBasket && <div>
          {riskLabTab === "risklab" && <RiskLabPage onOpenMacro={() => setPage("macro")} hedges={displayHedges} regime={displayRegime} />}
          {riskLabTab === "hedge" && <HedgeGuidesPage />}
          {riskLabTab === "stresstest" && <StressTestPage />}
          {riskLabTab === "historical" && <HistoricalPatternsPage />}
          {riskLabTab === "contrarian" && <ContrarianSignalsPage />}
          {riskLabTab === "tides" && <MacroTidesPage />}
          {riskLabTab === "weather" && <WeatherMarketPage />}
          {riskLabTab === "horoscope" && <HoroscopePage />}
        </div>}

        {/* ══ MY ACCOUNT ══ */}
        {page === "account" && !selectedBasket && <MyAccountPage onNavigate={setPage} onSignOut={logout} user={user} />}

        {/* ══ NEWS ══ */}
        {page === "news" && !selectedBasket && <NewsPage liveNews={liveNews} newsStatus={newsStatus} />}

        {/* ══ STOCK DETAIL (standalone) ══ */}
        {page === "stock" && viewStockTicker && !selectedBasket && (
          <StockPage
            ticker={viewStockTicker}
            onBack={() => { setViewStockTicker(null); setPage("dashboard"); }}
            onNavigate={setPage}
          />
        )}
        </div>{/* end web-content-inner */}
        </div>{/* end web-content */}

        {/* ── Right Sidebar ── */}
        <aside className="web-right-sidebar">
          {/* Macro Section */}
          <div className="web-right-section">
            <div className="web-right-title">
              <Icon name="globe" size={11} color="#C8B898" style={{ marginRight: 4, verticalAlign: "middle" }} /> Macro
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, padding: "6px 10px", background: displayRegime.bg || "#f0f8f0", borderRadius: 8, border: `1px solid ${displayRegime.color || "#5B8C5A"}22` }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: displayRegime.color || "#5B8C5A" }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: displayRegime.color || "#5B8C5A" }}>{displayRegime.label || "Expansion"}</span>
            </div>
            {macroBullets.map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", marginTop: 5, flexShrink: 0, background: b.signal === "bullish" ? "#5B8C5A" : b.signal === "bearish" ? "#EF5350" : "#FFA726" }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#555", lineHeight: 1.3 }}>{b.text}</span>
              </div>
            ))}
          </div>

          {/* News Section */}
          <div className="web-right-section">
            <div className="web-right-title">
              <Icon name="newspaper" size={11} color="#C8B898" style={{ marginRight: 4, verticalAlign: "middle" }} /> News
            </div>
            {(liveNews && liveNews.length > 0 ? liveNews.slice(0, 2) : [
              { headline: "Markets await Fed minutes release", source: "Reuters", datetime: Date.now() / 1000 },
              { headline: "Tech earnings beat expectations", source: "Bloomberg", datetime: Date.now() / 1000 },
            ]).map((n, i) => (
              <div key={i} style={{ marginBottom: i === 0 ? 10 : 0, padding: "8px 10px", background: "#fff", borderRadius: 8, border: "1px solid #F0E6D044" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#333", lineHeight: 1.35, marginBottom: 3 }}>{n.headline}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#A09080" }}>
                  {n.source} · {n.datetime ? new Date(n.datetime * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"}
                </div>
              </div>
            ))}
          </div>

          {/* Portfolio Holdings Section */}
          <div className="web-right-section">
            <div className="web-right-title">
              <Icon name="chart-pie" size={11} color="#C8B898" style={{ marginRight: 4, verticalAlign: "middle" }} /> Portfolio
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {(() => {
                const holdingsMap = {};
                [...myBaskets, ...customBaskets].forEach(b => {
                  (basketStocks[b.id] || []).filter(s => s.asset === "equity").forEach(s => {
                    if (holdingsMap[s.ticker]) {
                      holdingsMap[s.ticker].shares += s.shares;
                    } else {
                      holdingsMap[s.ticker] = { ...s };
                    }
                  });
                });
                return Object.values(holdingsMap).sort((a, b) => (b.current * b.shares) - (a.current * a.shares)).map(s => {
                  const liveData = livePrices[s.ticker];
                  const price = liveData?.price || s.current;
                  const pl = (price - s.avgCost) * s.shares * (s.dir === "short" ? -1 : 1);
                  const plPct = ((price - s.avgCost) / s.avgCost * 100) * (s.dir === "short" ? -1 : 1);
                  const isUp = pl >= 0;
                  return (
                    <div key={s.ticker} onClick={() => goToStock(s.ticker)}
                      style={{ display: "flex", alignItems: "center", padding: "6px 8px", borderRadius: 8, cursor: "pointer", transition: "all .15s", gap: 8 }}
                      onMouseEnter={e => e.currentTarget.style.background = "#FFFDF5"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 800, color: "#333" }}>{s.ticker}</span>
                          <span style={{ fontSize: 9, fontWeight: 700, color: "#A09080" }}>{s.shares}sh</span>
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "#A09080", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 700, color: "#333" }}>
                          ${price >= 1000 ? (price / 1000).toFixed(2) + "k" : price.toFixed(2)}
                        </div>
                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 700, color: isUp ? "#5B8C5A" : "#EF5350" }}>
                          {isUp ? "+" : ""}{plPct.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Watchlist Section */}
          <div className="web-right-section">
            <div className="web-right-title">
              <Icon name="eye" size={11} color="#C8B898" style={{ marginRight: 4, verticalAlign: "middle" }} /> Watchlist
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {watchlistTickers.map(({ ticker, name }) => {
                const liveData = livePrices[ticker];
                const price = liveData?.price || INITIAL_EXPLORER_PRICES[ticker] || 0;
                const chgPct = liveData?.changePercent ?? (stockYoYReturns[ticker] ? stockYoYReturns[ticker] / 52 : 0);
                const isUp = chgPct >= 0;
                return (
                  <div key={ticker} onClick={() => goToStock(ticker)}
                    style={{ display: "flex", alignItems: "center", padding: "7px 8px", borderRadius: 8, cursor: "pointer", transition: "all .15s", gap: 8 }}
                    onMouseEnter={e => e.currentTarget.style.background = "#FFFDF5"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 800, color: "#333" }}>{ticker}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "#A09080", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 700, color: "#333" }}>
                        ${price >= 1000 ? (price / 1000).toFixed(2) + "k" : price.toFixed(2)}
                      </div>
                      <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 700, color: isUp ? "#5B8C5A" : "#EF5350" }}>
                        {isUp ? "+" : ""}{chgPct.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        </div>{/* end web-body */}

        {/* ── Modals ── */}
        {showCreate && <CreateBasketModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
        {showCheckout && cart.length > 0 && <CheckoutModal cart={cart} onClose={() => setShowCheckout(false)} onExecute={() => setCart([])} />}
        {showCheckout && cart.length === 0 && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.3)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowCheckout(false)}><div style={{ background: "#fff", borderRadius: 16, padding: "36px 28px", textAlign: "center", animation: "popIn .4s ease", margin: 20 }} onClick={e => e.stopPropagation()}><div style={{ fontSize: 63, marginBottom: 8 }}>🧺</div><div style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Instrument Serif', serif", marginBottom: 4, color: "#8B6914" }}>Your cart is empty!</div><div style={{ fontSize: 18, color: "#33333480", marginBottom: 12 }}>Browse our fresh Hatches and add some eggs</div><button onClick={() => { setShowCheckout(false); setPage("explorer"); }} style={{ padding: "10px 24px", background: "linear-gradient(135deg,#C48830,#D4A03C)", color: "#fff", border: "none", borderRadius: 14, fontWeight: 800, cursor: "pointer", fontSize: 15, fontFamily: "Quicksand" }}>Start Shopping</button></div></div>}
        <AIAgent onNotify={notify} onNavigate={setPage} agentInsights={agentState} isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />
    </div>
  );
}
