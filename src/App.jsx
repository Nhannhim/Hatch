import React, { useState, useEffect, useRef } from "react";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Quicksand',sans-serif;background:#FFFDF5;color:#2D3B2D}
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#E8D5A8;border-radius:3px}
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
@keyframes basketBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes cartPop{0%{transform:scale(1)}50%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes freshGlow{0%,100%{box-shadow:0 0 0 0 rgba(76,175,80,0.15)}50%{box-shadow:0 0 20px 4px rgba(76,175,80,0.1)}}
`;

const CL = {
  sky: { a: "#42A5F5", l: "#E3F2FD" }, golden: { a: "#FFA726", l: "#FFF3E0" },
  sage: { a: "#5B8C5A", l: "#EDF5ED" }, plum: { a: "#AB47BC", l: "#F3E5F5" },
  coral: { a: "#EF5350", l: "#FFEBEE" }, terracotta: { a: "#C48830", l: "#FFF8EE" },
};
const fmt = (n) => "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0 });
const fmtS = (n) => (n >= 0 ? "+" : "-") + fmt(Math.abs(n));
const fmtD = (n) => "$" + n.toFixed(2);
const pct = (n) => (n >= 0 ? "+" : "") + n.toFixed(2) + "%";

function getBasketHealth(b) {
  if (b.totalPL < -1000) return { status: "critical", label: "Underperforming", icon: "⚠️", clr: "#EF5350", bg: "#FFEBEE", tip: "Significantly below cost basis — consider rebalancing or cutting losses." };
  if (b.totalPL < 0) return { status: "warning", label: "Below Cost", icon: "⚠️", clr: "#FFA726", bg: "#FFF3E0", tip: "Below cost basis — monitor closely for recovery signals." };
  if (b.change < -2) return { status: "warning", label: "Down Today", icon: "⚠️", clr: "#FFA726", bg: "#FFF3E0", tip: "Sharp drop today — watch for continued weakness." };
  if (b.change > 4) return { status: "hot", label: "Strong Rally", icon: "🔥", clr: "#C48830", bg: "#FFF8EE", tip: "Hot streak — consider locking in partial profits." };
  if (b.change > 0 && b.totalPL > 2000) return { status: "great", label: "Outperforming", icon: "🚀", clr: "#C48830", bg: "#FFF8EE", tip: "Strong performance — basket is firing on all cylinders." };
  if (b.change > 0 && b.totalPL > 0) return { status: "good", label: "On Track", icon: "✅", clr: "#C48830", bg: "#FFF8EE", tip: "Performing well — holding steady gains." };
  return { status: "neutral", label: "Stable", icon: "➖", clr: "#A09080", bg: "#fff", tip: "Holding steady — no major signals." };
}

// ═══════════════════════════ DATA ═══════════════════════════

const calendarEvents = [
  { date:"2026-02-06", type:"earnings", ticker:"AMZN", name:"Amazon", quarter:"Q4 '25", time:"AMC", expected:"$1.48", sector:"Consumer", impact:"high" },
  { date:"2026-02-06", type:"earnings", ticker:"GOOGL", name:"Alphabet", quarter:"Q4 '25", time:"AMC", expected:"$1.92", sector:"Technology", impact:"high" },
  { date:"2026-02-07", type:"event", ticker:"MACRO", name:"Jobs Report (NFP)", desc:"Non-Farm Payrolls — Jan 2026", sector:"Macro", impact:"high", emoji:"📊" },
  { date:"2026-02-10", type:"earnings", ticker:"KO", name:"Coca-Cola", quarter:"Q4 '25", time:"BMO", expected:"$0.52", sector:"Staples", impact:"medium" },
  { date:"2026-02-10", type:"earnings", ticker:"PEP", name:"PepsiCo", quarter:"Q4 '25", time:"BMO", expected:"$1.94", sector:"Staples", impact:"medium" },
  { date:"2026-02-11", type:"earnings", ticker:"SHOP", name:"Shopify", quarter:"Q4 '25", time:"BMO", expected:"$0.44", sector:"Technology", impact:"medium" },
  { date:"2026-02-11", type:"event", ticker:"MACRO", name:"CPI Report", desc:"Consumer Price Index — Jan 2026", sector:"Macro", impact:"high", emoji:"🔥" },
  { date:"2026-02-12", type:"earnings", ticker:"CSCO", name:"Cisco", quarter:"Q2 FY26", time:"AMC", expected:"$0.92", sector:"Technology", impact:"medium" },
  { date:"2026-02-12", type:"event", ticker:"NVDA", name:"NVIDIA GTC Keynote", desc:"New GPU arch expected", sector:"Technology", impact:"high", emoji:"⚡" },
  { date:"2026-02-13", type:"earnings", ticker:"ABNB", name:"Airbnb", quarter:"Q4 '25", time:"AMC", expected:"$0.58", sector:"Consumer", impact:"medium" },
  { date:"2026-02-14", type:"event", ticker:"MACRO", name:"Retail Sales", desc:"US Retail Sales — Jan 2026", sector:"Macro", impact:"medium", emoji:"🛒" },
  { date:"2026-02-17", type:"event", ticker:"MACRO", name:"Presidents' Day", desc:"US Markets Closed", sector:"Holiday", impact:"low", emoji:"🇺🇸" },
  { date:"2026-02-18", type:"earnings", ticker:"WMT", name:"Walmart", quarter:"Q4 FY26", time:"BMO", expected:"$1.64", sector:"Staples", impact:"high" },
  { date:"2026-02-18", type:"earnings", ticker:"HD", name:"Home Depot", quarter:"Q4 '25", time:"BMO", expected:"$3.02", sector:"Consumer", impact:"high" },
  { date:"2026-02-19", type:"event", ticker:"MACRO", name:"FOMC Minutes", desc:"Fed Meeting Minutes Release", sector:"Macro", impact:"high", emoji:"🏦" },
  { date:"2026-02-20", type:"earnings", ticker:"BKNG", name:"Booking Holdings", quarter:"Q4 '25", time:"AMC", expected:"$38.20", sector:"Consumer", impact:"medium" },
  { date:"2026-02-24", type:"event", ticker:"AAPL", name:"Apple Shareholder Meeting", desc:"Annual shareholder meeting & vote", sector:"Technology", impact:"medium", emoji:"🍎" },
  { date:"2026-02-25", type:"event", ticker:"MACRO", name:"Consumer Confidence", desc:"CB Consumer Confidence — Feb", sector:"Macro", impact:"medium", emoji:"📈" },
  { date:"2026-02-26", type:"earnings", ticker:"NVDA", name:"NVIDIA", quarter:"Q4 FY26", time:"AMC", expected:"$0.89", sector:"Technology", impact:"high" },
  { date:"2026-02-26", type:"earnings", ticker:"CRM", name:"Salesforce", quarter:"Q4 FY26", time:"AMC", expected:"$2.62", sector:"Technology", impact:"high" },
  { date:"2026-02-27", type:"earnings", ticker:"DELL", name:"Dell Technologies", quarter:"Q4 FY26", time:"AMC", expected:"$2.15", sector:"Technology", impact:"medium" },
  { date:"2026-02-27", type:"event", ticker:"MACRO", name:"GDP (2nd Estimate)", desc:"Q4 2025 GDP Revision", sector:"Macro", impact:"high", emoji:"🏛️" },
  { date:"2026-02-28", type:"event", ticker:"MACRO", name:"PCE Inflation", desc:"Fed's preferred inflation gauge", sector:"Macro", impact:"high", emoji:"📊" },
  { date:"2026-03-02", type:"earnings", ticker:"TGT", name:"Target", quarter:"Q4 '25", time:"BMO", expected:"$2.42", sector:"Consumer", impact:"medium" },
  { date:"2026-03-03", type:"event", ticker:"TSLA", name:"Tesla Investor Day", desc:"Robotaxi & energy update expected", sector:"Technology", impact:"high", emoji:"🚗" },
  { date:"2026-03-04", type:"earnings", ticker:"COST", name:"Costco", quarter:"Q2 FY26", time:"AMC", expected:"$3.78", sector:"Staples", impact:"high" },
  { date:"2026-03-06", type:"event", ticker:"MACRO", name:"Jobs Report (NFP)", desc:"Non-Farm Payrolls — Feb 2026", sector:"Macro", impact:"high", emoji:"📊" },
  { date:"2026-03-09", type:"earnings", ticker:"ORCL", name:"Oracle", quarter:"Q3 FY26", time:"AMC", expected:"$1.52", sector:"Technology", impact:"medium" },
  { date:"2026-03-10", type:"event", ticker:"AAPL", name:"Apple Spring Event", desc:"New MacBook & iPad launch", sector:"Technology", impact:"high", emoji:"🍎" },
  { date:"2026-03-11", type:"event", ticker:"MACRO", name:"CPI Report", desc:"Consumer Price Index — Feb 2026", sector:"Macro", impact:"high", emoji:"🔥" },
  { date:"2026-03-12", type:"event", ticker:"META", name:"Meta Connect 2026", desc:"AR/VR hardware & AI updates", sector:"Technology", impact:"medium", emoji:"🥽" },
  { date:"2026-03-17", type:"event", ticker:"MACRO", name:"FOMC Decision", desc:"Federal Reserve Rate Decision", sector:"Macro", impact:"high", emoji:"🏦" },
  { date:"2026-03-18", type:"earnings", ticker:"FDX", name:"FedEx", quarter:"Q3 FY26", time:"AMC", expected:"$4.62", sector:"Industrials", impact:"medium" },
  { date:"2026-03-20", type:"event", ticker:"MACRO", name:"Triple Witching", desc:"Options & futures quad expiration", sector:"Market", impact:"high", emoji:"🧙" },
  { date:"2026-03-24", type:"earnings", ticker:"NKE", name:"Nike", quarter:"Q3 FY26", time:"AMC", expected:"$0.74", sector:"Consumer", impact:"medium" },
  { date:"2026-03-26", type:"event", ticker:"MSFT", name:"Microsoft Build Preview", desc:"Developer conference preview & AI features", sector:"Technology", impact:"medium", emoji:"💻" },
  { date:"2026-03-28", type:"event", ticker:"MACRO", name:"PCE Inflation", desc:"Personal Consumption Exp. — Feb", sector:"Macro", impact:"high", emoji:"📊" },
  { date:"2026-03-31", type:"event", ticker:"MACRO", name:"Quarter End", desc:"Q1 2026 ends — portfolio rebalancing expected", sector:"Market", impact:"medium", emoji:"📅" },
];

const portfolioHistory = [
  { d:"Jan",v:42000 },{ d:"Feb",v:44500 },{ d:"Mar",v:41200 },{ d:"Apr",v:46800 },
  { d:"May",v:48200 },{ d:"Jun",v:45900 },{ d:"Jul",v:51200 },{ d:"Aug",v:53800 },
  { d:"Sep",v:52100 },{ d:"Oct",v:56400 },{ d:"Nov",v:58900 },{ d:"Dec",v:61247 },
];

const myBaskets = [
  { id:1, name:"Inflation Hedge", emoji:"🛡️", strategy:"Global Macro", color:"coral", stocks:["XOM","CVX","GLD","BRK.B","COST"], value:22480, change:2.14, allocation:55, desc:"Energy + gold + value for sticky CPI", costBasis:18200, dayPL:447, totalPL:4280 },
  { id:2, name:"Geopolitical Shield", emoji:"🌍", strategy:"Global Macro", color:"plum", stocks:["LMT","RTX","GD","NOC","GLD"], value:18760, change:1.87, allocation:45, desc:"Defense + gold for geopolitical risk", costBasis:15800, dayPL:324, totalPL:2960 },
];

const basketStocks = {
  1:[
    {ticker:"AAPL",name:"Apple",shares:12,avgCost:168.50,current:189.84,change:1.24,asset:"equity",dir:"long"},
    {ticker:"MSFT",name:"Microsoft",shares:8,avgCost:340.20,current:415.60,change:0.87,asset:"equity",dir:"long"},
    {ticker:"GOOGL",name:"Alphabet",shares:15,avgCost:132.80,current:155.72,change:-0.42,asset:"equity",dir:"long"},
    {ticker:"AMZN",name:"Amazon",shares:10,avgCost:148.60,current:185.30,change:2.15,asset:"equity",dir:"long"},
    {ticker:"NVDA",name:"NVIDIA",shares:5,avgCost:480.00,current:878.40,change:3.82,asset:"equity",dir:"long"},
    {ticker:"QQQ 420P 03/21",name:"QQQ Put (Hedge)",shares:4,avgCost:6.20,current:4.60,change:-5.40,asset:"option",dir:"long"},
    {ticker:"NQ Mar26",name:"E-mini Nasdaq",shares:1,avgCost:17800.00,current:18420.00,change:0.68,asset:"future",dir:"long"},
  ],
  2:[
    {ticker:"JNJ",name:"J&J",shares:20,avgCost:155.40,current:158.20,change:0.32,asset:"equity",dir:"long"},
    {ticker:"PG",name:"P&G",shares:18,avgCost:148.90,current:162.45,change:0.54,asset:"equity",dir:"long"},
    {ticker:"KO",name:"Coca-Cola",shares:30,avgCost:56.80,current:61.20,change:0.18,asset:"equity",dir:"long"},
    {ticker:"PEP",name:"PepsiCo",shares:12,avgCost:168.30,current:172.90,change:-0.22,asset:"equity",dir:"long"},
    {ticker:"MMM",name:"3M",shares:15,avgCost:98.60,current:105.40,change:1.12,asset:"equity",dir:"long"},
    {ticker:"TLT",name:"20+ Year Treasury",shares:25,avgCost:94.80,current:92.40,change:-0.62,asset:"bond",dir:"long"},
    {ticker:"TIPS",name:"TIPS Bond ETF",shares:20,avgCost:106.40,current:108.60,change:0.12,asset:"bond",dir:"long"},
  ],
  3:[
    {ticker:"ENPH",name:"Enphase",shares:25,avgCost:128.40,current:112.60,change:-2.80,asset:"equity",dir:"long"},
    {ticker:"SEDG",name:"SolarEdge",shares:20,avgCost:72.30,current:58.40,change:-3.20,asset:"equity",dir:"long"},
    {ticker:"FSLR",name:"First Solar",shares:15,avgCost:168.90,current:178.50,change:1.40,asset:"equity",dir:"long"},
    {ticker:"RUN",name:"Sunrun",shares:40,avgCost:14.80,current:12.90,change:-1.60,asset:"equity",dir:"long"},
    {ticker:"PLUG",name:"Plug Power",shares:80,avgCost:4.20,current:3.10,change:-4.50,asset:"equity",dir:"long"},
    {ticker:"CL Mar26",name:"Crude Oil (Short)",shares:1,avgCost:88.20,current:85.40,change:2.10,asset:"future",dir:"short"},
  ],
  4:[
    {ticker:"NVDA",name:"NVIDIA",shares:6,avgCost:460.00,current:878.40,change:3.82,asset:"equity",dir:"long"},
    {ticker:"AMD",name:"AMD",shares:20,avgCost:120.50,current:168.30,change:2.45,asset:"equity",dir:"long"},
    {ticker:"PLTR",name:"Palantir",shares:50,avgCost:18.40,current:24.60,change:4.20,asset:"equity",dir:"long"},
    {ticker:"PATH",name:"UiPath",shares:35,avgCost:15.80,current:13.20,change:-1.80,asset:"equity",dir:"long"},
    {ticker:"ISRG",name:"Intuitive Surg.",shares:3,avgCost:340.60,current:428.90,change:1.65,asset:"equity",dir:"long"},
    {ticker:"NVDA 900C 03/21",name:"NVDA $900 Call",shares:5,avgCost:14.20,current:18.20,change:14.80,asset:"option",dir:"long"},
    {ticker:"ES Mar26",name:"E-mini S&P 500",shares:1,avgCost:5180.00,current:5248.50,change:0.42,asset:"future",dir:"long"},
  ],
  5:[
    {ticker:"UNH",name:"UnitedHealth",shares:4,avgCost:480.20,current:524.80,change:0.68,asset:"equity",dir:"long"},
    {ticker:"LLY",name:"Eli Lilly",shares:3,avgCost:620.40,current:792.30,change:1.42,asset:"equity",dir:"long"},
    {ticker:"ABBV",name:"AbbVie",shares:12,avgCost:148.60,current:172.40,change:0.56,asset:"equity",dir:"long"},
    {ticker:"MRK",name:"Merck",shares:15,avgCost:108.40,current:118.60,change:-0.34,asset:"equity",dir:"long"},
    {ticker:"TMO",name:"Thermo Fisher",shares:2,avgCost:520.80,current:568.40,change:0.92,asset:"equity",dir:"long"},
    {ticker:"IEF",name:"7-10Y Treasury",shares:15,avgCost:99.40,current:98.20,change:-0.34,asset:"bond",dir:"long"},
    {ticker:"USD/JPY",name:"Dollar / Yen",shares:1,avgCost:148.60,current:150.24,change:0.42,asset:"forex",dir:"long"},
  ],
};

const basketHistories = {
  1:[{d:"J",v:15200},{d:"F",v:15800},{d:"M",v:14900},{d:"A",v:16200},{d:"M",v:16800},{d:"J",v:16100},{d:"J",v:17200},{d:"A",v:17800},{d:"S",v:17200},{d:"O",v:18000},{d:"N",v:18200},{d:"D",v:18420}],
  2:[{d:"J",v:11800},{d:"F",v:11900},{d:"M",v:12100},{d:"A",v:12000},{d:"M",v:12200},{d:"J",v:12400},{d:"J",v:12300},{d:"A",v:12500},{d:"S",v:12600},{d:"O",v:12700},{d:"N",v:12800},{d:"D",v:12840}],
  3:[{d:"J",v:12400},{d:"F",v:11800},{d:"M",v:10600},{d:"A",v:11200},{d:"M",v:10800},{d:"J",v:9800},{d:"J",v:10200},{d:"A",v:9600},{d:"S",v:9200},{d:"O",v:9400},{d:"N",v:9100},{d:"D",v:8960}],
  4:[{d:"J",v:8200},{d:"F",v:9400},{d:"M",v:8800},{d:"A",v:10200},{d:"M",v:11000},{d:"J",v:10600},{d:"J",v:12200},{d:"A",v:13000},{d:"S",v:12400},{d:"O",v:13200},{d:"N",v:13800},{d:"D",v:14280}],
  5:[{d:"J",v:5800},{d:"F",v:5900},{d:"M",v:6000},{d:"A",v:6100},{d:"M",v:6200},{d:"J",v:6100},{d:"J",v:6300},{d:"A",v:6400},{d:"S",v:6500},{d:"O",v:6600},{d:"N",v:6700},{d:"D",v:6747}],
};

const macroAlerts = [
  { id:1, severity:"critical", time:"2h", title:"Fed Holds Rates", summary:"Signals cuts in Q2.", tags:["Rates"], scenario:"rates_down", emoji:"🏦" },
  { id:2, severity:"warning", time:"5h", title:"CPI Hot at 3.4%", summary:"Core inflation beats.", tags:["CPI"], scenario:"inflation", emoji:"🔥" },
  { id:3, severity:"info", time:"8h", title:"China PMI at 48.1", summary:"Contraction signals.", tags:["China"], scenario:"geopolitical", emoji:"🌍" },
  { id:4, severity:"warning", time:"1d", title:"10Y Breaks 4.5%", summary:"Bond selloff accelerates.", tags:["Bonds"], scenario:"inflation", emoji:"📊" },
  { id:5, severity:"critical", time:"1d", title:"NVDA Revenue +265%", summary:"AI capex surging.", tags:["AI"], scenario:"tech_boom", emoji:"⚡" },
];

const terminalFeed = [
  { id:"t1", time:"06:42", cat:"RATES", priority:"flash", headline:"FED'S WALLER: 'NO URGENCY' TO CUT RATES, INFLATION STILL TOO HIGH", source:"FedWatch", impact:"bearish", assets:["TLT","IEF","XLU"], move:"-0.8%", desc:"Governor Waller pushes back on March cut expectations. Fed funds futures now pricing June as earliest cut. 2Y yield jumps 8bp to 4.68%." },
  { id:"t2", time:"06:38", cat:"EARNINGS", priority:"urgent", headline:"NVDA Q4 BEATS: REV $22.1B VS $20.4B EST — GUIDES Q1 $24B", source:"Bloomberg", impact:"bullish", assets:["NVDA","AMD","AVGO","SMH"], move:"+8.2%", desc:"Data center revenue surges 409% YoY to $18.4B. Jensen Huang: 'We are at a tipping point for accelerated computing.' Gross margin 76.7%." },
  { id:"t3", time:"06:31", cat:"MACRO", priority:"high", headline:"US INITIAL JOBLESS CLAIMS 187K VS 200K EST — LABOR MARKET STILL TIGHT", source:"DoL", impact:"mixed", assets:["SPY","DXY","TLT"], move:"+0.2%", desc:"Continuing claims fall to 1.806M. 4-week moving average at lowest since September. Supports higher-for-longer rate narrative." },
  { id:"t4", time:"06:24", cat:"COMMODITIES", priority:"high", headline:"BRENT CRUDE TOPS $87 ON OPEC+ SIGNAL OF EXTENDED CUTS THROUGH Q2", source:"Reuters", impact:"bearish", assets:["CL","XOM","CVX","XLE"], move:"+2.4%", desc:"Saudi Arabia reportedly agrees to extend voluntary 1M bpd cut. Geopolitical premium building as Red Sea disruptions continue." },
  { id:"t5", time:"06:18", cat:"FX", priority:"normal", headline:"DXY PUSHES TO 104.8 — YEN BREAKS 151 AS BOJ HOLDS RATES", source:"ForexLive", impact:"mixed", assets:["USD/JPY","EUR/USD","EEM"], move:"+0.4%", desc:"Dollar strength pressuring EM assets and commodities. BOJ Ueda says policy shift depends on spring wage negotiations." },
  { id:"t6", time:"06:12", cat:"CHINA", priority:"urgent", headline:"CHINA PROPERTY INDEX -4.2% — EVERGRANDE LIQUIDATION HEARING SET", source:"SCMP", impact:"bearish", assets:["FXI","KWEB","EEM","BABA"], move:"-3.1%", desc:"Country Garden misses another coupon payment. Beijing signals targeted stimulus but markets want more. HSI down 2.8%." },
  { id:"t7", time:"06:04", cat:"BONDS", priority:"high", headline:"US 10Y YIELD HITS 4.58% — HIGHEST SINCE NOV — TERM PREMIUM RISING", source:"Treasury", impact:"bearish", assets:["TLT","IEF","VNQ","XLU"], move:"-1.2%", desc:"$42B 7-year auction sees weak demand with 2.4bp tail. Bid-to-cover 2.36x vs 2.58x avg. Duration assets under pressure." },
  { id:"t8", time:"05:56", cat:"TECH", priority:"normal", headline:"META TO INVEST $35B IN AI INFRA IN 2025 — CAPEX GUIDANCE RAISED", source:"CNBC", impact:"bullish", assets:["META","NVDA","AVGO","MSFT"], move:"+2.1%", desc:"Zuckerberg: 'AI will be the most important technology of our generation.' Plans for custom silicon and massive GPU clusters." },
  { id:"t9", time:"05:48", cat:"GEOPOLITICAL", priority:"urgent", headline:"US SANCTIONS ON RUSSIAN OIL — INDIA BUYERS SCRAMBLE FOR ALTERNATIVES", source:"FT", impact:"mixed", assets:["CL","XOM","GLD","LMT"], move:"+1.8%", desc:"New sanctions target shadow fleet tankers. Indian refiners face supply gap. Brent risk premium estimated at $4-6/barrel." },
  { id:"t10", time:"05:41", cat:"CRYPTO", priority:"normal", headline:"BTC SPOT ETF DAILY INFLOWS HIT $673M — INSTITUTIONAL DEMAND SURGES", source:"CoinDesk", impact:"bullish", assets:["BTC-USD","ETH-USD","COIN"], move:"+4.6%", desc:"BlackRock's IBIT leads with $380M single-day inflow. Total AUM across all spot Bitcoin ETFs now exceeds $52B." },
  { id:"t11", time:"05:34", cat:"EUROPE", priority:"high", headline:"ECB'S LAGARDE: 'DISINFLATION ON TRACK' — MARKETS PRICE APRIL CUT", source:"ECB", impact:"bullish", assets:["EUR/USD","EFA","TLT"], move:"+0.6%", desc:"Eurozone CPI falls to 2.6% vs 2.8% est. Core inflation at 3.1%. Euro weakens against dollar as rate differential widens." },
  { id:"t12", time:"05:22", cat:"MACRO", priority:"flash", headline:"US GDP Q4 REVISED UP TO 3.4% — CONSUMER SPENDING RESILIENT", source:"BEA", impact:"bullish", assets:["SPY","QQQ","IWM","DXY"], move:"+0.5%", desc:"Personal consumption +3.0%. Business investment +3.7%. Inventory build contributes 0.7pp. No recession in sight." },
  { id:"t13", time:"05:14", cat:"DEFENSE", priority:"high", headline:"PENTAGON AWARDS $8.2B MISSILE DEFENSE CONTRACT — LMT, RTX BENEFIT", source:"DoD", impact:"bullish", assets:["LMT","RTX","GD","NOC"], move:"+1.4%", desc:"Multi-year procurement deal for next-gen interceptor systems. European NATO members increasing defense budgets to 2.5% GDP target." },
  { id:"t14", time:"05:06", cat:"ENERGY", priority:"normal", headline:"NATURAL GAS STORAGE DRAW -96 BCF VS -80 BCF EST — WINTER DEMAND", source:"EIA", impact:"bullish", assets:["NG","XLE","CL"], move:"+3.2%", desc:"Cold snap across Northeast drives larger-than-expected draw. Storage now 5.2% below 5-year average. Henry Hub at $3.42." },
  { id:"t15", time:"04:52", cat:"HEALTHCARE", priority:"normal", headline:"LLY'S MOUNJARO APPROVED FOR SLEEP APNEA — NEW $40B TAM", source:"FDA", impact:"bullish", assets:["LLY","NVO","UNH"], move:"+3.8%", desc:"Breakthrough designation expanded. Tirzepatide shows 63% reduction in AHI events. GLP-1 total addressable market expands significantly." },
  { id:"t16", time:"04:38", cat:"RATES", priority:"high", headline:"FED MINUTES: 'MOST OFFICIALS CONCERNED ABOUT CUTTING TOO SOON'", source:"FOMC", impact:"bearish", assets:["TLT","SPY","QQQ","IWM"], move:"-0.4%", desc:"Minutes reveal broad consensus on patience. Some participants noted upside risks to inflation from fiscal policy. QT pace unchanged." },
];

const allInstruments = [
  // Equities
  { ticker:"AAPL", name:"Apple", type:"equity", price:189.84, change:1.24 },
  { ticker:"MSFT", name:"Microsoft", type:"equity", price:415.60, change:0.87 },
  { ticker:"GOOGL", name:"Alphabet", type:"equity", price:155.72, change:-0.42 },
  { ticker:"AMZN", name:"Amazon", type:"equity", price:185.30, change:2.15 },
  { ticker:"NVDA", name:"NVIDIA", type:"equity", price:878.40, change:3.82 },
  { ticker:"TSLA", name:"Tesla", type:"equity", price:248.42, change:-1.80 },
  { ticker:"JPM", name:"JPMorgan", type:"equity", price:198.40, change:0.95 },
  { ticker:"XOM", name:"Exxon", type:"equity", price:118.50, change:1.85 },
  { ticker:"GLD", name:"SPDR Gold", type:"equity", price:212.80, change:0.45 },
  { ticker:"V", name:"Visa", type:"equity", price:284.60, change:0.62 },
  // Options
  { ticker:"SPY 540C 03/21", name:"SPY $540 Call", type:"option", price:12.40, change:8.50 },
  { ticker:"SPY 500P 03/21", name:"SPY $500 Put", type:"option", price:3.20, change:-12.40 },
  { ticker:"AAPL 200C 04/19", name:"AAPL $200 Call", type:"option", price:5.80, change:6.20 },
  { ticker:"QQQ 420P 03/21", name:"QQQ $420 Put", type:"option", price:4.60, change:-5.40 },
  { ticker:"NVDA 900C 03/21", name:"NVDA $900 Call", type:"option", price:18.20, change:14.80 },
  // Futures
  { ticker:"ES Mar26", name:"E-mini S&P 500", type:"future", price:5248.50, change:0.42 },
  { ticker:"NQ Mar26", name:"E-mini Nasdaq", type:"future", price:18420.00, change:0.68 },
  { ticker:"CL Mar26", name:"Crude Oil", type:"future", price:85.40, change:2.10 },
  { ticker:"GC Apr26", name:"Gold Future", type:"future", price:2185.60, change:0.32 },
  { ticker:"ZB Mar26", name:"30Y T-Bond", type:"future", price:118.28, change:-0.45 },
  { ticker:"ZN Mar26", name:"10Y T-Note", type:"future", price:110.42, change:-0.28 },
  // Bonds / Fixed Income
  { ticker:"TLT", name:"20+ Year Treasury ETF", type:"bond", price:92.40, change:-0.62 },
  { ticker:"IEF", name:"7-10 Year Treasury ETF", type:"bond", price:98.20, change:-0.34 },
  { ticker:"HYG", name:"High Yield Corp Bond", type:"bond", price:76.80, change:0.18 },
  { ticker:"TIPS", name:"TIPS Bond ETF", type:"bond", price:108.60, change:0.12 },
  { ticker:"BND", name:"Total Bond Market", type:"bond", price:72.40, change:-0.22 },
  // Forex
  { ticker:"EUR/USD", name:"Euro / Dollar", type:"forex", price:1.0842, change:-0.18 },
  { ticker:"USD/JPY", name:"Dollar / Yen", type:"forex", price:150.24, change:0.42 },
  { ticker:"GBP/USD", name:"Pound / Dollar", type:"forex", price:1.2648, change:0.08 },
  { ticker:"USD/CNH", name:"Dollar / Yuan (Off)", type:"forex", price:7.2180, change:0.24 },
  // Crypto
  { ticker:"BTC-USD", name:"Bitcoin", type:"crypto", price:62480.00, change:4.20 },
  { ticker:"ETH-USD", name:"Ethereum", type:"crypto", price:3420.00, change:3.10 },
];

const typeColors = { equity:"#42A5F5", option:"#AB47BC", future:"#FFA726", crypto:"#C48830", bond:"#C48830", forex:"#EF5350" };
const typeLabels = { equity:"Stock", option:"Option", future:"Future", crypto:"Crypto", bond:"Bond", forex:"FX" };
const typeEmojis = { equity:"📈", option:"📊", future:"⏳", crypto:"₿", bond:"🏛️", forex:"💱" };

const macroScenarios = [
  { id:"inflation", name:"🔥 High Inflation", desc:"Commodities & value", color:"coral" },
  { id:"recession", name:"🌧️ Recession Shield", desc:"Defensives & dividends", color:"golden" },
  { id:"bull", name:"🚀 Bull Market", desc:"Growth & momentum", color:"sage" },
  { id:"rates_down", name:"💰 Rate Cuts", desc:"REITs & duration", color:"terracotta" },
  { id:"geopolitical", name:"🌍 Geopolitical Risk", desc:"Defense & haven", color:"plum" },
  { id:"tech_boom", name:"⚡ AI & Tech Boom", desc:"Semis & cloud", color:"sky" },
];

const explorerBaskets = [
  { id:101, name:"Inflation Beaters", emoji:"🛡️", scenario:"inflation", strategy:"Global Macro", color:"coral", stocks:["XOM","CVX","GLD","BRK.B","COST"], assets:{equity:3,future:1,bond:1}, composition:["Long XOM, CVX, BRK.B","Long Gold Futures","Short TLT (duration)"], price:500, monthlyReturn:2.1, risk:"Medium", popularity:4.9, buyers:14200, desc:"Multi-asset inflation hedge: energy equities + gold futures + short duration", tags:["Inflation","Multi-Asset"] },
  { id:102, name:"Rate Cut Winners", emoji:"🏠", scenario:"rates_down", strategy:"Multi-Asset", color:"terracotta", stocks:["O","AMT","XLU","TLT","PLD"], assets:{equity:3,bond:2}, composition:["Long REITs: O, AMT, PLD","Long 20Y+ Treasuries","Long Utilities ETF"], price:650, monthlyReturn:1.6, risk:"Low", popularity:4.9, buyers:11800, desc:"REITs + long-duration bonds for Fed easing cycle", tags:["Rates","Income","Bonds"] },
  { id:103, name:"Recession Fortress", emoji:"🏰", scenario:"recession", strategy:"Defensive", color:"golden", stocks:["JNJ","PG","WMT","KO","MCD"], assets:{equity:5,option:2,bond:1}, composition:["Long staples: JNJ, PG, WMT, KO, MCD","Long SPY puts (tail hedge)","Long T-Bonds"], price:400, monthlyReturn:0.8, risk:"Low", popularity:4.9, buyers:18600, desc:"Staples + put protection + treasuries for downturns", tags:["Defensive","Options","Bonds"] },
  { id:104, name:"AI Infrastructure", emoji:"⚡", scenario:"tech_boom", strategy:"Growth + Derivs", color:"sky", stocks:["NVDA","AMD","AVGO","MSFT","AMZN"], assets:{equity:5,option:2,future:1}, composition:["Long NVDA, AMD, AVGO, MSFT, AMZN","Long NVDA calls (leverage)","Long Nasdaq futures"], price:1200, monthlyReturn:4.8, risk:"High", popularity:4.8, buyers:9200, desc:"AI equities + call options for leverage + Nasdaq futures", tags:["AI","Options","Futures"] },
  { id:105, name:"Geopolitical Hedge", emoji:"🛡️", scenario:"geopolitical", strategy:"Global Macro", color:"plum", stocks:["LMT","RTX","GLD","GD","NOC"], assets:{equity:3,future:1,forex:1,bond:1}, composition:["Long defense: LMT, RTX, GD","Long Gold futures","Long USD/JPY (safe haven)","Long T-Bonds"], price:800, monthlyReturn:1.9, risk:"Medium", popularity:4.7, buyers:6800, desc:"Defense stocks + gold + forex + bonds for geopolitical risk", tags:["Defense","FX","Multi-Asset"] },
  { id:106, name:"Bull Runners", emoji:"🐂", scenario:"bull", strategy:"Leveraged", color:"sage", stocks:["TQQQ","SPXL","ARKK","TSLA","COIN"], assets:{equity:3,option:2,future:1,crypto:1}, composition:["Long high-beta: TSLA, ARKK, COIN","Long SPY/QQQ calls","Long ES futures","Long BTC"], price:900, monthlyReturn:5.2, risk:"Very High", popularity:4.6, buyers:7400, desc:"Max leverage: calls + futures + crypto + high-beta equities", tags:["Leverage","Crypto","Options"] },
  { id:107, name:"Tech Giants", emoji:"💻", scenario:"tech_boom", strategy:"Growth", color:"sky", stocks:["AAPL","MSFT","GOOGL","AMZN","NVDA"], assets:{equity:5}, composition:["Long mega-cap tech: AAPL, MSFT, GOOGL, AMZN, NVDA"], price:850, monthlyReturn:3.4, risk:"Medium", popularity:4.9, buyers:22400, desc:"Large-cap tech leaders — the backbone of US equity markets", tags:["Tech","Growth"] },
  { id:108, name:"Dividend Kings", emoji:"👑", scenario:"rates_down", strategy:"Income", color:"golden", stocks:["JNJ","PG","KO","PEP","MMM"], assets:{equity:5}, composition:["Long 50+ year dividend aristocrats"], price:420, monthlyReturn:1.2, risk:"Low", popularity:4.8, buyers:16800, desc:"50+ years of consecutive dividend increases — ultimate income stability", tags:["Income","Defensive"] },
  { id:109, name:"Clean Energy", emoji:"🌱", scenario:"bull", strategy:"Thematic", color:"sage", stocks:["ENPH","SEDG","FSLR","RUN","PLUG"], assets:{equity:5}, composition:["Long solar, wind & hydrogen pure plays"], price:380, monthlyReturn:-2.3, risk:"High", popularity:4.5, buyers:8200, desc:"Solar, wind & hydrogen plays — high risk, high conviction green transition", tags:["ESG","Thematic"] },
  { id:110, name:"AI & Robotics", emoji:"🤖", scenario:"tech_boom", strategy:"Momentum", color:"plum", stocks:["NVDA","AMD","PLTR","PATH","ISRG"], assets:{equity:5,option:1}, composition:["Long AI leaders + NVDA call spreads"], price:1100, monthlyReturn:5.7, risk:"High", popularity:4.9, buyers:13600, desc:"AI & automation leaders — riding the capex super-cycle", tags:["AI","Momentum","Options"] },
  { id:111, name:"Healthcare Fortress", emoji:"💊", scenario:"recession", strategy:"Defensive", color:"coral", stocks:["UNH","LLY","ABBV","MRK","TMO"], assets:{equity:5}, composition:["Long pharma, biotech & managed care"], price:520, monthlyReturn:0.9, risk:"Low", popularity:4.8, buyers:10200, desc:"Pharma, biotech & services — defensive growth through all cycles", tags:["Healthcare","Defensive"] },
];

const recentTrades = [
  { id:1, basket:"Inflation Hedge", emoji:"🛡️", action:"Rebalance", date:"Feb 5", status:"Completed", amount:"+$420" },
  { id:2, basket:"Geopolitical Shield", emoji:"🌍", action:"Buy", date:"Feb 4", status:"Completed", amount:"+$1,200" },
  { id:3, basket:"Inflation Hedge", emoji:"🛡️", action:"Add Gold", date:"Feb 3", status:"Completed", amount:"+$380" },
  { id:4, basket:"Geopolitical Shield", emoji:"🌍", action:"Dividend", date:"Feb 2", status:"Received", amount:"+$86" },
];

// ═══════════════ MACRO REGIME ENGINE ═══════════════

const macroIndicators = [
  { id:"gdp", name:"GDP Growth", value:2.4, prev:2.1, unit:"%", trend:"up", signal:"bullish", weight:0.15 },
  { id:"cpi", name:"CPI (YoY)", value:3.4, prev:3.1, unit:"%", trend:"up", signal:"bearish", weight:0.2 },
  { id:"fedrate", name:"Fed Funds Rate", value:5.25, prev:5.25, unit:"%", trend:"flat", signal:"neutral", weight:0.2 },
  { id:"unemployment", name:"Unemployment", value:3.8, prev:3.7, unit:"%", trend:"up", signal:"bearish", weight:0.1 },
  { id:"pmi", name:"ISM PMI", value:52.1, prev:50.8, unit:"", trend:"up", signal:"bullish", weight:0.1 },
  { id:"yield10y", name:"10Y Yield", value:4.52, prev:4.38, unit:"%", trend:"up", signal:"bearish", weight:0.1 },
  { id:"vix", name:"VIX", value:18.4, prev:16.2, unit:"", trend:"up", signal:"bearish", weight:0.1 },
  { id:"dxy", name:"Dollar Index", value:104.2, prev:103.8, unit:"", trend:"up", signal:"neutral", weight:0.05 },
];

const regimes = {
  goldilocks: { name:"Goldilocks", emoji:"✨", color:"#C48830", bg:"#FFF8EE", desc:"Growth steady, inflation contained — ideal for risk assets", playbook:"Overweight equities, lean into growth & tech. Reduce cash and defensive hedges." },
  reflation: { name:"Reflation", emoji:"🔥", color:"#FFA726", bg:"#FFF3E0", desc:"Growth accelerating with rising prices — commodity cycle", playbook:"Overweight energy, materials, and TIPS. Reduce duration. Consider commodity baskets." },
  stagflation: { name:"Stagflation", emoji:"⚠️", color:"#EF5350", bg:"#FFEBEE", desc:"Slowing growth + persistent inflation — worst case", playbook:"Raise cash, overweight gold & commodities, reduce growth exposure. Add put protection." },
  riskoff: { name:"Risk-Off", emoji:"🛡️", color:"#42A5F5", bg:"#E3F2FD", desc:"Flight to safety — recession signals building", playbook:"Rotate to treasuries, defensives, and dividend stocks. Cut high-beta positions." },
};

function detectRegime(indicators) {
  const gdp = indicators.find(i => i.id === "gdp");
  const cpi = indicators.find(i => i.id === "cpi");
  const pmi = indicators.find(i => i.id === "pmi");
  const vix = indicators.find(i => i.id === "vix");
  const growthScore = (gdp.value > 2 ? 1 : 0) + (pmi.value > 50 ? 1 : 0);
  const inflScore = cpi.value > 3 ? 1 : 0;
  const fearScore = vix.value > 25 ? 1 : 0;
  if (growthScore >= 2 && !inflScore) return { ...regimes.goldilocks, confidence: 78 };
  if (growthScore >= 1 && inflScore) return { ...regimes.reflation, confidence: 72 };
  if (growthScore === 0 && inflScore) return { ...regimes.stagflation, confidence: 65 };
  if (fearScore || growthScore === 0) return { ...regimes.riskoff, confidence: 68 };
  return { ...regimes.goldilocks, confidence: 55 };
}

const currentRegime = detectRegime(macroIndicators);

const portfolioRisk = {
  sharpe: 1.42, beta: 1.18, maxDrawdown: -12.4, var95: -2847, var99: -4210,
  sectorConcentration: 48, topHolding: { ticker: "NVDA", pct: 14.2 },
  correlation: 0.72, volatility: 16.8, calmar: 1.14,
};

const realizedTrades = [
  { ticker: "TSLA", name: "Tesla", basket: "Inflation Hedge", emoji: "🛡️", buyPrice: 192.40, sellPrice: 248.60, shares: 8, date: "Jan 28", pl: 449.60 },
  { ticker: "META", name: "Meta", basket: "Inflation Hedge", emoji: "🛡️", buyPrice: 348.20, sellPrice: 412.80, shares: 5, date: "Jan 22", pl: 323.00 },
  { ticker: "GOOG", name: "Alphabet", basket: "Geopolitical Shield", emoji: "🌍", buyPrice: 142.60, sellPrice: 156.20, shares: 12, date: "Jan 15", pl: 163.20 },
  { ticker: "BA", name: "Boeing", basket: "Geopolitical Shield", emoji: "🌍", buyPrice: 218.40, sellPrice: 198.60, shares: 6, date: "Jan 10", pl: -118.80 },
  { ticker: "DIS", name: "Disney", basket: "Inflation Hedge", emoji: "🛡️", buyPrice: 98.40, sellPrice: 112.80, shares: 15, date: "Dec 18", pl: 216.00 },
  { ticker: "PYPL", name: "PayPal", basket: "Inflation Hedge", emoji: "🛡️", buyPrice: 68.20, sellPrice: 62.40, shares: 20, date: "Dec 5", pl: -116.00 },
  { ticker: "SQ", name: "Block", basket: "Geopolitical Shield", emoji: "🌍", buyPrice: 72.80, sellPrice: 84.20, shares: 10, date: "Nov 28", pl: 114.00 },
];

const basketCorrelations = [
  [1.00, 0.38],
  [0.38, 1.00],
];

const factorExposures = [
  { factor:"Growth", exposure:0.62, benchmark:0.35 },
  { factor:"Value", exposure:0.18, benchmark:0.30 },
  { factor:"Momentum", exposure:0.71, benchmark:0.25 },
  { factor:"Quality", exposure:0.45, benchmark:0.40 },
  { factor:"Low Vol", exposure:0.22, benchmark:0.45 },
  { factor:"Size (Sm Cap)", exposure:0.08, benchmark:0.25 },
];

const hedgeRecommendations = [
  { id:1, priority:"high", action:"BUY", instrument:"SPY 540P 03/21", desc:"Portfolio downside protection — CPI hot, 10Y rising", rationale:"With inflation above expectations and yields breaking out, tail risk is elevated. 5% OTM puts hedge ~$3,200 of downside.", cost:"$840", impact:"Caps max loss at -8%", regime:"reflation", emoji:"🛡️", expiresIn: 4, expiresUnit: "hrs", totalDuration: 24 },
  { id:2, priority:"high", action:"ADD", instrument:"GLD / Gold Futures", desc:"Inflation + geopolitical hedge", rationale:"Gold historically outperforms when real rates plateau and geopolitical risks rise. Current regime favors 5-8% allocation.", cost:"$1,500", impact:"+2.1% if stagflation", regime:"stagflation", emoji:"🥇", expiresIn: 18, expiresUnit: "hrs", totalDuration: 48 },
  { id:3, priority:"medium", action:"REDUCE", instrument:"Clean Energy (🌱)", desc:"Cut losing position — regime unfavorable", rationale:"Rising rates crush long-duration growth. Clean Energy basket has -28% drawdown and macro headwinds persist.", cost:"Frees $4,480", impact:"Reduces portfolio vol by 3.2%", regime:"reflation", emoji:"✂️", expiresIn: 2, expiresUnit: "days", totalDuration: 72 },
  { id:4, priority:"medium", action:"ROTATE", instrument:"Dividend Kings → TIPS ETF", desc:"Shift income sleeve to inflation-protected", rationale:"With CPI at 3.4%, nominal dividend yields lag real inflation. TIPS provide inflation-adjusted income.", cost:"Neutral swap", impact:"+1.8% real yield", regime:"reflation", emoji:"🔄", expiresIn: 3, expiresUnit: "days", totalDuration: 120 },
  { id:5, priority:"low", action:"BUY", instrument:"VIX Mar 22C", desc:"Volatility spike insurance", rationale:"VIX at 18 is cheap relative to macro uncertainty. Buying calls provides convex payoff if sell-off materializes.", cost:"$320", impact:"10x payoff if VIX > 30", regime:"any", emoji:"⚡", expiresIn: 5, expiresUnit: "days", totalDuration: 168 },
];

const tradeSignals = [
  { id:1, time:"11:42 AM", type:"macro", signal:"BUY", ticker:"TLT", name:"20+ Year Treasury ETF", reason:"Yield curve inversion deepening — flight to duration", strength:82, basket:"New: Rate Hedge", status:"pending", emoji:"🏦" },
  { id:2, time:"10:15 AM", type:"earnings", signal:"HOLD", ticker:"AMZN", name:"Amazon", reason:"Q4 earnings today AMC — wait for results before acting", strength:65, basket:"Tech Giants", status:"watching", emoji:"⏳" },
  { id:3, time:"9:30 AM", type:"rebalance", signal:"SELL", ticker:"PLUG", name:"Plug Power", reason:"Below 200-DMA, negative momentum, basket drag", strength:91, basket:"Clean Energy", status:"pending", emoji:"🔻" },
  { id:4, time:"9:00 AM", type:"macro", signal:"BUY", ticker:"XOM", name:"Exxon Mobil", reason:"CPI beat → energy outperforms in inflation regime", strength:76, basket:"New: Inflation", status:"pending", emoji:"🛢️" },
  { id:5, time:"Yesterday", type:"rebalance", signal:"TRIM", ticker:"NVDA", name:"NVIDIA", reason:"Position = 14.2% of portfolio — concentration risk", strength:70, basket:"Tech Giants + AI", status:"review", emoji:"⚖️" },
];

const stressScenarios = [
  { id:"rate_hike", name:"Surprise Rate Hike (+50bp)", emoji:"📈", impacts: { 1:-2.8, 2:-1.4 }, portfolioPL:-2.2 },
  { id:"recession", name:"Recession (GDP -2%)", emoji:"🌧️", impacts: { 1:-6.5, 2:-3.8 }, portfolioPL:-5.3 },
  { id:"bull_run", name:"Bull Rally (+15% SPX)", emoji:"🚀", impacts: { 1:8.4, 2:4.2 }, portfolioPL:6.5 },
  { id:"inflation_spike", name:"CPI Spikes to 5%", emoji:"🔥", impacts: { 1:4.2, 2:1.8 }, portfolioPL:3.1 },
  { id:"tech_crash", name:"Tech Sector -25%", emoji:"💥", impacts: { 1:-3.2, 2:1.4 }, portfolioPL:-1.1 },
  { id:"china_crisis", name:"China Credit Crisis", emoji:"🌍", impacts: { 1:-4.1, 2:5.6 }, portfolioPL:0.4 },
];

const optimalAllocation = [
  { basket:"Inflation Hedge", current:55, optimal:50, delta:-5 },
  { basket:"Geopolitical Shield", current:45, optimal:35, delta:-10 },
  { basket:"Cash / T-Bills", current:0, optimal:15, delta:15 },
];

const basketRiskMetrics = {
  1: { sharpe: 1.68, beta: 1.32, alpha: 4.2, volatility: 22.4, maxDD: -14.8, sortino: 2.1, treynor: 8.4, infoRatio: 0.92, trackError: 6.8, upCapture: 118, downCapture: 95 },
  2: { sharpe: 0.82, beta: 0.65, alpha: 1.1, volatility: 9.8, maxDD: -6.2, sortino: 1.0, treynor: 5.6, infoRatio: 0.34, trackError: 4.2, upCapture: 72, downCapture: 58 },
  3: { sharpe: -0.42, beta: 1.54, alpha: -8.6, volatility: 34.2, maxDD: -38.4, sortino: -0.38, treynor: -4.2, infoRatio: -0.68, trackError: 18.4, upCapture: 142, downCapture: 168 },
  4: { sharpe: 2.14, beta: 1.48, alpha: 12.8, volatility: 28.6, maxDD: -18.2, sortino: 2.8, treynor: 11.2, infoRatio: 1.24, trackError: 14.2, upCapture: 148, downCapture: 88 },
  5: { sharpe: 0.94, beta: 0.72, alpha: 2.4, volatility: 12.4, maxDD: -8.6, sortino: 1.2, treynor: 6.8, infoRatio: 0.48, trackError: 5.4, upCapture: 82, downCapture: 64 },
};

const explorerRiskMetrics = {
  101: { sharpe: 1.22, beta: 0.88, volatility: 16.2, maxDD: -12.4, sortino: 1.5 },
  102: { sharpe: 0.92, beta: 0.52, volatility: 10.8, maxDD: -7.8, sortino: 1.1 },
  103: { sharpe: 0.68, beta: 0.45, volatility: 8.2, maxDD: -5.4, sortino: 0.82 },
  104: { sharpe: 1.94, beta: 1.62, volatility: 32.4, maxDD: -22.8, sortino: 2.4 },
  105: { sharpe: 0.78, beta: 0.38, volatility: 14.6, maxDD: -10.2, sortino: 0.94 },
  106: { sharpe: 1.48, beta: 2.12, volatility: 42.8, maxDD: -35.6, sortino: 1.8 },
  107: { sharpe: 1.56, beta: 1.18, volatility: 22.4, maxDD: -16.8, sortino: 1.9 },
  108: { sharpe: 0.82, beta: 0.42, volatility: 9.6, maxDD: -6.2, sortino: 0.98 },
  109: { sharpe: 0.44, beta: 1.78, volatility: 38.6, maxDD: -42.1, sortino: 0.52 },
  110: { sharpe: 2.08, beta: 1.54, volatility: 34.8, maxDD: -28.4, sortino: 2.6 },
  111: { sharpe: 0.96, beta: 0.58, volatility: 12.4, maxDD: -8.8, sortino: 1.14 },
};

const explorerStockPrices = {
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
        {[0, .25, .5, .75, 1].map((p, i) => { const yy = PY + p * (H - PY * 2); return <g key={i}><line x1={PX} y1={yy} x2={W - PX} y2={yy} stroke="#F0E6D0" strokeWidth=".8" /><text x={PX - 6} y={yy + 4} textAnchor="end" fill="#A09080" fontSize="9" fontFamily="JetBrains Mono">{"$" + ((mx - p * (mx - mn)) / 1000).toFixed(1) + "k"}</text></g>; })}
        <path d={area} fill={"url(#g_" + chartId + ")"} /><path d={line} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill="#fff" stroke={color} strokeWidth="2" />)}
        {pts.map((p, i) => <text key={"t" + i} x={p.x} y={H - 1} textAnchor="middle" fill="#A09080" fontSize="9" fontFamily="Quicksand" fontWeight="600">{p.l}</text>)}
        {tip && <g><line x1={tip.x} y1={PY} x2={tip.x} y2={H - PY} stroke={color} strokeWidth="1" strokeDasharray="4,4" opacity=".4" /><circle cx={tip.x} cy={tip.y} r="6" fill={color} stroke="#fff" strokeWidth="3" /></g>}
      </svg>
      {tip && <div style={{ position: "absolute", top: 6, right: 6, background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 12, padding: "6px 12px", fontFamily: "JetBrains Mono", fontSize: 12 }}><span style={{ color: "#A09080" }}>{tip.l}</span><span style={{ marginLeft: 8, color, fontWeight: 700 }}>{fmt(tip.v)}</span></div>}
    </div>
  );
}

function StatCard({ label, value, sub, emoji, color = "terracotta", delay = 0 }) {
  const c = CL[color] || CL.terracotta;
  return (
    <div style={{ background: c.l, border: "1.5px solid transparent", borderRadius: 12, padding: "8px 10px", animation: "fadeUp .5s ease " + delay + "s both", flex: "1 1 80px", minWidth: 80, transition: "all .3s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = c.a; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontSize: 8, color: "#A09080", textTransform: "uppercase", letterSpacing: .8, marginBottom: 2, fontWeight: 700 }}>{label}</div>
        <span style={{ fontSize: 9 }}>{emoji}</span>
      </div>
      <div style={{ fontSize: 11, fontWeight: 900, fontFamily: "Poppins", color: c.a }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: "#8A7040", marginTop: 1, fontWeight: 500 }}>{sub}</div>}
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
        <h1 style={{ fontSize: 10, fontWeight: 900, fontFamily: "Poppins" }}>📅 Earnings & Events Calendar</h1>
        <p style={{ color: "#A09080", fontSize: 11, marginTop: 4 }}>S&P 500 earnings, macro events & company catalysts — plan your strategy ahead</p>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10, flexWrap: "wrap", animation: "fadeUp .4s ease both" }}>
        <StatCard label="Earnings" value={monthEarnings} emoji="📋" color="sky" />
        <StatCard label="Events" value={monthEvents} emoji="📌" color="golden" />
        <StatCard label="High Impact" value={highImpact} emoji="🔴" color="coral" />
        <StatCard label="This Week" value={upcoming.filter(e => e.date <= "2026-02-13").length} emoji="⚡" color="plum" />
      </div>

      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6, animation: "fadeUp .4s ease .1s both" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setViewMonth(Math.max(0, viewMonth - 1))} disabled={viewMonth === 0}
            style={{ width: 36, height: 36, borderRadius: 12, border: "1.5px solid #F0E6D0", background: "#fff", cursor: viewMonth === 0 ? "default" : "pointer", fontSize: 12, opacity: viewMonth === 0 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
          <div style={{ fontSize: 10, fontWeight: 900, fontFamily: "Poppins", minWidth: 0, textAlign: "center", flex: "1" }}>{cur.label}</div>
          <button onClick={() => setViewMonth(Math.min(months.length - 1, viewMonth + 1))} disabled={viewMonth === months.length - 1}
            style={{ width: 36, height: 36, borderRadius: 12, border: "1.5px solid #F0E6D0", background: "#fff", cursor: viewMonth === months.length - 1 ? "default" : "pointer", fontSize: 12, opacity: viewMonth === months.length - 1 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>→</button>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[{ k: "all", l: "All" }, { k: "earnings", l: "📋 Earnings" }, { k: "event", l: "📌 Events" }].map(f => (
            <button key={f.k} onClick={() => setTypeFilter(f.k)} style={{ padding: "7px 14px", borderRadius: 12, border: "1.5px solid " + (typeFilter === f.k ? "#C48830" : "#F0E6D0"), background: typeFilter === f.k ? "#FFF8EE" : "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Quicksand", color: typeFilter === f.k ? "#C48830" : "#A09080" }}>{f.l}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 3, background: "#fff", borderRadius: 10, padding: 3 }}>
          {["calendar", "list"].map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: viewMode === m ? "#fff" : "transparent", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Quicksand", color: viewMode === m ? "#5C4A1E" : "#A09080" }}>{m === "calendar" ? "📅 Grid" : "📋 List"}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedDate ? "1fr 360px" : "1fr", gap: 8, animation: "fadeUp .5s ease .15s both" }}>
        {/* Calendar / List View */}
        <div>
          {viewMode === "calendar" && (
            <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, overflow: "hidden" }}>
              {/* Day headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "2px solid #F0E6D0", background: "#fff" }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                  <div key={d} style={{ padding: "10px 0", textAlign: "center", fontSize: 11, fontWeight: 800, color: "#A09080", textTransform: "uppercase", letterSpacing: 1 }}>{d}</div>
                ))}
              </div>
              {/* Day cells */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={"e" + i} style={{ minHeight: 90, borderRight: "1px solid #F0E6D0", borderBottom: "1px solid #F0E6D0" }} />
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
                      style={{ minHeight: 90, padding: "6px 8px", borderRight: "1px solid #F0E6D0", borderBottom: "1px solid #F0E6D0", cursor: "pointer", background: isSelected ? "#FFF8EE" : isToday ? "#fff" : isWeekend ? "#FFFDF5" : "#fff", transition: "background .15s", position: "relative" }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#fff"; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isToday ? "#fff" : isWeekend ? "#FFFDF5" : "#fff"; }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: isToday ? 900 : 600, fontFamily: "Poppins", color: isToday ? "#C48830" : "#5C4A1E", background: isToday ? "#C48830" : "transparent", width: isToday ? 24 : "auto", height: isToday ? 24 : "auto", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", ...(isToday ? { background: "#C48830", color: "#fff", width: 24, height: 24 } : {}) }}>{day}</span>
                        {evts.length > 0 && (
                          <span style={{ fontSize: 9, fontWeight: 800, background: evts.some(e => e.impact === "high") ? "#FFEBEE" : "#FFF3E0", color: evts.some(e => e.impact === "high") ? "#EF5350" : "#FFA726", padding: "1px 6px", borderRadius: 8 }}>{evts.length}</span>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {evts.slice(0, 3).map((ev, j) => (
                          <div key={j} style={{ fontSize: 9, fontWeight: 700, padding: "2px 5px", borderRadius: 6, background: ev.type === "earnings" ? "#E3F2FD" : "#FFF3E0", color: ev.type === "earnings" ? "#42A5F5" : "#FFA726", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                            {ev.type === "earnings" ? "📋 " : (ev.emoji || "📌") + " "}{ev.ticker === "MACRO" ? ev.name.slice(0, 12) : ev.ticker}
                          </div>
                        ))}
                        {evts.length > 3 && <div style={{ fontSize: 9, color: "#A09080", fontWeight: 700, paddingLeft: 5 }}>+{evts.length - 3} more</div>}
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
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#A09080", textTransform: "uppercase" }}>{dayName}</div>
                      <div style={{ fontSize: 12, fontWeight: 900, fontFamily: "Poppins", color: isToday ? "#C48830" : "#5C4A1E" }}>{dayNum}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 8, background: ev.type === "earnings" ? "#E3F2FD" : "#FFF3E0", color: ev.type === "earnings" ? "#42A5F5" : "#FFA726", textTransform: "uppercase" }}>{ev.type === "earnings" ? "Earnings" : "Event"}</span>
                        <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 12, color: ev.type === "earnings" ? "#42A5F5" : "#FFA726" }}>{ev.ticker}</span>
                        {ev.time && <span style={{ fontSize: 9, color: "#A09080", fontWeight: 700 }}>{ev.time}</span>}
                        <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 6, background: impactBg[ev.impact], color: impactColor[ev.impact], marginLeft: "auto" }}>{ev.impact}</span>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 11, fontFamily: "Poppins" }}>{ev.name}</div>
                      <div style={{ fontSize: 11, color: "#A09080" }}>
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
          <div style={{ animation: "slideRight .3s ease both" }}>
            <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 20, position: "sticky", top: 80 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#A09080", fontWeight: 700, textTransform: "uppercase" }}>
                    {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" })}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 900, fontFamily: "Poppins" }}>
                    {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                  </div>
                </div>
                <button onClick={() => setSelectedDate(null)} style={{ width: 32, height: 32, borderRadius: 10, border: "none", background: "#fff", cursor: "pointer", fontSize: 11, color: "#A09080" }}>✕</button>
              </div>

              {selectedEvents.length === 0 && (
                <div style={{ textAlign: "center", padding: "30px 0", color: "#A09080" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>No events on this day</div>
                </div>
              )}

              {selectedEvents.map((ev, i) => (
                <div key={i} style={{ background: ev.type === "earnings" ? "#E3F2FD" : "#FFF3E0", borderRadius: 16, padding: "16px 18px", marginBottom: i < selectedEvents.length - 1 ? 10 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 8, background: "#fff", color: ev.type === "earnings" ? "#42A5F5" : "#FFA726", textTransform: "uppercase" }}>{ev.type}</span>
                        <span style={{ fontFamily: "JetBrains Mono", fontWeight: 800, fontSize: 10 }}>{ev.ticker}</span>
                      </div>
                      <div style={{ fontWeight: 900, fontSize: 12, fontFamily: "Poppins" }}>{ev.name}</div>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 8, background: impactBg[ev.impact], color: impactColor[ev.impact] }}>{ev.impact}</span>
                  </div>
                  {ev.type === "earnings" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginTop: 8 }}>
                      <div style={{ background: "#fff", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}><div style={{ fontSize: 8, color: "#A09080", textTransform: "uppercase", fontWeight: 700 }}>Quarter</div><div style={{ fontWeight: 800, fontSize: 10, fontFamily: "Poppins" }}>{ev.quarter}</div></div>
                      <div style={{ background: "#fff", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}><div style={{ fontSize: 8, color: "#A09080", textTransform: "uppercase", fontWeight: 700 }}>Expected</div><div style={{ fontWeight: 800, fontSize: 10, fontFamily: "JetBrains Mono", color: "#42A5F5" }}>{ev.expected}</div></div>
                      <div style={{ background: "#fff", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}><div style={{ fontSize: 8, color: "#A09080", textTransform: "uppercase", fontWeight: 700 }}>Timing</div><div style={{ fontWeight: 800, fontSize: 10 }}>{ev.time === "BMO" ? "🌅 Pre" : "🌙 Post"}</div></div>
                    </div>
                  )}
                  {ev.type === "event" && (
                    <div style={{ fontSize: 10, color: "#8A7040", lineHeight: 1.6, marginTop: 4 }}>{ev.desc}</div>
                  )}
                  <div style={{ fontSize: 10, color: "#A09080", marginTop: 8, fontWeight: 600 }}>Sector: {ev.sector}</div>
                  {/* Strategy hint */}
                  <div style={{ background: "#fff", borderRadius: 12, padding: "7px 10px", marginTop: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#C48830", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>💡 Strategy Hint</div>
                    <div style={{ fontSize: 12, color: "#8A7040", lineHeight: 1.5 }}>
                      {ev.type === "earnings" && ev.impact === "high" && "High-impact earnings — consider straddles or position sizing before the report. Volatility typically spikes 24h prior."}
                      {ev.type === "earnings" && ev.impact === "medium" && "Monitor for sector-wide signals. This report can move peers in the same basket."}
                      {ev.type === "event" && ev.impact === "high" && "Major macro catalyst — review your basket exposure. Consider hedging or adding to macro-aligned baskets."}
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
      <div style={{ marginTop: 24, background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, animation: "fadeUp .5s ease .2s both" }}>
        <div style={{ fontSize: 12, fontWeight: 900, fontFamily: "Poppins", marginBottom: 7 }}>⚡ Coming Up Next</div>
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
                    <span style={{ fontSize: 10, fontWeight: 700, color: isToday ? "#C48830" : "#A09080" }}>{isToday ? "TODAY" : label}</span>
                    <span style={{ fontSize: 8, fontWeight: 800, padding: "1px 6px", borderRadius: 6, background: impactBg[ev.impact], color: impactColor[ev.impact] }}>{ev.impact}</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 10, fontFamily: "Poppins", marginTop: 2, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    {ev.type === "earnings" ? "📋 " : (ev.emoji || "📌") + " "}{ev.name}
                  </div>
                  <div style={{ fontSize: 10, color: "#A09080", marginTop: 1 }}>
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
    <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 12, padding: "8px 10px", animation: "fadeUp .5s ease .35s both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 10 }}>📅</span>
          <span style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins" }}>Upcoming</span>
        </div>
        <button onClick={onViewAll} style={{ background: "none", border: "none", color: "#C48830", fontWeight: 800, fontSize: 9, cursor: "pointer" }}>See All →</button>
      </div>
      {upcoming.map((ev, i) => {
        const dateObj = new Date(ev.date + "T12:00:00");
        const label = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const isToday = ev.date === todayStr;
        return (
          <div key={i} style={{ display: "flex", gap: 6, padding: "5px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none", alignItems: "center" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: isToday ? "#FFF8EE" : "#FFFDF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, fontFamily: "Poppins", color: isToday ? "#C48830" : "#8A7040", flexShrink: 0, border: isToday ? "1.5px solid #C48830" : "1px solid #F0E6D0" }}>{label.split(" ")[1]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 9, fontFamily: "Poppins", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{ev.type === "earnings" ? ev.ticker + " Earnings" : ev.name}</div>
              <div style={{ fontSize: 8, color: "#A09080" }}>{isToday ? "Today" : label}{ev.time ? " · " + ev.time : ""}</div>
            </div>
            <span style={{ fontSize: 7, fontWeight: 800, padding: "1px 5px", borderRadius: 4, background: ev.impact === "high" ? "#FFEBEE" : "#FFF3E0", color: ev.impact === "high" ? "#EF5350" : "#FFA726", flexShrink: 0 }}>{ev.impact}</span>
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
      : a.emoji + " " + a.title
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
          <span style={{ fontSize: 12 }}>{current.emoji}</span>
          <span style={{ fontSize: 8, fontWeight: 900, padding: "1px 6px", borderRadius: 4, background: sCol[current.severity], color: "#fff", textTransform: "uppercase" }}>{current.severity}</span>
          {crit > 1 && <span style={{ fontSize: 8, color: sCol[current.severity], fontWeight: 700 }}>{crit} alerts</span>}
        </div>
        {/* Slide dots */}
        <div style={{ display: "flex", gap: 3 }}>
          {slides.map((_, i) => (
            <div key={i} onClick={(e) => { e.stopPropagation(); setActiveSlide(i); }} style={{ width: i === activeSlide ? 12 : 5, height: 5, borderRadius: 3, background: i === activeSlide ? sCol[slides[i].severity] : sCol[slides[i].severity] + "44", transition: "all .3s", cursor: "pointer" }} />
          ))}
        </div>
      </div>
      {/* Headline */}
      <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", color: sCol[current.severity], lineHeight: 1.3, transition: "all .3s" }}>{current.headline}</div>
      {/* Tap hint */}
      <div style={{ fontSize: 7, color: "#A09080", marginTop: 3, fontWeight: 700 }}>Tap for details →</div>
      {/* Progress bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: sCol[current.severity] + "22" }}>
        <div style={{ height: "100%", background: sCol[current.severity], animation: "alertProgress 3.5s linear infinite", width: "100%" }} />
      </div>
    </div>
  );
}

function AlertsPage({ alerts }) {
  const [filter, setFilter] = useState("all");
  const [termCat, setTermCat] = useState("ALL");
  const [expandedItem, setExpandedItem] = useState(null);
  const sCol = { critical: "#EF5350", warning: "#FFA726", info: "#42A5F5" };
  const sBg = { critical: "#FFEBEE", warning: "#FFF3E0", info: "#E3F2FD" };
  const filtered = filter === "all" ? alerts : alerts.filter(a => a.severity === filter);

  const catColors = { RATES:"#EF5350", EARNINGS:"#AB47BC", MACRO:"#42A5F5", COMMODITIES:"#FFA726", FX:"#C48830", CHINA:"#EF5350", BONDS:"#C48830", TECH:"#AB47BC", GEOPOLITICAL:"#8A7040", CRYPTO:"#C48830", EUROPE:"#42A5F5", DEFENSE:"#8A7040", ENERGY:"#FFA726", HEALTHCARE:"#C48830" };
  const impactColors = { bullish:"#C48830", bearish:"#EF5350", mixed:"#FFA726" };
  const prioStyles = { flash:{ bg:"#EF5350", color:"#fff", label:"⚡ FLASH" }, urgent:{ bg:"#FFA726", color:"#fff", label:"🔴 URGENT" }, high:{ bg:"#FFF3E0", color:"#FFA726", label:"HIGH" }, normal:{ bg:"#FFF5E6", color:"#8A7040", label:"" } };

  const allCats = [...new Set(terminalFeed.map(f => f.cat))];
  const filteredFeed = termCat === "ALL" ? terminalFeed : terminalFeed.filter(f => f.cat === termCat);

  return (
    <div>
      <div style={{ marginBottom: 10, animation: "fadeUp .3s ease both" }}>
        <h1 style={{ fontSize: 10, fontWeight: 900, fontFamily: "Poppins" }}>🚨 Macro Alerts</h1>
        <p style={{ color: "#A09080", fontSize: 11, marginTop: 4 }}>Economic signals & live macro news feed</p>
      </div>

      {/* ── Alert Summary Cards ── */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10, flexWrap: "wrap" }}>
        {[{ k: "all", l: "All", n: alerts.length, c: "#5C4A1E", bg: "#fff" }, { k: "critical", l: "🔴 Critical", n: alerts.filter(a => a.severity === "critical").length, c: "#EF5350", bg: "#FFEBEE" }, { k: "warning", l: "🟡 Warning", n: alerts.filter(a => a.severity === "warning").length, c: "#FFA726", bg: "#FFF3E0" }, { k: "info", l: "🔵 Info", n: alerts.filter(a => a.severity === "info").length, c: "#42A5F5", bg: "#E3F2FD" }].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)} style={{ flex: "1 1 120px", padding: "12px 16px", borderRadius: 16, border: "1.5px solid " + (filter === f.k ? f.c : "transparent"), background: f.bg, cursor: "pointer", textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: f.c }}>{f.l}</div>
            <div style={{ fontSize: 12, fontWeight: 900, fontFamily: "Poppins", color: f.c }}>{f.n}</div>
          </button>
        ))}
      </div>

      {/* ── Active Alerts ── */}
      {filtered.map((a, i) => (
        <div key={a.id} style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: "18px 22px", marginBottom: 12, borderLeft: "4px solid " + sCol[a.severity], animation: "fadeUp .4s ease " + (i * .05) + "s both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 12 }}>{a.emoji}</span>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 12, fontFamily: "Poppins" }}>{a.title}</div></div>
            <span style={{ fontSize: 9, fontWeight: 800, background: sBg[a.severity], color: sCol[a.severity], padding: "3px 10px", borderRadius: 10 }}>{a.severity.toUpperCase()}</span>
            <span style={{ fontSize: 11, color: "#A09080" }}>{a.time} ago</span>
          </div>
          <div style={{ fontSize: 10, color: "#8A7040", lineHeight: 1.6 }}>{a.summary}</div>
        </div>
      ))}

      {/* ═══════════ NEWS TERMINAL ═══════════ */}
      <div style={{ background: "#0D1117", border: "1.5px solid #1C2333", borderRadius: 14, overflow: "hidden", marginTop: 24, animation: "fadeUp .5s ease .2s both" }}>

        {/* Terminal Header */}
        <div style={{ background: "linear-gradient(90deg, #0D1117, #161B26)", padding: "14px 22px", borderBottom: "1px solid #1C2333", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF5350" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFA726" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#C48830" }} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 900, fontFamily: "JetBrains Mono", color: "#58A6FF", letterSpacing: 1 }}>MACRO TERMINAL</div>
            <div style={{ fontSize: 10, color: "#484F58", fontFamily: "JetBrains Mono" }}>LIVE FEED</div>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#C48830", animation: "pulse 2s infinite" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, fontFamily: "JetBrains Mono", color: "#484F58" }}>FEB 06 2026</span>
            <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: "#58A6FF", fontWeight: 700 }}>06:42 ET</span>
          </div>
        </div>

        {/* Ticker Tape */}
        <div style={{ background: "#161B26", padding: "6px 0", borderBottom: "1px solid #1C2333", overflow: "hidden", position: "relative" }}>
          <div style={{ display: "flex", gap: 24, paddingLeft: 22, fontSize: 11, fontFamily: "JetBrains Mono", whiteSpace: "nowrap" }}>
            {[
              { t: "ES", v: "5,248", c: "+0.42%", up: true }, { t: "NQ", v: "18,420", c: "+0.68%", up: true },
              { t: "DXY", v: "104.8", c: "+0.38%", up: true }, { t: "10Y", v: "4.58%", c: "+8bp", up: false },
              { t: "CL", v: "$87.2", c: "+2.4%", up: true }, { t: "GC", v: "$2,186", c: "+0.3%", up: true },
              { t: "BTC", v: "$62.5K", c: "+4.6%", up: true }, { t: "VIX", v: "18.4", c: "+1.2", up: false },
              { t: "EUR", v: "1.084", c: "-0.18%", up: false }, { t: "JPY", v: "151.2", c: "+0.4%", up: false },
            ].map((tk, i) => (
              <span key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ color: "#8B949E", fontWeight: 700 }}>{tk.t}</span>
                <span style={{ color: "#E6EDF3" }}>{tk.v}</span>
                <span style={{ color: tk.up ? "#3FB950" : "#F85149", fontWeight: 700 }}>{tk.c}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div style={{ padding: "10px 22px", borderBottom: "1px solid #1C2333", display: "flex", gap: 4, flexWrap: "wrap" }}>
          <button onClick={() => setTermCat("ALL")} style={{ padding: "3px 10px", borderRadius: 6, border: `1px solid ${termCat === "ALL" ? "#58A6FF" : "#1C2333"}`, background: termCat === "ALL" ? "#58A6FF22" : "transparent", color: termCat === "ALL" ? "#58A6FF" : "#484F58", fontSize: 10, fontWeight: 700, fontFamily: "JetBrains Mono", cursor: "pointer" }}>ALL</button>
          {allCats.map(cat => (
            <button key={cat} onClick={() => setTermCat(cat)} style={{ padding: "3px 10px", borderRadius: 6, border: `1px solid ${termCat === cat ? catColors[cat] || "#58A6FF" : "#1C2333"}`, background: termCat === cat ? (catColors[cat] || "#58A6FF") + "22" : "transparent", color: termCat === cat ? catColors[cat] || "#58A6FF" : "#484F58", fontSize: 10, fontWeight: 700, fontFamily: "JetBrains Mono", cursor: "pointer", textTransform: "uppercase" }}>{cat}</button>
          ))}
        </div>

        {/* Feed Items */}
        <div style={{ maxHeight: 300, overflow: "auto" }}>
          {filteredFeed.map((item, i) => {
            const prio = prioStyles[item.priority] || prioStyles.normal;
            const isExpanded = expandedItem === item.id;
            const cc = catColors[item.cat] || "#58A6FF";
            return (
              <div key={item.id} onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                style={{ padding: "12px 22px", borderBottom: "1px solid #1C233366", cursor: "pointer", transition: "background .15s", background: isExpanded ? "#161B26" : "transparent" }}
                onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = "#161B2688"; }}
                onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = "transparent"; }}>

                {/* Main headline row */}
                <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                  <div style={{ minWidth: 42, fontSize: 11, fontFamily: "JetBrains Mono", color: "#484F58", paddingTop: 2 }}>{item.time}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 3, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 9, fontWeight: 800, fontFamily: "JetBrains Mono", padding: "1px 6px", borderRadius: 4, background: cc + "22", color: cc }}>{item.cat}</span>
                      {prio.label && <span style={{ fontSize: 8, fontWeight: 800, padding: "1px 6px", borderRadius: 4, background: prio.bg, color: prio.color }}>{prio.label}</span>}
                      <span style={{ fontSize: 9, fontFamily: "JetBrains Mono", color: "#484F58" }}>{item.source}</span>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "JetBrains Mono", color: item.priority === "flash" ? "#F0883E" : "#E6EDF3", lineHeight: 1.4 }}>{item.headline}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, minWidth: 0 }}>
                    <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", fontWeight: 700, color: impactColors[item.impact] || "#484F58" }}>
                      {item.impact === "bullish" ? "▲" : item.impact === "bearish" ? "▼" : "◆"} {item.move}
                    </span>
                    <span style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", color: impactColors[item.impact], letterSpacing: .5 }}>{item.impact}</span>
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div style={{ marginTop: 10, marginLeft: 52, animation: "fadeUp .2s ease both" }}>
                    <div style={{ fontSize: 12, color: "#8B949E", lineHeight: 1.6, marginBottom: 10, borderLeft: "2px solid " + cc, paddingLeft: 12 }}>{item.desc}</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 9, fontFamily: "JetBrains Mono", color: "#484F58" }}>AFFECTED:</span>
                      {item.assets.map(a => (
                        <span key={a} style={{ fontSize: 10, fontFamily: "JetBrains Mono", fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: (impactColors[item.impact] || "#484F58") + "18", color: impactColors[item.impact] || "#8B949E" }}>{a}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Terminal Footer */}
        <div style={{ padding: "8px 22px", borderTop: "1px solid #1C2333", background: "#161B26", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ fontSize: 9, fontFamily: "JetBrains Mono", color: "#484F58" }}>{filteredFeed.length} ITEMS</span>
            <span style={{ fontSize: 9, fontFamily: "JetBrains Mono", color: "#484F58" }}>FLASH: {terminalFeed.filter(f => f.priority === "flash").length}</span>
            <span style={{ fontSize: 9, fontFamily: "JetBrains Mono", color: "#484F58" }}>URGENT: {terminalFeed.filter(f => f.priority === "urgent").length}</span>
          </div>
          <span style={{ fontSize: 9, fontFamily: "JetBrains Mono", color: "#3FB950" }}>● CONNECTED — AUTO-REFRESH</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════ CREATE BASKET MODAL ═══════════════

function CreateBasketModal({ onClose, onCreate }) {
  const [name, setName] = useState(""); const [emoji, setEmoji] = useState("🧺"); const [strat, setStrat] = useState("Custom");
  const [search, setSearch] = useState(""); const [typeF, setTypeF] = useState("all"); const [selected, setSelected] = useState([]); const [step, setStep] = useState(1);
  const [directions, setDirections] = useState({});
  const filtered = allInstruments.filter(i => (typeF === "all" || i.type === typeF) && (!search || i.ticker.toLowerCase().includes(search.toLowerCase()) || i.name.toLowerCase().includes(search.toLowerCase())));
  const toggle = (inst) => { if (selected.find(s => s.ticker === inst.ticker)) { setSelected(selected.filter(s => s.ticker !== inst.ticker)); } else { setSelected([...selected, inst]); setDirections(d => ({ ...d, [inst.ticker]: "long" })); } };
  const flipDir = (ticker) => { setDirections(d => ({ ...d, [ticker]: d[ticker] === "long" ? "short" : "long" })); };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(45,32,22,.4)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 16, width: "calc(100% - 24px)", maxWidth: 360, maxHeight: "90vh", overflow: "auto", animation: "popIn .4s ease" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "2px solid #F0E6D0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 12 }}>✨</span><div><div style={{ fontSize: 10, fontWeight: 900, fontFamily: "Poppins" }}>Create Your Own Basket</div><div style={{ fontSize: 11, color: "#A09080" }}>Step {step}/2</div></div></div>
          <button onClick={onClose} style={{ background: "#fff", border: "none", width: 32, height: 32, borderRadius: 10, cursor: "pointer", fontSize: 11, color: "#A09080" }}>✕</button>
        </div>
        <div style={{ padding: "18px 24px" }}>
          {step === 1 && (<div>
            <div style={{ marginBottom: 8 }}><label style={{ fontSize: 10, fontWeight: 800, color: "#A09080", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. My Growth Picks" style={{ width: "100%", padding: "12px 16px", borderRadius: 14, border: "1.5px solid #F0E6D0", fontSize: 11, fontWeight: 700, fontFamily: "Poppins", outline: "none", background: "#FFFDF5" }} onFocus={e => e.target.style.borderColor = "#C48830"} onBlur={e => e.target.style.borderColor = "#F0E6D0"} /></div>
            <div style={{ marginBottom: 8 }}><label style={{ fontSize: 10, fontWeight: 800, color: "#A09080", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Icon</label><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{["🧺","🎯","💎","🔮","🦅","🌊","🏔️","🎨","⭐","🔥","🌈","🍀"].map(e => (<button key={e} onClick={() => setEmoji(e)} style={{ width: 40, height: 40, borderRadius: 12, border: "1.5px solid " + (emoji === e ? "#C48830" : "#F0E6D0"), background: emoji === e ? "#FFF8EE" : "#fff", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{e}</button>))}</div></div>
            <div style={{ marginBottom: 10 }}><label style={{ fontSize: 10, fontWeight: 800, color: "#A09080", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Strategy</label><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{["Custom","Growth","Income","Defensive","Momentum","Global Macro","Multi-Asset","Long/Short","Speculative"].map(s => (<button key={s} onClick={() => setStrat(s)} style={{ padding: "6px 14px", borderRadius: 12, border: "1.5px solid " + (strat === s ? "#C48830" : "#F0E6D0"), background: strat === s ? "#FFF8EE" : "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Quicksand", color: strat === s ? "#C48830" : "#8A7040" }}>{s}</button>))}</div></div>
            <button onClick={() => { if (name.trim()) setStep(2); }} disabled={!name.trim()} style={{ width: "100%", padding: 14, background: name.trim() ? "linear-gradient(135deg,#C48830,#EF5350)" : "#F0E6D0", color: name.trim() ? "#fff" : "#A09080", border: "none", borderRadius: 16, fontSize: 11, fontWeight: 900, cursor: name.trim() ? "pointer" : "default", fontFamily: "Poppins" }}>Next: Add Instruments →</button>
          </div>)}
          {step === 2 && (<div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "7px 10px", background: "#fff", borderRadius: 14, marginBottom: 7 }}>
              <span style={{ fontSize: 12 }}>{emoji}</span><div><div style={{ fontWeight: 800, fontFamily: "Poppins" }}>{name}</div><div style={{ fontSize: 11, color: "#A09080" }}>{strat} · {selected.length} selected</div></div>
              <button onClick={() => setStep(1)} style={{ marginLeft: "auto", fontSize: 11, color: "#C48830", fontWeight: 800, background: "none", border: "none", cursor: "pointer" }}>Edit ←</button>
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stocks, options, futures, crypto..." style={{ width: "100%", padding: "10px 16px 10px 38px", borderRadius: 14, border: "1.5px solid #F0E6D0", fontSize: 10, fontWeight: 600, fontFamily: "Quicksand", outline: "none", background: "#FFFDF5", marginBottom: 10 }} />
            <div style={{ display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap" }}>
              {[{ k: "all", l: "All" }, { k: "equity", l: "📈 Stocks" }, { k: "option", l: "📊 Options" }, { k: "future", l: "⏳ Futures" }, { k: "bond", l: "🏛️ Bonds" }, { k: "forex", l: "💱 FX" }, { k: "crypto", l: "₿ Crypto" }].map(f => (
                <button key={f.k} onClick={() => setTypeF(f.k)} style={{ padding: "5px 12px", borderRadius: 10, border: "1.5px solid " + (typeF === f.k ? "#C48830" : "#F0E6D0"), background: typeF === f.k ? "#FFF8EE" : "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", color: typeF === f.k ? "#C48830" : "#A09080" }}>{f.l}</button>
              ))}
            </div>
            {selected.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10, padding: "8px 12px", background: "#FFF8EE", borderRadius: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#C48830", alignSelf: "center" }}>Selected:</span>
              {selected.map(s => { const d = directions[s.ticker] || "long"; return (
                <div key={s.ticker} style={{ display: "flex", alignItems: "center", gap: 2, padding: "2px 4px 2px 8px", borderRadius: 8, background: "#fff", fontSize: 10, fontWeight: 700, fontFamily: "JetBrains Mono" }}>
                  <span style={{ color: d === "short" ? "#EF5350" : "#C48830" }}>{s.ticker}</span>
                  <button onClick={(e) => { e.stopPropagation(); flipDir(s.ticker); }} style={{ padding: "1px 4px", borderRadius: 4, border: "none", background: d === "short" ? "#FFEBEE" : "#FFF8EE", color: d === "short" ? "#EF5350" : "#C48830", fontSize: 8, fontWeight: 900, cursor: "pointer" }}>{d === "short" ? "S" : "L"}</button>
                  <button onClick={() => toggle(s)} style={{ background: "none", border: "none", fontSize: 10, cursor: "pointer", color: "#A09080", padding: 0 }}>×</button>
                </div>);
              })}
            </div>}
            <div style={{ maxHeight: 200, overflow: "auto", borderRadius: 14, border: "1.5px solid #F0E6D0" }}>
              {filtered.map((inst, i) => { const sel = !!selected.find(s => s.ticker === inst.ticker); const tc = typeColors[inst.type] || "#A09080"; return (
                <div key={inst.ticker} onClick={() => toggle(inst)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderBottom: i < filtered.length - 1 ? "1px solid #F0E6D0" : "none", cursor: "pointer", background: sel ? "#FFF8EE" : "transparent", transition: "background .15s" }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.background = "#fff"; }} onMouseLeave={e => { if (!sel) e.currentTarget.style.background = "transparent"; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", border: "1.5px solid " + (sel ? "#C48830" : "#F0E6D0"), background: sel ? "#C48830" : "transparent" }} />
                    <div><div style={{ display: "flex", gap: 6, alignItems: "center" }}><span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 12 }}>{inst.ticker}</span><span style={{ fontSize: 8, fontWeight: 800, background: tc + "22", color: tc, padding: "1px 6px", borderRadius: 6, textTransform: "uppercase" }}>{typeLabels[inst.type]}</span></div><div style={{ fontSize: 11, color: "#A09080" }}>{inst.name}</div></div>
                  </div>
                  <div style={{ textAlign: "right" }}><div style={{ fontFamily: "JetBrains Mono", fontWeight: 600, fontSize: 12 }}>{inst.price > 1000 ? fmt(inst.price) : fmtD(inst.price)}</div><div style={{ fontSize: 10, fontWeight: 700, color: inst.change >= 0 ? "#5B8C5A" : "#EF5350" }}>{inst.change >= 0 ? "+" : ""}{inst.change}%</div></div>
                </div>); })}
            </div>
            <button onClick={() => { if (selected.length > 0) { onCreate({ name, emoji, strategy: strat, instruments: selected }); onClose(); } }} disabled={!selected.length}
              style={{ width: "100%", marginTop: 14, padding: 14, background: selected.length ? "linear-gradient(135deg,#C48830,#5B9B5E)" : "#F0E6D0", color: selected.length ? "#fff" : "#A09080", border: "none", borderRadius: 16, fontSize: 11, fontWeight: 900, cursor: selected.length ? "pointer" : "default", fontFamily: "Poppins" }}>
              🧺 Create with {selected.length} Instrument{selected.length !== 1 ? "s" : ""}
            </button>
          </div>)}
        </div>
      </div>
    </div>
  );
}

// ═══════════════ BASKET DETAIL ═══════════════

function BasketDetail({ basket, onBack }) {
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
    return <StockDetailPage stock={selectedStock} basketName={basket.name} onBack={() => setSelectedStock(null)} />;
  }

  return (
    <div style={{ animation: "slideRight .4s ease both" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <button onClick={onBack} style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 12, width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>←</button>
        <span style={{ fontSize: 36 }}>{basket.emoji}</span>
        <div style={{ flex: 1 }}><div style={{ fontSize: 10, fontWeight: 900, fontFamily: "Poppins" }}>{basket.name}</div><div style={{ fontSize: 12, color: "#A09080" }}>{basket.strategy} · {stocks.length} instruments</div></div>
        {rm && <button onClick={() => setShowMetrics(!showMetrics)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 14, border: "1.5px solid " + (showMetrics ? c.a : "#F0E6D0"), background: showMetrics ? c.l : "#fff", cursor: "pointer", fontSize: 11, fontWeight: 800, fontFamily: "Quicksand", color: showMetrics ? c.a : "#8A7040", transition: "all .2s" }}>
          {showMetrics ? "📊 Holdings" : "🧪 Risk Metrics"}
        </button>}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        <StatCard label="Value" value={fmt(tv)} emoji={basket.emoji} color={basket.color} /><StatCard label="Total P&L" value={fmtS(tp)} sub={pct((tp / tc) * 100)} emoji={tp >= 0 ? "📈" : "📉"} color={tp >= 0 ? "sage" : "coral"} /><StatCard label="Today" value={fmtS(dp)} emoji="⚡" color={dp >= 0 ? "sage" : "coral"} /><StatCard label="Cost" value={fmt(tc)} emoji="💰" color="golden" />
      </div>
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, marginBottom: 10 }}><div style={{ fontSize: 11, fontWeight: 800, fontFamily: "Poppins", marginBottom: 7 }}>📈 Performance</div><MiniChart data={history} color={c.a} chartId={"d_" + basket.id} /></div>

      {/* ── Risk Metrics Panel ── */}
      {showMetrics && rm ? (
        <div style={{ animation: "fadeUp .3s ease both", marginBottom: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            {/* Key Ratios */}
            <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, fontFamily: "Poppins", marginBottom: 7 }}>📐 Key Ratios</div>
              {[
                { label: "Sharpe Ratio", val: rm.sharpe.toFixed(2), good: rm.sharpe > 1, tip: "Risk-adjusted return" },
                { label: "Sortino Ratio", val: rm.sortino.toFixed(2), good: rm.sortino > 1, tip: "Downside risk-adjusted" },
                { label: "Treynor Ratio", val: rm.treynor.toFixed(1), good: rm.treynor > 5, tip: "Return per unit of beta" },
                { label: "Info Ratio", val: rm.infoRatio.toFixed(2), good: rm.infoRatio > 0.5, tip: "Active return vs tracking error" },
                { label: "Alpha", val: (rm.alpha >= 0 ? "+" : "") + rm.alpha.toFixed(1) + "%", good: rm.alpha > 0, tip: "Excess return over benchmark" },
                { label: "Calmar Ratio", val: (Math.abs(tp / tc * 100) / Math.abs(rm.maxDD)).toFixed(2), good: true, tip: "Return / max drawdown" },
              ].map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none" }}>
                  <div><div style={{ fontWeight: 700, fontSize: 12, fontFamily: "Poppins" }}>{m.label}</div><div style={{ fontSize: 9, color: "#A09080" }}>{m.tip}</div></div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 700, color: m.good ? "#5B8C5A" : "#EF5350" }}>{m.val}</div>
                </div>
              ))}
            </div>
            {/* Risk Profile */}
            <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, fontFamily: "Poppins", marginBottom: 7 }}>⚡ Risk Profile</div>
              {[
                { label: "Beta", val: rm.beta.toFixed(2), good: rm.beta < 1.3, bar: rm.beta / 2, tip: "Market sensitivity" },
                { label: "Volatility", val: rm.volatility.toFixed(1) + "%", good: rm.volatility < 20, bar: rm.volatility / 50, tip: "Annualized std dev" },
                { label: "Max Drawdown", val: rm.maxDD.toFixed(1) + "%", good: rm.maxDD > -15, bar: Math.abs(rm.maxDD) / 50, tip: "Worst peak-to-trough" },
                { label: "Tracking Error", val: rm.trackError.toFixed(1) + "%", good: true, bar: rm.trackError / 25, tip: "Deviation from benchmark" },
              ].map((m, i) => (
                <div key={i} style={{ padding: "10px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div><span style={{ fontWeight: 700, fontSize: 12, fontFamily: "Poppins" }}>{m.label}</span> <span style={{ fontSize: 9, color: "#A09080" }}>{m.tip}</span></div>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 700, color: m.good ? "#5B8C5A" : "#EF5350" }}>{m.val}</span>
                  </div>
                  <div style={{ height: 6, background: "#FFF5E6", borderRadius: 3 }}>
                    <div style={{ height: "100%", width: Math.min(m.bar * 100, 100) + "%", background: m.good ? "#5B8C5A" : "#EF5350", borderRadius: 3, transition: "width .5s" }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ background: rm.upCapture > 100 ? "#FFF8EE" : "#FFF3E0", borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: "#A09080", textTransform: "uppercase" }}>Up Capture</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 700, color: rm.upCapture > 100 ? "#C48830" : "#FFA726" }}>{rm.upCapture}%</div>
                </div>
                <div style={{ background: rm.downCapture < 100 ? "#EDF5ED" : "#FFEBEE", borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: "#A09080", textTransform: "uppercase" }}>Down Capture</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 700, color: rm.downCapture < 100 ? "#5B8C5A" : "#EF5350" }}>{rm.downCapture}%</div>
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
              <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 18, padding: "14px 18px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, fontFamily: "Poppins" }}>Asset Composition</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: "#FFF8EE", color: "#C48830" }}>LONG {longCount}</span>
                    {shortCount > 0 && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: "#FFEBEE", color: "#EF5350" }}>SHORT {shortCount}</span>}
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
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#8A7040" }}>{typeLabels[type] || type} ({count})</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <button onClick={() => setEditMode(editMode === "rebalance" ? null : "rebalance")} style={{ flex: 1, padding: "8px 10px", borderRadius: 14, border: "1.5px solid " + (editMode === "rebalance" ? c.a : "#F0E6D0"), background: editMode === "rebalance" ? c.l : "#fff", cursor: "pointer", fontSize: 10, fontWeight: 800, fontFamily: "Poppins" }}>⚖️ Rebalance</button>
            <button onClick={() => setEditMode(editMode === "add" ? null : "add")} style={{ flex: 1, padding: "8px 10px", borderRadius: 14, border: "1.5px solid " + (editMode === "add" ? c.a : "#F0E6D0"), background: editMode === "add" ? c.l : "#fff", cursor: "pointer", fontSize: 10, fontWeight: 800, fontFamily: "Poppins" }}>➕ Add</button>
          </div>
          {editMode && <div style={{ background: c.l, border: "1.5px solid " + c.a, borderRadius: 14, padding: "8px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", animation: "popIn .3s ease" }}>
            <span style={{ fontWeight: 800, fontFamily: "Poppins", color: c.a, fontSize: 9 }}>Tap a stock below to {editMode}</span>
            <div style={{ display: "flex", gap: 4 }}><button onClick={() => setEditMode(null)} style={{ padding: "5px 10px", borderRadius: 8, border: "none", background: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 10 }}>Cancel</button><button onClick={() => setEditMode(null)} style={{ padding: "5px 10px", borderRadius: 8, border: "none", background: c.a, color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 10 }}>Apply</button></div>
          </div>}
          <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "8px 12px", borderBottom: "1.5px solid #F0E6D0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", color: "#5C4A1E" }}>Holdings</span>
              <span style={{ fontSize: 8, color: "#A09080", fontWeight: 600 }}>{stocks.length} instruments</span>
            </div>
            {stocks.map((st, i) => {
              const pl = (st.current - st.avgCost) * st.shares * ((st.dir || "long") === "short" ? -1 : 1);
              const plPct = ((st.current - st.avgCost) / st.avgCost * 100) * ((st.dir || "long") === "short" ? -1 : 1);
              const sparkData = genSparkline(st.avgCost, st.current, st.ticker);
              const sparkColor = st.change >= 0 ? "#5B8C5A" : "#EF5350";
              return (
              <div key={st.ticker + i} onClick={() => setSelectedStock(st)} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
                borderBottom: i < stocks.length - 1 ? "1px solid #F0E6D0" : "none",
                cursor: "pointer", transition: "background .15s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#FFFDF5"} onMouseLeave={e => e.currentTarget.style.background = ""}>
                {/* Left: name + ticker */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, fontFamily: "Poppins", color: "#5C4A1E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{st.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
                    <span style={{ fontSize: 8, fontFamily: "JetBrains Mono", color: "#A09080", fontWeight: 600 }}>{st.ticker}</span>
                    <span style={{ fontSize: 8, fontFamily: "JetBrains Mono", color: "#A09080" }}>·</span>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#A09080" }}>{st.shares} shares</span>
                  </div>
                </div>
                {/* Center: sparkline */}
                <div style={{ width: 60, flexShrink: 0 }}>
                  <SparkSVG data={sparkData} color={sparkColor} />
                </div>
                {/* Right: price + P&L */}
                <div style={{ textAlign: "right", minWidth: 70, flexShrink: 0 }}>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 800, color: "#5C4A1E" }}>
                    ${st.current >= 1000 ? st.current.toLocaleString() : st.current.toFixed(2)}
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 3, marginTop: 1 }}>
                    <span style={{ fontSize: 8, fontFamily: "JetBrains Mono", fontWeight: 700, color: pl >= 0 ? "#5B8C5A" : "#EF5350" }}>
                      {pl >= 0 ? "+" : ""}{pl >= 1000 || pl <= -1000 ? (pl / 1000).toFixed(1) + "k" : Math.round(pl)}
                    </span>
                    <span style={{ fontSize: 7, fontWeight: 800, padding: "1px 4px", borderRadius: 3, background: (plPct >= 0 ? "#5B8C5A" : "#EF5350") + "14", color: plPct >= 0 ? "#5B8C5A" : "#EF5350" }}>
                      {plPct >= 0 ? "+" : ""}{plPct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                {/* Arrow */}
                <span style={{ fontSize: 10, color: "#D0C8B8", marginLeft: 2 }}>›</span>
              </div>
            ); })}
          </div>

          {/* ── Portfolio Risk Metrics ── */}
          <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", marginBottom: 7 }}>📊 Portfolio Risk Metrics</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 8 }}>
              {[
                { label: "Sharpe", val: portfolioRisk.sharpe.toFixed(2), good: portfolioRisk.sharpe > 1, icon: "📐" },
                { label: "Beta", val: portfolioRisk.beta.toFixed(2), good: portfolioRisk.beta < 1.3, icon: "📊" },
                { label: "Vol", val: portfolioRisk.volatility.toFixed(1) + "%", good: portfolioRisk.volatility < 20, icon: "〰️" },
                { label: "Max DD", val: portfolioRisk.maxDrawdown.toFixed(1) + "%", good: portfolioRisk.maxDrawdown > -15, icon: "📉" },
                { label: "VaR 95%", val: fmtS(portfolioRisk.var95), good: false, icon: "⚠️" },
                { label: "Calmar", val: portfolioRisk.calmar.toFixed(2), good: portfolioRisk.calmar > 1, icon: "🎯" },
              ].map((m, mi) => (
                <div key={mi} style={{ background: m.good ? "#EDF5ED" : "#FFEBEE", borderRadius: 8, padding: "6px 6px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, marginBottom: 1 }}>{m.icon}</div>
                  <div style={{ fontSize: 7, fontWeight: 700, color: "#A09080", textTransform: "uppercase" }}>{m.label}</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 800, color: m.good ? "#5B8C5A" : "#EF5350" }}>{m.val}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: "6px 8px", background: portfolioRisk.sectorConcentration > 40 ? "#FFEBEE" : "#FFF8EE", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 8, fontWeight: 800, fontFamily: "Poppins" }}>⚠️ Concentration</div>
                <div style={{ fontSize: 7, color: "#8A7040" }}>Top: {portfolioRisk.topHolding.ticker} ({portfolioRisk.topHolding.pct}%)</div>
              </div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 700, color: "#EF5350" }}>{portfolioRisk.sectorConcentration}%</div>
            </div>
          </div>

          {/* ── Per-Basket Risk Metrics ── */}
          <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", marginBottom: 7 }}>🧪 Per-Basket Metrics</div>
            <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #F0E6D0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr .7fr .7fr .7fr", padding: "6px 10px", background: "#FFFDF5", fontSize: 7, fontWeight: 800, color: "#A09080", textTransform: "uppercase", letterSpacing: .5, borderBottom: "1.5px solid #F0E6D0" }}>
                <div>Basket</div><div>Sharpe</div><div>Beta</div><div>Alpha</div>
              </div>
              {myBaskets.map((mb, mi) => { const brm = basketRiskMetrics[mb.id]; if (!brm) return null; return (
                <div key={mb.id} style={{ display: "grid", gridTemplateColumns: "1.4fr .7fr .7fr .7fr", padding: "6px 10px", borderBottom: mi < myBaskets.length - 1 ? "1px solid #F0E6D0" : "none", fontSize: 10, alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}><span style={{ fontSize: 9 }}>{mb.emoji}</span><span style={{ fontWeight: 700, fontFamily: "Poppins", fontSize: 8 }}>{mb.name}</span></div>
                  <div style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 9, color: brm.sharpe > 1 ? "#C48830" : "#FFA726" }}>{brm.sharpe.toFixed(2)}</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontWeight: 600, fontSize: 9, color: brm.beta < 1.3 ? "#5B8C5A" : "#EF5350" }}>{brm.beta.toFixed(2)}</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 9, color: brm.alpha > 0 ? "#5B8C5A" : "#EF5350" }}>{brm.alpha > 0 ? "+" : ""}{brm.alpha.toFixed(1)}%</div>
                </div>); })}
            </div>
          </div>

          {/* ── Factor Exposures ── */}
          <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", marginBottom: 7 }}>📈 Factor Exposures</div>
            {factorExposures.map((f, fi) => {
              const overweight = f.exposure > f.benchmark;
              return (
                <div key={fi} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0", borderTop: fi > 0 ? "1px solid #F0E6D020" : "none" }}>
                  <span style={{ fontSize: 8, fontWeight: 700, color: "#5C4A1E", width: 55 }}>{f.factor}</span>
                  <div style={{ flex: 1, position: "relative", height: 8, background: "#F5F0E8", borderRadius: 4 }}>
                    <div style={{ position: "absolute", left: (f.benchmark * 100) + "%", top: 0, bottom: 0, width: 1.5, background: "#A0908066", zIndex: 1 }} />
                    <div style={{ height: "100%", width: (f.exposure * 100) + "%", background: overweight ? "#C48830" : "#5B8C5A", borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 8, fontFamily: "JetBrains Mono", fontWeight: 800, color: overweight ? "#C48830" : "#5B8C5A", minWidth: 24, textAlign: "right" }}>{(f.exposure * 100).toFixed(0)}%</span>
                </div>
              );
            })}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: 7, color: "#A09080" }}>
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

function genSparkline(avgCost, current, ticker) {
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

function StockDetailPage({ stock, basketName, onBack }) {
  const [period, setPeriod] = useState("1Y");
  const [orderType, setOrderType] = useState(null);
  const [shares, setShares] = useState(1);
  const history = genStockHistory(stock.avgCost, stock.current, stock.ticker);
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
        <button onClick={onBack} style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 10, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 900, fontFamily: "Poppins", color: "#5C4A1E" }}>{stock.name}</div>
          <div style={{ fontSize: 9, color: "#A09080", fontFamily: "JetBrains Mono" }}>{stock.ticker} · {basketName}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 7, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: (stock.dir === "short" ? "#FFEBEE" : "#FFF8EE"), color: (stock.dir === "short" ? "#EF5350" : "#C48830"), textTransform: "uppercase" }}>{stock.dir || "long"}</div>
        </div>
      </div>

      {/* Price hero */}
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 16, padding: "14px 14px 10px", marginBottom: 8 }}>
        <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "Poppins", color: "#5C4A1E", letterSpacing: "-1px" }}>${stock.current >= 1000 ? stock.current.toLocaleString() : stock.current.toFixed(2)}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 700, color }}>{isUp ? "▲" : "▼"} {isUp ? "+" : ""}{stock.change}%</span>
          <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 700, color, background: color + "12", padding: "2px 6px", borderRadius: 5 }}>{isUp ? "+" : ""}{(stock.current * stock.change / 100).toFixed(2)}</span>
          <span style={{ fontSize: 8, color: "#A09080" }}>Today</span>
        </div>
        <div style={{ margin: "12px 0 6px" }}>
          <MiniChart data={history} color={color} chartId={"stock_" + stock.ticker.replace(/[^a-zA-Z]/g, "")} />
        </div>
        <div style={{ display: "flex", gap: 1, background: "#FFFDF5", borderRadius: 8, padding: 2, width: "fit-content" }}>
          {["1D","1W","1M","3M","1Y","ALL"].map(t => <button key={t} onClick={() => setPeriod(t)} style={{ padding: "3px 8px", borderRadius: 6, border: "none", background: period === t ? "#fff" : "transparent", color: period === t ? "#C48830" : "#A09080", fontSize: 8, fontWeight: 800, cursor: "pointer", boxShadow: period === t ? "0 1px 4px rgba(0,0,0,.06)" : "none" }}>{t}</button>)}
        </div>
      </div>

      {/* Your Position */}
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>📊 Your Position</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[
            { label: "Shares", value: stock.shares.toString(), color: "#5C4A1E" },
            { label: "Market Value", value: "$" + (marketVal >= 1000 ? (marketVal / 1000).toFixed(2) + "k" : marketVal.toFixed(0)), color: "#5C4A1E" },
            { label: "Avg Cost", value: "$" + (stock.avgCost >= 1000 ? stock.avgCost.toLocaleString() : stock.avgCost.toFixed(2)), color: "#A09080" },
            { label: "Cost Basis", value: "$" + (costBasis >= 1000 ? (costBasis / 1000).toFixed(2) + "k" : costBasis.toFixed(0)), color: "#A09080" },
            { label: "Total Return", value: (plUp ? "+" : "") + "$" + Math.abs(Math.round(pl)).toLocaleString(), color: plUp ? "#5B8C5A" : "#EF5350" },
            { label: "Return %", value: (plUp ? "+" : "") + plPct.toFixed(2) + "%", color: plUp ? "#5B8C5A" : "#EF5350" },
          ].map((m, i) => (
            <div key={i} style={{ background: "#FFFDF5", borderRadius: 8, padding: "7px 8px" }}>
              <div style={{ fontSize: 7, fontWeight: 700, color: "#A09080", textTransform: "uppercase" }}>{m.label}</div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 800, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Stats */}
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", marginBottom: 8 }}>📐 Key Stats</div>
        {[
          { label: "Open", val: "$" + (stock.current * (1 - stock.change / 200)).toFixed(2) },
          { label: "Day High", val: "$" + (stock.current * 1.008).toFixed(2) },
          { label: "Day Low", val: "$" + (stock.current * 0.992).toFixed(2) },
          { label: "52W High", val: "$" + (stock.current * 1.25).toFixed(2) },
          { label: "52W Low", val: "$" + (stock.current * 0.68).toFixed(2) },
          { label: "Volume", val: (Math.floor(Math.random() * 50 + 10)).toFixed(1) + "M" },
          { label: "Avg Volume", val: (Math.floor(Math.random() * 40 + 15)).toFixed(1) + "M" },
          { label: "Market Cap", val: "$" + (stock.current * (Math.random() * 5 + 1)).toFixed(0) + "B" },
          { label: "P/E Ratio", val: (Math.random() * 30 + 10).toFixed(1) },
          { label: "Div Yield", val: (Math.random() * 3).toFixed(2) + "%" },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none" }}>
            <span style={{ fontSize: 9, color: "#A09080", fontWeight: 600 }}>{s.label}</span>
            <span style={{ fontSize: 9, fontFamily: "JetBrains Mono", fontWeight: 700, color: "#5C4A1E" }}>{s.val}</span>
          </div>
        ))}
      </div>

      {/* Buy / Sell Actions */}
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          <button onClick={() => setOrderType(orderType === "buy" ? null : "buy")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: orderType === "buy" ? "#5B8C5A" : "#EDF5ED", color: orderType === "buy" ? "#fff" : "#5B8C5A", fontSize: 11, fontWeight: 900, cursor: "pointer", fontFamily: "Poppins" }}>Buy</button>
          <button onClick={() => setOrderType(orderType === "sell" ? null : "sell")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: orderType === "sell" ? "#EF5350" : "#FFEBEE", color: orderType === "sell" ? "#fff" : "#EF5350", fontSize: 11, fontWeight: 900, cursor: "pointer", fontFamily: "Poppins" }}>Sell</button>
        </div>
        {orderType && (
          <div style={{ animation: "fadeUp .2s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#A09080" }}>Shares</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => setShares(Math.max(1, shares - 1))} style={{ width: 26, height: 26, borderRadius: "50%", border: "1.5px solid #F0E6D0", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#EF5350", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 900, color: "#5C4A1E", minWidth: 24, textAlign: "center" }}>{shares}</span>
                <button onClick={() => setShares(shares + 1)} style={{ width: 26, height: 26, borderRadius: "50%", border: "1.5px solid #F0E6D0", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#5B8C5A", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 8, color: "#A09080" }}>Market Price</span>
              <span style={{ fontSize: 9, fontFamily: "JetBrains Mono", fontWeight: 700 }}>${stock.current.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid #F0E6D0" }}>
              <span style={{ fontSize: 8, color: "#A09080" }}>Est. Total</span>
              <span style={{ fontSize: 11, fontFamily: "Poppins", fontWeight: 900, color: "#5C4A1E" }}>${(stock.current * shares).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <button style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: orderType === "buy" ? "linear-gradient(135deg,#5B8C5A,#4CAF50)" : "linear-gradient(135deg,#EF5350,#E53935)", color: "#fff", fontSize: 11, fontWeight: 900, cursor: "pointer", fontFamily: "Poppins" }}>
              {orderType === "buy" ? "🛒" : "📤"} {orderType === "buy" ? "Buy" : "Sell"} {shares} {shares === 1 ? "Share" : "Shares"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════ AI EXECUTION AGENT ═══════════════

function AIAgent({ onNotify, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [executedActions, setExecutedActions] = useState(new Set());
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
  return `- ${b.emoji} ${b.name} (${b.strategy}): Value $${b.value.toLocaleString()}, Change ${b.change}%, P&L ${b.totalPL >= 0 ? "+" : ""}$${b.totalPL.toLocaleString()}, Allocation ${b.allocation}%, Health: ${health.label}${rm ? `, Sharpe ${rm.sharpe}, Beta ${rm.beta}, Alpha ${rm.alpha}%, Vol ${rm.volatility}%, MaxDD ${rm.maxDD}%` : ""}
  Holdings: ${(basketStocks[b.id] || []).map(s => `${s.ticker} (${s.shares} shares @ $${s.avgCost} → $${s.current}, ${s.change >= 0 ? "+" : ""}${s.change}%)`).join(", ")}`;
}).join("\n")}

MACRO REGIME: ${currentRegime.name} (${currentRegime.confidence}% confidence) — ${currentRegime.desc}
Playbook: ${currentRegime.playbook}

KEY INDICATORS: ${macroIndicators.map(i => `${i.name}: ${i.value}${i.unit} (${i.signal})`).join(", ")}

PORTFOLIO RISK: Sharpe ${portfolioRisk.sharpe}, Beta ${portfolioRisk.beta}, Vol ${portfolioRisk.volatility}%, MaxDD ${portfolioRisk.maxDrawdown}%, VaR95 -$${Math.abs(portfolioRisk.var95)}, Concentration: ${portfolioRisk.sectorConcentration}% (top: ${portfolioRisk.topHolding.ticker} at ${portfolioRisk.topHolding.pct}%)

ACTIVE SIGNALS: ${tradeSignals.map(s => `${s.signal} ${s.ticker} — ${s.reason} (${s.strength}%)`).join("; ")}

HEDGE RECOMMENDATIONS: ${hedgeRecommendations.map(h => `${h.action} ${h.instrument} — ${h.desc} (${h.priority})`).join("; ")}

OPTIMAL ALLOCATION (for ${currentRegime.name}): ${optimalAllocation.map(a => `${a.basket}: ${a.current}% → ${a.optimal}% (${a.delta > 0 ? "+" : ""}${a.delta}%)`).join(", ")}`;
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
          max_tokens: 1000,
          system: `You are the AI Execution Agent for BasketTrade, a macro-driven portfolio management platform. You help users analyze their portfolio, rebalance baskets, execute trades, and make macro-informed investment decisions.

You have access to the user's full portfolio data below. Use it to give specific, actionable advice.

${portfolioContext()}

RESPONSE FORMAT RULES:
1. Be concise and direct — this is a trading terminal, not a blog.
2. Use numbers and specifics from the portfolio data.
3. When suggesting an action, include an ACTION block on its own line in exactly this format:
   [ACTION:TYPE:DETAILS:LABEL]
   Where TYPE is one of: REBALANCE, BUY, SELL, TRIM, HEDGE, ROTATE, ANALYZE
   DETAILS is a short description
   LABEL is the button text
4. You can include multiple actions.
5. Always reference the current macro regime when relevant.
6. If asked to rebalance, compute the specific % shifts needed.
7. If asked about risk, reference Sharpe, Beta, VaR, etc.
8. Keep responses under 200 words.`,
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
    onNotify("✓ " + action.label + " — executed");
  };

  const parseMessage = (text) => {
    const parts = [];
    const lines = text.split("\n");
    let currentText = [];

    lines.forEach(line => {
      const actionMatch = line.match(/\[ACTION:(\w+):([^:]+):([^\]]+)\]/);
      if (actionMatch) {
        if (currentText.length > 0) {
          parts.push({ type: "text", content: currentText.join("\n") });
          currentText = [];
        }
        parts.push({ type: "action", actionType: actionMatch[1], details: actionMatch[2], label: actionMatch[3] });
      } else {
        currentText.push(line);
      }
    });
    if (currentText.length > 0) parts.push({ type: "text", content: currentText.join("\n") });
    return parts;
  };

  const formatText = (text) => {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} style={{ fontWeight: 800, color: "#5C4A1E" }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const quickActions = [
    { label: "📊 Portfolio Analysis", prompt: "Give me a full analysis of my portfolio — what's working, what's not, and what I should do about it given the current macro regime." },
    { label: "⚖️ Rebalance Plan", prompt: "Create a specific rebalance plan for my portfolio based on the current macro regime. Show me exactly what % to shift and why." },
    { label: "🛡️ Hedge Strategy", prompt: "What hedges should I put on right now given the macro environment? Be specific about instruments, sizing, and cost." },
    { label: "🌱 Fix Clean Energy", prompt: "My Clean Energy basket is down badly. Should I cut losses, average down, or restructure it? What would you do?" },
    { label: "⚠️ Risk Check", prompt: "Run a risk check on my portfolio. What are the biggest risks I'm exposed to right now and how should I address them?" },
    { label: "🔥 Macro Outlook", prompt: "What's the macro outlook right now? How should I position my portfolio for the next 3-6 months?" },
  ];

  return (
    <>
      {/* Floating Button */}
      <button onClick={() => { setOpen(!open); if (!open) setTimeout(() => inputRef.current?.focus(), 200); }}
        style={{ position: "fixed", bottom: 24, right: 24, width: 58, height: 58, borderRadius: "50%", background: "linear-gradient(135deg,#C48830,#EF5350)", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, zIndex: 1200, boxShadow: "0 6px 24px rgba(212,113,78,.4)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .3s", transform: open ? "rotate(45deg)" : "none" }}
        onMouseEnter={e => e.currentTarget.style.transform = open ? "rotate(45deg) scale(1.1)" : "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = open ? "rotate(45deg)" : "none"}>
        {open ? "✕" : "🤖"}
      </button>
      {!open && <div style={{ position: "fixed", bottom: 28, right: 88, background: "#fff", borderRadius: 14, padding: "8px 16px", fontSize: 12, fontWeight: 800, fontFamily: "Poppins", color: "#C48830", boxShadow: "0 4px 16px rgba(0,0,0,.08)", border: "1.5px solid #FFF8EE", zIndex: 1200, animation: "fadeUp .5s ease 2s both", whiteSpace: "nowrap" }}>AI Agent</div>}

      {/* Chat Panel */}
      {open && (
        <div style={{ position: "fixed", bottom: 94, right: 24, width: 420, height: 560, background: "#fff", borderRadius: 14, boxShadow: "0 12px 48px rgba(45,32,22,.18)", border: "1.5px solid #F0E6D0", zIndex: 1200, display: "flex", flexDirection: "column", overflow: "hidden", animation: "popIn .3s ease" }}>
          {/* Header */}
          <div style={{ padding: "8px 12px", borderBottom: "2px solid #F0E6D0", background: "linear-gradient(135deg,#fff,#FFF8EE)", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(135deg,#C48830,#EF5350)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 900, fontFamily: "Poppins" }}>AI Execution Agent</div>
              <div style={{ fontSize: 10, color: "#A09080" }}>Analyze · Rebalance · Execute · Hedge</div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#C48830", animation: "pulse 2s ease infinite" }} />
          </div>

          {/* Messages */}
          <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
            {messages.length === 0 && (
              <div style={{ animation: "fadeUp .4s ease both" }}>
                <div style={{ textAlign: "center", padding: "10px 0 16px" }}>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>🤖</div>
                  <div style={{ fontSize: 11, fontWeight: 800, fontFamily: "Poppins" }}>What can I help with?</div>
                  <div style={{ fontSize: 11, color: "#A09080", marginTop: 2 }}>I have full visibility into your portfolio, macro data, and risk metrics.</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {quickActions.map((qa, i) => (
                    <button key={i} onClick={() => sendMessage(qa.prompt)} style={{ textAlign: "left", background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 12, padding: "7px 10px", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "Quicksand", color: "#6B5A2E", transition: "all .2s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#C48830"; e.currentTarget.style.background = "#FFF8EE"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#F0E6D0"; e.currentTarget.style.background = "#fff"; }}>
                      {qa.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, mi) => (
              <div key={mi} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", animation: "fadeUp .2s ease both" }}>
                <div style={{ maxWidth: "88%", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "7px 10px", background: msg.role === "user" ? "linear-gradient(135deg,#C48830,#EF5350)" : "#FFF5E6", color: msg.role === "user" ? "#fff" : "#5C4A1E", fontSize: 12, lineHeight: 1.6 }}>
                  {msg.role === "user" ? msg.content : (
                    <div>
                      {parseMessage(msg.content).map((part, pi) => {
                        if (part.type === "text") {
                          return <div key={pi} style={{ whiteSpace: "pre-wrap" }}>{formatText(part.content)}</div>;
                        }
                        const actionIdx = mi + "_" + pi;
                        const executed = executedActions.has(actionIdx);
                        const aCol = { REBALANCE: "#42A5F5", BUY: "#C48830", SELL: "#EF5350", TRIM: "#FFA726", HEDGE: "#AB47BC", ROTATE: "#42A5F5", ANALYZE: "#C48830" };
                        return (
                          <button key={pi} onClick={() => !executed && executeAction(part, actionIdx)}
                            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", margin: "8px 0", padding: "7px 10px", borderRadius: 12, border: `2px solid ${executed ? "#C48830" : (aCol[part.actionType] || "#C48830")}`, background: executed ? "#FFF8EE" : "#fff", cursor: executed ? "default" : "pointer", transition: "all .2s", textAlign: "left" }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: executed ? "#C48830" : (aCol[part.actionType] || "#C48830"), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 900, flexShrink: 0 }}>
                              {executed ? "✓" : part.actionType.charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 11, fontWeight: 800, fontFamily: "Poppins", color: executed ? "#C48830" : "#5C4A1E" }}>{executed ? "Executed: " : ""}{part.label}</div>
                              <div style={{ fontSize: 9, color: "#8A7040" }}>{part.details}</div>
                            </div>
                            {!executed && <span style={{ fontSize: 9, fontWeight: 800, color: aCol[part.actionType] || "#C48830", whiteSpace: "nowrap" }}>Execute →</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 6, padding: "7px 10px", animation: "fadeUp .2s ease both" }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#C48830,#EF5350)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>🤖</div>
                <div style={{ background: "#FFF5E6", borderRadius: "14px 14px 14px 4px", padding: "12px 16px", display: "flex", gap: 4, alignItems: "center" }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#A09080", animation: `pulse 1.2s ease ${i * 0.15}s infinite` }} />)}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: "12px 16px", borderTop: "2px solid #F0E6D0", background: "#FFFDF5" }}>
            {messages.length > 0 && (
              <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap", paddingBottom: 4 }}>
                {[
                  { label: "⚖️ Rebalance", prompt: "Rebalance my portfolio for the current macro regime. Show exact changes." },
                  { label: "🛡️ Hedge", prompt: "Suggest hedges for my current positions." },
                  { label: "📊 Analyze", prompt: "Quick analysis — what needs attention right now?" },
                ].map((qa, i) => (
                  <button key={i} onClick={() => sendMessage(qa.prompt)} style={{ flexShrink: 0, padding: "4px 10px", borderRadius: 8, border: "1px solid #F0E6D0", background: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer", color: "#8A7040", whiteSpace: "nowrap" }}>{qa.label}</button>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder="Ask me to analyze, rebalance, hedge..."
                style={{ flex: 1, padding: "7px 10px", borderRadius: 12, border: "1.5px solid #F0E6D0", fontSize: 12, fontFamily: "Quicksand", outline: "none", background: "#fff" }} />
              <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
                style={{ padding: "6px 10px", borderRadius: 12, border: "none", background: loading || !input.trim() ? "#F0E6D0" : "linear-gradient(135deg,#C48830,#EF5350)", color: "#fff", fontSize: 11, cursor: loading || !input.trim() ? "default" : "pointer", fontWeight: 900 }}>→</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════ MACRO TIDES DATA ═══════════════

const tideAssets = [
  // Above the tide (expensive / elevated / overheated)
  { id:"ai_semis", name:"AI & Semis", ticker:"NVDA/AMD/AVGO", type:"equity", level:82, fair:45, emoji:"⚡", color:"#AB47BC", desc:"AI hype has pushed semiconductor valuations to extreme levels. P/E ratios 2-3x historical norms.", cascade:["value_stocks","bonds","gold"], cascadeDir:"up" },
  { id:"us_mega", name:"US Mega-Cap Tech", ticker:"AAPL/MSFT/GOOGL", type:"equity", level:71, fair:50, emoji:"💻", color:"#42A5F5", desc:"Concentration at all-time highs. Top 7 stocks = 30%+ of S&P 500.", cascade:["intl_equities","small_caps","em_equities"], cascadeDir:"up" },
  { id:"us_rates", name:"US Interest Rates", ticker:"Fed Funds 5.25%", type:"macro", level:78, fair:40, emoji:"🏦", color:"#EF5350", desc:"Rates at 23-year highs. When the tide pulls back here, duration assets and rate-sensitive sectors surge.", cascade:["reits","growth","bonds","emerging"], cascadeDir:"up" },
  { id:"us_dollar", name:"US Dollar (DXY)", ticker:"DXY 104.2", type:"forex", level:68, fair:50, emoji:"💵", color:"#C48830", desc:"Strong dollar crushing EM returns and commodity demand. A reversal lifts global risk assets.", cascade:["gold","em_equities","commodities"], cascadeDir:"up" },
  { id:"oil", name:"Crude Oil", ticker:"CL $85.40", type:"future", level:64, fair:48, emoji:"🛢️", color:"#5C4A1E", desc:"Above long-term equilibrium on supply cuts. Vulnerable to demand slowdown.", cascade:["airlines","consumer","transports"], cascadeDir:"up" },
  { id:"credit_spreads", name:"Credit Spreads", ticker:"HY OAS", type:"bond", level:35, fair:50, emoji:"📋", color:"#FFA726", desc:"Spreads tight — markets pricing no recession. Complacency risk if growth slows.", cascade:["treasuries","gold","cash"], cascadeDir:"up" },

  // Below the tide (cheap / depressed / unloved)
  { id:"value_stocks", name:"Value / Small-Cap", ticker:"IWM/IWD", type:"equity", level:28, fair:50, emoji:"🏷️", color:"#C48830", desc:"Deepest discount to growth in 25 years. Mean reversion historically powerful.", cascade:["us_mega","ai_semis"], cascadeDir:"down" },
  { id:"intl_equities", name:"International Equities", ticker:"EFA/VEU", type:"equity", level:22, fair:48, emoji:"🌍", color:"#42A5F5", desc:"Europe and Japan trading at 40%+ discount to US on P/E. Currency tailwind if USD weakens.", cascade:["us_mega","us_dollar"], cascadeDir:"down" },
  { id:"bonds", name:"Long-Duration Bonds", ticker:"TLT/ZB", type:"bond", level:18, fair:50, emoji:"🏛️", color:"#C48830", desc:"Worst drawdown in bond history. When rates fall, these assets see the largest gains.", cascade:["us_rates"], cascadeDir:"down" },
  { id:"reits", name:"REITs", ticker:"VNQ/O/AMT", type:"equity", level:24, fair:45, emoji:"🏠", color:"#FFA726", desc:"Rate-crushed sector. Historically first to recover when Fed pivots.", cascade:["us_rates"], cascadeDir:"down" },
  { id:"gold", name:"Gold & Precious Metals", ticker:"GLD/GC $2,185", type:"future", level:55, fair:50, emoji:"🥇", color:"#FFA726", desc:"Near fair value but poised to break out on rate cuts and de-dollarization.", cascade:["us_dollar","us_rates"], cascadeDir:"down" },
  { id:"em_equities", name:"Emerging Markets", ticker:"EEM/VWO", type:"equity", level:20, fair:50, emoji:"🌏", color:"#C48830", desc:"Beaten down by strong dollar and China weakness. Deep value if macro shifts.", cascade:["us_dollar","us_rates"], cascadeDir:"down" },
  { id:"clean_energy", name:"Clean Energy", ticker:"ICLN/TAN", type:"equity", level:14, fair:42, emoji:"🌱", color:"#C48830", desc:"Down 60%+ from highs. Rate-sensitive long-duration growth. Maximum pain territory.", cascade:["us_rates","oil"], cascadeDir:"down" },
  { id:"commodities", name:"Broad Commodities", ticker:"DBC/GSG", type:"future", level:32, fair:50, emoji:"⛏️", color:"#C48830", desc:"Below long-term average. Supply underinvestment creates setup for next cycle.", cascade:["us_dollar"], cascadeDir:"down" },
];

function MacroTidesPage() {
  const [tideLevel, setTideLevel] = useState(50);
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
        <h1 style={{ fontSize: 10, fontWeight: 900, fontFamily: "Poppins" }}>🌊 Macro Tides</h1>
        <p style={{ color: "#A09080", fontSize: 10, marginTop: 3 }}>What's above the waterline is overvalued. What's submerged is cheap. Drag the tide to see cascade effects.</p>
      </div>

      {/* ── Tide Controller ── */}
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 18, padding: "16px 22px", marginBottom: 8, animation: "fadeUp .4s ease .1s both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12 }}>🎛️</span>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins" }}>Tide Control</div>
              <div style={{ fontSize: 10, color: "#A09080" }}>Drag to simulate: crash, correction, risk-on, or FOMO</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 10, background: tideLevel < 35 ? "#FFEBEE" : tideLevel > 65 ? "#FFF8EE" : "#FFF3E0", color: tideLevel < 35 ? "#EF5350" : tideLevel > 65 ? "#C48830" : "#FFA726" }}>
              {tideLevel < 25 ? "🌊 Crash" : tideLevel < 40 ? "📉 Correction" : tideLevel > 75 ? "🚀 FOMO" : tideLevel > 60 ? "📈 Risk-On" : "➖ Current"}
            </span>
            <button onClick={() => setTideLevel(50)} style={{ padding: "4px 10px", borderRadius: 8, border: "1px solid #F0E6D0", background: "#fff", fontSize: 10, fontWeight: 800, cursor: "pointer", color: "#8A7040" }}>Reset</button>
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
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 800, color: "#A09080", marginTop: 3 }}>
          <span>🌊 Tide pulls back</span><span style={{ color: "#8A7040" }}>▼ Today</span><span>🚀 Everything pumps</span>
        </div>
      </div>

      {/* ── The Ocean ── */}
      <div style={{ position: "relative", background: "linear-gradient(180deg, #F0F4FA 0%, #E8EEF8 " + waterPct + "%, #D4E4F4 " + (waterPct + 2) + "%, #C4D8EC " + (waterPct + 20) + "%, #B0CCE4 100%)", border: "1.5px solid #F0E6D0", borderRadius: 14, overflow: "hidden", marginBottom: 8, animation: "fadeUp .4s ease .15s both", minHeight: 440 }}>

        {/* Zone labels */}
        <div style={{ position: "absolute", top: 10, left: 16, fontSize: 10, fontWeight: 800, color: "#EF5350", opacity: 0.6, textTransform: "uppercase", letterSpacing: 1, zIndex: 2 }}>▲ Above Tide — Expensive / Overvalued</div>
        <div style={{ position: "absolute", bottom: 10, left: 16, fontSize: 10, fontWeight: 800, color: "#fff", opacity: 0.7, textTransform: "uppercase", letterSpacing: 1, zIndex: 2 }}>▼ Below Tide — Cheap / Undervalued</div>

        {/* Animated waterline */}
        <div style={{ position: "absolute", left: 0, right: 0, top: waterPct + "%", height: 3, zIndex: 10, transition: "top .5s ease" }}>
          <div style={{ height: 2, background: "linear-gradient(90deg, #42A5F544, #42A5F5, #42A5F544)", borderRadius: 1 }} />
          <div style={{ position: "absolute", left: 16, top: -8, fontSize: 8, fontWeight: 800, color: "#42A5F5", background: "#E3F2FD", padding: "1px 8px", borderRadius: 6 }}>🌊 WATERLINE</div>
        </div>

        {/* Wave decoration SVG */}
        <svg style={{ position: "absolute", left: 0, right: 0, top: `calc(${waterPct}% - 6px)`, height: 30, zIndex: 5, pointerEvents: "none", transition: "top .5s ease" }} viewBox="0 0 400 30" preserveAspectRatio="none">
          <path d={"M0,8 " + Array.from({length: 41}, (_, i) => `Q${i * 10 + 5},${8 + Math.sin(i * 0.8) * 4} ${(i + 1) * 10},8`).join(" ") + " V30 H0 Z"} fill="#42A5F518" />
          <path d={"M0,11 " + Array.from({length: 41}, (_, i) => `Q${i * 10 + 5},${11 + Math.sin(i * 0.6 + 2) * 3} ${(i + 1) * 10},11`).join(" ") + " V30 H0 Z"} fill="#42A5F512" />
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
                <span style={{ fontSize: 12 }}>{asset.emoji}</span>
                <div style={{ fontWeight: 800, fontSize: 10, fontFamily: "Poppins", textAlign: "center", color: "#5C4A1E" }}>{asset.name}</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 700, color: "#EF5350" }}>{Math.round(adj)}</div>
                <div style={{ height: 4, width: 40, borderRadius: 2, background: "#FFF5E6", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: Math.min(adj, 100) + "%", background: adj > 70 ? "#EF5350" : "#FFA726", borderRadius: 2, transition: "width .5s" }} />
                </div>
                {isCascade && <div style={{ fontSize: 7, fontWeight: 900, color: selected.cascadeDir === "up" ? "#5B8C5A" : "#EF5350", background: selected.cascadeDir === "up" ? "#EDF5ED" : "#FFEBEE", padding: "1px 6px", borderRadius: 6 }}>{selected.cascadeDir === "up" ? "▲ RISES" : "▼ FALLS"}</div>}
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
                <span style={{ fontSize: 12 }}>{asset.emoji}</span>
                <div style={{ fontWeight: 800, fontSize: 10, fontFamily: "Poppins", textAlign: "center", color: "#5C4A1E" }}>{asset.name}</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 700, color: "#C48830" }}>{Math.round(adj)}</div>
                <div style={{ height: 4, width: 40, borderRadius: 2, background: "rgba(255,255,255,.5)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: Math.min(adj, 100) + "%", background: adj < 25 ? "#C48830" : "#FFA726", borderRadius: 2, transition: "width .5s" }} />
                </div>
                {isCascade && <div style={{ fontSize: 7, fontWeight: 900, color: selected.cascadeDir === "up" ? "#5B8C5A" : "#EF5350", background: selected.cascadeDir === "up" ? "#EDF5ED" : "#FFEBEE", padding: "1px 6px", borderRadius: 6 }}>{selected.cascadeDir === "up" ? "▲ RISES" : "▼ FALLS"}</div>}
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
              <div style={{ width: 52, height: 52, borderRadius: 16, background: selected.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>{selected.emoji}</div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 900, fontFamily: "Poppins" }}>{selected.name}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 10, fontFamily: "JetBrains Mono", color: "#A09080" }}>{selected.ticker}</span>
                  <span style={{ fontSize: 8, fontWeight: 800, padding: "1px 6px", borderRadius: 4, background: (typeColors[selected.type] || "#A09080") + "22", color: typeColors[selected.type] || "#A09080", textTransform: "uppercase" }}>{typeLabels[selected.type] || selected.type}</span>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#6B5A2E", lineHeight: 1.6, marginBottom: 7, padding: "7px 10px", background: "#FFFDF5", borderRadius: 12 }}>{selected.desc}</div>

            {/* Thermometer */}
            <div style={{ marginBottom: 7 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#A09080" }}>VALUATION THERMOMETER</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: selected.level > 50 ? "#EF5350" : "#C48830" }}>{selected.level > 65 ? "🔥 Overheated" : selected.level > 50 ? "⚠️ Elevated" : selected.level > 35 ? "💎 Fair Zone" : "🧊 Deep Value"}</span>
              </div>
              <div style={{ height: 28, background: "linear-gradient(90deg, #C48830 0%, #FFA726 40%, #EF5350 70%, #C94040 100%)", borderRadius: 14, position: "relative", overflow: "visible", border: "1.5px solid #F0E6D0" }}>
                <div style={{ position: "absolute", left: selected.fair + "%", top: -6, bottom: -6, width: 2, background: "#8A7040", zIndex: 2, borderRadius: 1 }}>
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", fontSize: 7, fontWeight: 800, color: "#8A7040", whiteSpace: "nowrap" }}>Fair</div>
                </div>
                <div style={{ position: "absolute", left: `calc(${Math.min(Math.round(getAdjustedLevel(selected)), 96)}% - 12px)`, top: "50%", transform: "translateY(-50%)", width: 24, height: 24, borderRadius: "50%", background: "#fff", border: `3px solid ${selected.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, fontFamily: "JetBrains Mono", color: selected.color, boxShadow: `0 2px 8px ${selected.color}44`, transition: "left .5s ease", zIndex: 3 }}>
                  {Math.round(getAdjustedLevel(selected))}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, fontWeight: 700, color: "#A09080", marginTop: 4 }}>
                <span>🧊 Deep Value</span><span>💎 Fair</span><span>⚠️ Rich</span><span>🔥 Extreme</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
              <div style={{ background: selected.level > 50 ? "#FFEBEE" : "#FFF8EE", borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 8, fontWeight: 800, color: "#A09080", textTransform: "uppercase" }}>Current</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 700, color: selected.level > 50 ? "#EF5350" : "#C48830" }}>{selected.level}</div>
              </div>
              <div style={{ background: "#fff", borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 8, fontWeight: 800, color: "#A09080", textTransform: "uppercase" }}>Fair Value</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 700, color: "#FFA726" }}>{selected.fair}</div>
              </div>
              <div style={{ background: "#E3F2FD", borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 8, fontWeight: 800, color: "#A09080", textTransform: "uppercase" }}>Tide-Adjusted</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 700, color: "#42A5F5" }}>{Math.round(getAdjustedLevel(selected))}</div>
              </div>
            </div>
          </div>

          {/* Right: Cascade Effects */}
          <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 11 }}>🌊</span>
              <div style={{ fontSize: 11, fontWeight: 800, fontFamily: "Poppins" }}>When This Tide Rolls Over</div>
            </div>
            <div style={{ fontSize: 11, color: "#A09080", marginBottom: 7, lineHeight: 1.5 }}>
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
                  <span style={{ fontSize: 12 }}>{target.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 12, fontFamily: "Poppins" }}>{target.name}</div>
                    <div style={{ fontSize: 10, color: "#8A7040" }}>{target.ticker}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 700, color: goesUp ? "#5B8C5A" : "#EF5350" }}>
                      {goesUp ? "▲" : "▼"}{diff !== 0 ? (diff > 0 ? " +" : " ") + diff : ""}
                    </div>
                    <div style={{ fontSize: 9, color: "#A09080" }}>{target.level} → {tAdj}</div>
                  </div>
                </div>
              );
            }) : (
              <div style={{ textAlign: "center", padding: 30, color: "#A09080", fontSize: 12 }}>Move the tide slider to see cascade effects</div>
            )}

            {cascadeTargets.length > 0 && (
              <div style={{ marginTop: 10, padding: "7px 10px", background: "#fff", borderRadius: 12, border: "1px solid #F0E6D0" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#C48830", marginBottom: 2 }}>💡 Inverse Correlation</div>
                <div style={{ fontSize: 10, color: "#8A7040", lineHeight: 1.5 }}>
                  {selected.name} going {selected.level > 50 ? "down" : "up"} historically pushes {cascadeTargets.map(t => t.name).join(", ")} in the opposite direction. Drag the tide slider left to simulate.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── All Assets Ranked Table ── */}
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, animation: "fadeUp .4s ease .25s both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
          <div style={{ fontSize: 11, fontWeight: 800, fontFamily: "Poppins" }}>📊 Full Tide Map — Ranked by Elevation</div>
          <div style={{ fontSize: 10, color: "#A09080" }}>Tap any row to see cascade</div>
        </div>
        <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #F0E6D0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr .6fr .4fr .4fr .4fr .6fr", padding: "6px 10px", background: "#fff", borderBottom: "2px solid #F0E6D0", fontSize: 9, fontWeight: 800, color: "#A09080", textTransform: "uppercase", letterSpacing: .5 }}>
            <div>Asset</div><div>Instrument</div><div>Level</div><div>Fair</div><div>Gap</div><div style={{ textAlign: "right" }}>Tide Effect</div>
          </div>
          {[...tideAssets].sort((a, b) => getAdjustedLevel(b) - getAdjustedLevel(a)).map((asset, i) => {
            const adj = Math.round(getAdjustedLevel(asset));
            const gap = asset.level - asset.fair;
            const effect = adj - asset.level;
            const isSel = selectedAsset === asset.id;
            const isAbove = adj > 50;
            return (
              <div key={asset.id} onClick={() => setSelectedAsset(isSel ? null : asset.id)}
                style={{ display: "grid", gridTemplateColumns: "1.2fr .6fr .4fr .4fr .4fr .6fr", padding: "6px 10px", borderBottom: i < tideAssets.length - 1 ? "1px solid #F0E6D0" : "none", alignItems: "center", cursor: "pointer", background: isSel ? asset.color + "12" : "transparent", transition: "background .2s" }}
                onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "#fff"; }} onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10 }}>{asset.emoji}</span>
                  <div>
                    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                      <span style={{ fontWeight: 800, fontSize: 12, fontFamily: "Poppins" }}>{asset.name}</span>
                      <span style={{ fontSize: 7, fontWeight: 900, padding: "1px 5px", borderRadius: 4, background: isAbove ? "#FFEBEE" : "#FFF8EE", color: isAbove ? "#EF5350" : "#C48830" }}>{isAbove ? "ABOVE" : "BELOW"}</span>
                    </div>
                    <span style={{ fontSize: 8, fontWeight: 800, padding: "1px 5px", borderRadius: 4, background: (typeColors[asset.type] || "#A09080") + "18", color: typeColors[asset.type] || "#A09080", textTransform: "uppercase" }}>{typeLabels[asset.type] || asset.type}</span>
                  </div>
                </div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "#A09080" }}>{asset.ticker}</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 700, color: adj > 60 ? "#EF5350" : adj < 35 ? "#C48830" : "#FFA726" }}>{adj}</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "#A09080" }}>{asset.fair}</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 700, color: gap > 10 ? "#EF5350" : gap < -10 ? "#C48830" : "#FFA726" }}>{gap > 0 ? "+" : ""}{gap}</div>
                <div style={{ textAlign: "right" }}>
                  {effect !== 0 ? (
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: effect > 0 ? "#EDF5ED" : "#FFEBEE", color: effect > 0 ? "#5B8C5A" : "#EF5350" }}>{effect > 0 ? "▲ +" + effect : "▼ " + effect}</span>
                  ) : (
                    <span style={{ fontSize: 10, color: "#A09080" }}>—</span>
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
  { id:"sp500", ticker:"ES", name:"S&P 500 Futures", cat:"Equities", price:5248.50, change:0.42, ytd:8.2, emoji:"📈", color:"#42A5F5" },
  { id:"nasdaq", ticker:"NQ", name:"Nasdaq 100 Futures", cat:"Equities", price:18420, change:0.68, ytd:12.4, emoji:"💻", color:"#AB47BC" },
  // Rates & Bonds
  { id:"ust10y", ticker:"ZN", name:"10Y Treasury Note", cat:"Rates", price:110.25, change:-0.34, ytd:-4.8, emoji:"🏛️", color:"#C48830" },
  { id:"ust30y", ticker:"ZB", name:"30Y Treasury Bond", cat:"Rates", price:118.40, change:-0.62, ytd:-8.2, emoji:"🏦", color:"#EF5350" },
  { id:"tlt", ticker:"TLT", name:"20+ Year Treasury ETF", cat:"Rates", price:92.40, change:-0.58, ytd:-6.4, emoji:"📋", color:"#C48830" },
  // Commodities - Energy
  { id:"crude", ticker:"CL", name:"WTI Crude Oil", cat:"Energy", price:87.20, change:2.40, ytd:14.6, emoji:"🛢️", color:"#5C4A1E" },
  { id:"natgas", ticker:"NG", name:"Natural Gas", cat:"Energy", price:3.42, change:3.20, ytd:-12.8, emoji:"🔥", color:"#FFA726" },
  { id:"brent", ticker:"BZ", name:"Brent Crude", cat:"Energy", price:91.40, change:2.10, ytd:16.2, emoji:"⛽", color:"#8A7040" },
  // Precious Metals
  { id:"gold", ticker:"GC", name:"Gold Futures", cat:"Metals", price:2186, change:0.30, ytd:6.2, emoji:"🥇", color:"#FFA726" },
  { id:"silver", ticker:"SI", name:"Silver Futures", cat:"Metals", price:24.82, change:0.65, ytd:2.8, emoji:"🥈", color:"#A09080" },
  { id:"copper", ticker:"HG", name:"Copper Futures", cat:"Metals", price:4.12, change:1.20, ytd:8.4, emoji:"🔶", color:"#C48830" },
  // Currencies
  { id:"dxy", ticker:"DXY", name:"US Dollar Index", cat:"Currency", price:104.80, change:0.38, ytd:3.2, emoji:"💵", color:"#C48830" },
  { id:"eurusd", ticker:"EUR/USD", name:"Euro / Dollar", cat:"Currency", price:1.0840, change:-0.18, ytd:-2.8, emoji:"🇪🇺", color:"#42A5F5" },
  { id:"usdjpy", ticker:"USD/JPY", name:"Dollar / Yen", cat:"Currency", price:151.20, change:0.40, ytd:5.6, emoji:"🇯🇵", color:"#EF5350" },
  { id:"gbpusd", ticker:"GBP/USD", name:"Pound / Dollar", cat:"Currency", price:1.2680, change:-0.12, ytd:-1.4, emoji:"🇬🇧", color:"#AB47BC" },
  // Agriculture
  { id:"wheat", ticker:"ZW", name:"Wheat Futures", cat:"Agriculture", price:5.86, change:-1.20, ytd:-18.4, emoji:"🌾", color:"#FFA726" },
  { id:"corn", ticker:"ZC", name:"Corn Futures", cat:"Agriculture", price:4.52, change:-0.80, ytd:-14.2, emoji:"🌽", color:"#C48830" },
  // Crypto
  { id:"btc", ticker:"BTC", name:"Bitcoin", cat:"Crypto", price:62500, change:4.60, ytd:48.2, emoji:"₿", color:"#FFA726" },
  // Volatility
  { id:"vix", ticker:"VIX", name:"Volatility Index", cat:"Volatility", price:18.40, change:1.20, ytd:-8.6, emoji:"⚡", color:"#EF5350" },
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
  Equities: { color: "#42A5F5", emoji: "📈" },
  Rates: { color: "#C48830", emoji: "🏛️" },
  Energy: { color: "#5C4A1E", emoji: "🛢️" },
  Metals: { color: "#FFA726", emoji: "🥇" },
  Currency: { color: "#C48830", emoji: "💱" },
  Agriculture: { color: "#C48830", emoji: "🌾" },
  Crypto: { color: "#FFA726", emoji: "₿" },
  Volatility: { color: "#EF5350", emoji: "⚡" },
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
        <h1 style={{ fontSize: 10, fontWeight: 900, fontFamily: "Poppins" }}>🧺 My Baskets & Macro Map</h1>
        <p style={{ color: "#A09080", fontSize: 10, marginTop: 3 }}>Portfolio overview, macro product correlations & hedging seesaw</p>
      </div>

      {/* ── Portfolio Summary ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(100px,1fr))", gap: 6, marginBottom: 6, animation: "fadeUp .4s ease .05s both" }}>
        {[
          { label: "Portfolio", val: "$" + (totalValue / 1000).toFixed(1) + "k", color: "#5C4A1E", bg: "#fff" },
          { label: "Total P&L", val: (totalPL >= 0 ? "+" : "") + "$" + (totalPL / 1000).toFixed(1) + "k", color: totalPL >= 0 ? "#5B8C5A" : "#EF5350", bg: totalPL >= 0 ? "#EDF5ED" : "#FFEBEE" },
          { label: "Day P&L", val: (totalDayPL >= 0 ? "+" : "") + "$" + totalDayPL.toLocaleString(), color: totalDayPL >= 0 ? "#5B8C5A" : "#EF5350", bg: totalDayPL >= 0 ? "#EDF5ED" : "#FFEBEE" },
          { label: "Baskets", val: myBaskets.length, color: "#AB47BC", bg: "#F0E8F5" },
          { label: "Macro Products", val: macroProducts.length, color: "#42A5F5", bg: "#E3F2FD" },
          { label: "Hedge Pairs", val: macroCorrelations.filter(c => c.corr < -0.3).length, color: "#EF5350", bg: "#FFEBEE" },
        ].map((m, i) => (
          <div key={i} style={{ background: m.bg, borderRadius: 16, padding: "8px 10px", textAlign: "center", animation: "fadeUp .4s ease " + (i * .03) + "s both" }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: "#A09080", textTransform: "uppercase", letterSpacing: .5 }}>{m.label}</div>
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 700, color: m.color, marginTop: 2 }}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* ── Basket Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6, marginBottom: 8, animation: "fadeUp .4s ease .08s both" }}>
        {myBaskets.map(b => { const clr = CL[b.color] || CL.terracotta; return (
          <div key={b.id} onClick={() => onSelectBasket && onSelectBasket(b)} style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 18, padding: "8px 10px", cursor: "pointer", transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = clr.a; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#F0E6D0"; e.currentTarget.style.transform = ""; }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 12 }}>{b.emoji}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, fontFamily: "Poppins" }}>{b.name}</div>
                <div style={{ fontSize: 9, color: "#A09080" }}>{(basketStocks[b.id] || []).length} positions · {b.strategy}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 700 }}>${(b.value / 1000).toFixed(1)}k</div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 700, color: b.change >= 0 ? "#5B8C5A" : "#EF5350" }}>{b.change >= 0 ? "+" : ""}{b.change}%</div>
            </div>
            <div style={{ height: 4, background: "#FFF5E6", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: b.allocation + "%", background: clr.a, borderRadius: 2 }} />
            </div>
          </div>); })}
      </div>

      {/* ═══════════════ HEDGING SEESAW ═══════════════ */}
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: "10px 22px 18px", marginBottom: 8, animation: "fadeUp .4s ease .12s both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, fontFamily: "Poppins" }}>⚖️ Hedging Seesaw</div>
            <div style={{ fontSize: 11, color: "#A09080", marginTop: 2 }}>When one side weighs down, the other lifts up — pick any pair to visualize</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 8, background: corrVal < -0.5 ? "#FFF8EE" : corrVal < 0 ? "#FFF3E0" : "#FFEBEE", color: corrVal < -0.5 ? "#C48830" : corrVal < 0 ? "#FFA726" : "#EF5350" }}>
              ρ = {corrVal.toFixed(2)} · {corrVal < -0.6 ? "Strong Hedge" : corrVal < -0.3 ? "Moderate Hedge" : corrVal < 0 ? "Weak Hedge" : corrVal < 0.3 ? "Weak +" : "Correlated ⚠️"}
            </span>
          </div>
        </div>

        {/* Pair selectors */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px", maxWidth: 260 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#A09080", textTransform: "uppercase", marginBottom: 4, textAlign: "center" }}>LEFT SIDE</div>
            <select value={seesawPair.a} onChange={e => setSeesawPair(p => ({ ...p, a: e.target.value }))}
              style={{ width: "100%", padding: "7px 10px", borderRadius: 12, border: "1.5px solid #42A5F544", fontSize: 10, fontWeight: 700, fontFamily: "Quicksand", outline: "none", background: "#E3F2FD", color: "#5C4A1E", cursor: "pointer" }}>
              {macroProducts.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.ticker} — {p.name}</option>)}
            </select>
          </div>
          <div style={{ fontSize: 12, color: "#A09080", fontWeight: 900 }}>⟺</div>
          <div style={{ flex: "1 1 200px", maxWidth: 260 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#A09080", textTransform: "uppercase", marginBottom: 4, textAlign: "center" }}>RIGHT SIDE</div>
            <select value={seesawPair.b} onChange={e => setSeesawPair(p => ({ ...p, b: e.target.value }))}
              style={{ width: "100%", padding: "7px 10px", borderRadius: 12, border: "1.5px solid #EF535044", fontSize: 10, fontWeight: 700, fontFamily: "Quicksand", outline: "none", background: "#FFEBEE", color: "#5C4A1E", cursor: "pointer" }}>
              {macroProducts.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.ticker} — {p.name}</option>)}
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
              style={{ padding: "4px 10px", borderRadius: 8, border: "1.5px solid " + (seesawPair.a === preset.a && seesawPair.b === preset.b ? "#C48830" : "#F0E6D0"), background: seesawPair.a === preset.a && seesawPair.b === preset.b ? "#FFF8EE" : "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer", color: seesawPair.a === preset.a && seesawPair.b === preset.b ? "#C48830" : "#8A7040" }}>{preset.label}</button>
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
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, overflow: "hidden", marginBottom: 8, animation: "fadeUp .4s ease .18s both" }}>
        <div style={{ padding: "18px 22px", borderBottom: "2px solid #F0E6D0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, fontFamily: "Poppins" }}>🕸️ Macro Correlation Network</div>
            <div style={{ fontSize: 11, color: "#A09080" }}>Futures · Commodities · Currencies · Metals · Rates — click any node</div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: "#A09080" }}>MIN |ρ|</span>
            {[0.15, 0.3, 0.5, 0.7].map(t => (
              <button key={t} onClick={() => setCorrThreshold(t)} style={{ padding: "3px 8px", borderRadius: 6, border: "1.5px solid " + (corrThreshold === t ? "#C48830" : "#F0E6D0"), background: corrThreshold === t ? "#FFF8EE" : "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "JetBrains Mono", color: corrThreshold === t ? "#C48830" : "#A09080" }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Category filters */}
        <div style={{ padding: "8px 22px", background: "#FFFDF5", borderBottom: "1px solid #F0E6D0", display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={() => setCatFilter("ALL")} style={{ padding: "3px 10px", borderRadius: 6, border: "1.5px solid " + (catFilter === "ALL" ? "#C48830" : "#F0E6D0"), background: catFilter === "ALL" ? "#FFF8EE" : "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer", color: catFilter === "ALL" ? "#C48830" : "#A09080" }}>ALL</button>
          {cats.map(c => { const cc = catConfig[c] || { color:"#A09080", emoji:"📊" }; return (
            <button key={c} onClick={() => setCatFilter(catFilter === c ? "ALL" : c)} style={{ padding: "3px 10px", borderRadius: 6, border: "1.5px solid " + (catFilter === c ? cc.color : "#F0E6D0"), background: catFilter === c ? cc.color + "18" : "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer", color: catFilter === c ? cc.color : "#A09080" }}>{cc.emoji} {c}</button>
          ); })}
          <span style={{ marginLeft: "auto", display: "flex", gap: 6, fontSize: 9, fontWeight: 700, color: "#A09080" }}>
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
                <text x={cx} y={cy - (28 + (catGroups[cat]?.length || 0) * 8)} textAnchor="middle" fill={cc.color} fontSize="10" fontWeight="800" fontFamily="Poppins">{(catConfig[cat]?.emoji || "") + " " + cat}</text>
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
                {/* Emoji */}
                <text x={pos.x} y={pos.y - 2} textAnchor="middle" fontSize={isSel ? "14" : "12"} dominantBaseline="central">{p.emoji}</text>
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
                <div style={{ width: 52, height: 52, borderRadius: 16, background: node.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>{node.emoji}</div>
                <div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 800, color: node.color }}>{node.ticker}</div>
                  <div style={{ fontSize: 11, color: "#A09080" }}>{node.name}</div>
                  <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: (catConfig[node.cat]?.color || "#A09080") + "18", color: catConfig[node.cat]?.color || "#A09080" }}>{node.cat}</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "Price", val: "$" + (node.price >= 1000 ? node.price.toLocaleString() : node.price), color: "#5C4A1E" },
                  { label: "Day", val: (node.change >= 0 ? "+" : "") + node.change + "%", color: node.change >= 0 ? "#5B8C5A" : "#EF5350" },
                  { label: "YTD Return", val: (node.ytd >= 0 ? "+" : "") + node.ytd + "%", color: node.ytd >= 0 ? "#5B8C5A" : "#EF5350" },
                  { label: "Connections", val: nodeCorrs.length, color: "#42A5F5" },
                ].map((m, i) => (
                  <div key={i} style={{ background: "#FFFDF5", borderRadius: 10, padding: "8px 10px" }}>
                    <div style={{ fontSize: 8, fontWeight: 800, color: "#A09080", textTransform: "uppercase" }}>{m.label}</div>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 700, color: m.color }}>{m.val}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setSeesawPair(p => ({ ...p, a: selectedNode }))} style={{ width: "100%", marginTop: 10, padding: "8px", borderRadius: 10, border: "1.5px solid #C48830", background: "#FFF8EE", color: "#C48830", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>⚖️ Set as Seesaw Left Side</button>
            </div>

            {/* Correlations list */}
            <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, maxHeight: 300, overflow: "auto" }}>
              <div style={{ fontSize: 11, fontWeight: 800, fontFamily: "Poppins", marginBottom: 4 }}>🔗 All Correlations for {node.ticker}</div>
              <div style={{ fontSize: 11, color: "#A09080", marginBottom: 12 }}>Click any row to load into seesaw · red = hedge opportunity</div>
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
                    <span style={{ fontSize: 11 }}>{other.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontFamily: "JetBrains Mono", fontWeight: 800, fontSize: 12 }}>{other.ticker}</span>
                        <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: (catConfig[other.cat]?.color || "#A09080") + "15", color: catConfig[other.cat]?.color || "#A09080" }}>{other.cat}</span>
                      </div>
                      <div style={{ fontSize: 9, color: "#8A7040", marginTop: 1 }}>{c.desc.length > 60 ? c.desc.slice(0, 58) + ".." : c.desc}</div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 0 }}>
                      <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 700, color: isPos ? "#5B8C5A" : "#EF5350" }}>{isPos ? "+" : ""}{c.corr.toFixed(2)}</div>
                      <div style={{ fontSize: 8, fontWeight: 800, color: isPos ? "#5B8C5A" : "#EF5350" }}>{isPos ? "▲ Correlated" : "▼ Hedge"}</div>
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
        <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, fontFamily: "Poppins", marginBottom: 12 }}>🛡️ Best Hedging Pairs</div>
          {topHedges.map((c, i) => {
            const pA = macroProducts.find(p => p.id === c.a);
            const pB = macroProducts.find(p => p.id === c.b);
            if (!pA || !pB) return null;
            return (
              <div key={i} onClick={() => setSeesawPair({ a: c.a, b: c.b })}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 10, marginBottom: 4, cursor: "pointer", background: "#FFEBEE08", border: "1px solid #F0E6D0", transition: "all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#FFEBEE22"; e.currentTarget.style.borderColor = "#EF535033"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#FFEBEE08"; e.currentTarget.style.borderColor = "#F0E6D0"; }}>
                <span style={{ fontSize: 12 }}>{pA.emoji}</span>
                <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 11, minWidth: 30 }}>{pA.ticker}</span>
                <span style={{ color: "#EF5350", fontSize: 12, fontWeight: 700 }}>⟺</span>
                <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 11, minWidth: 30 }}>{pB.ticker}</span>
                <span style={{ fontSize: 12 }}>{pB.emoji}</span>
                <div style={{ flex: 1 }} />
                <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 12, color: "#EF5350" }}>ρ {c.corr.toFixed(2)}</span>
                <div style={{ width: 36, height: 5, background: "#FFF5E6", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: Math.abs(c.corr) * 100 + "%", background: "#EF5350", borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Asset Class Diversification */}
        <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, fontFamily: "Poppins", marginBottom: 12 }}>🎯 Macro Diversification Score</div>
          {cats.map(cat => {
            const cc = catConfig[cat] || { color: "#A09080", emoji: "📊" };
            const count = (catGroups[cat] || []).length;
            const pct = Math.round(count / macroProducts.length * 100);
            return (
              <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 12 }}>{cc.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 700 }}>{cat}</span>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 700, color: cc.color }}>{count} products</span>
                  </div>
                  <div style={{ height: 6, background: "#FFF5E6", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: pct + "%", background: cc.color, borderRadius: 3 }} />
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 10, padding: "8px 10px", background: "#FFF8EE", borderRadius: 10, fontSize: 10, fontWeight: 700, color: "#C48830" }}>
            ✅ {cats.length} macro asset classes across {macroProducts.length} products — well diversified
          </div>
        </div>
      </div>
    </div>
  );
}


// ═══════════════ BROKERAGES / LINKED ACCOUNTS ═══════════════

const brokerageProviders = [
  { id:"schwab", name:"Charles Schwab", logo:"🏦", color:"#2A6DDE", status:"connected", accts:[{name:"Individual Brokerage",num:"••••8742",type:"Margin",balance:42180,buying:18400},{name:"Roth IRA",num:"••••3291",type:"Retirement",balance:19067,buying:6200}], features:["Stocks","Options","Futures","ETFs","Bonds"], lastSync:"2 min ago" },
  { id:"ibkr", name:"Interactive Brokers", logo:"🔴", color:"#D4214E", status:"connected", accts:[{name:"Portfolio Margin",num:"••••5518",type:"Margin",balance:84620,buying:142000}], features:["Stocks","Options","Futures","Forex","Crypto","Bonds"], lastSync:"5 min ago" },
  { id:"fidelity", name:"Fidelity", logo:"🟢", color:"#4A8C3F", status:"disconnected", accts:[], features:["Stocks","Options","ETFs","Mutual Funds","Bonds"], lastSync:null },
  { id:"tdameritrade", name:"TD Ameritrade", logo:"🟩", color:"#3D8B37", status:"disconnected", accts:[], features:["Stocks","Options","Futures","ETFs","Forex"], lastSync:null },
  { id:"etrade", name:"E*TRADE", logo:"🟣", color:"#6B2D8B", status:"disconnected", accts:[], features:["Stocks","Options","ETFs","Bonds"], lastSync:null },
  { id:"robinhood", name:"Robinhood", logo:"🪶", color:"#00C805", status:"disconnected", accts:[], features:["Stocks","Options","ETFs","Crypto"], lastSync:null },
  { id:"tastytrade", name:"tastytrade", logo:"🍒", color:"#FF2D55", status:"disconnected", accts:[], features:["Stocks","Options","Futures","Crypto"], lastSync:null },
  { id:"webull", name:"Webull", logo:"🐂", color:"#F04D2D", status:"disconnected", accts:[], features:["Stocks","Options","ETFs","Crypto"], lastSync:null },
  { id:"tradier", name:"Tradier", logo:"📊", color:"#1DA1F2", status:"disconnected", accts:[], features:["Stocks","Options","ETFs"], lastSync:null },
  { id:"alpaca", name:"Alpaca", logo:"🦙", color:"#FFCD00", status:"disconnected", accts:[], features:["Stocks","ETFs","Crypto"], lastSync:null },
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
        <h1 style={{ fontSize: 10, fontWeight: 900, fontFamily: "Poppins" }}>🔗 Linked Accounts</h1>
        <p style={{ color: "#A09080", fontSize: 10, marginTop: 3 }}>Connect your brokerages — BasketTrade executes trades on your existing accounts</p>
      </div>

      {/* ── Aggregated Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(80px,1fr))", gap: 6, marginBottom: 8, animation: "fadeUp .4s ease .05s both" }}>
        {[
          { label: "Total Balance", val: "$" + (totalBalance / 1000).toFixed(1) + "k", icon: "💰", color: "#5C4A1E", bg: "#fff" },
          { label: "Buying Power", val: "$" + (totalBuying / 1000).toFixed(1) + "k", icon: "⚡", color: "#C48830", bg: "#FFF8EE" },
          { label: "Linked Brokers", val: connected.length, icon: "🔗", color: "#42A5F5", bg: "#E3F2FD" },
          { label: "Accounts", val: totalAccts, icon: "🏦", color: "#AB47BC", bg: "#F0E8F5" },
          { label: "Order Routing", val: routePref === "smart" ? "Smart" : "Manual", icon: "🎯", color: "#C48830", bg: "#FFF8EE" },
        ].map((m, i) => (
          <div key={i} style={{ background: m.bg, borderRadius: 16, padding: "8px 10px", animation: "fadeUp .4s ease " + (i * .04) + "s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 8, fontWeight: 800, color: "#A09080", textTransform: "uppercase", letterSpacing: .5 }}>{m.label}</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 700, color: m.color, marginTop: 2 }}>{m.val}</div>
              </div>
              <span style={{ fontSize: 12 }}>{m.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── How It Works Banner ── */}
      <div style={{ background: "linear-gradient(135deg, #fff, #FFF8EE)", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: "18px 22px", marginBottom: 10, animation: "fadeUp .4s ease .08s both" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 300px" }}>
            <div style={{ fontSize: 11, fontWeight: 900, fontFamily: "Poppins", marginBottom: 4 }}>🔐 How It Works</div>
            <div style={{ fontSize: 12, color: "#8A7040", lineHeight: 1.6 }}>BasketTrade connects to your existing brokerage via secure OAuth — we never store your password. When you buy a basket, we send orders directly to your broker for execution. Your funds stay with your broker at all times.</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[{ step: "1", label: "Link Account", icon: "🔗" }, { step: "2", label: "Choose Basket", icon: "🧺" }, { step: "3", label: "We Execute", icon: "⚡" }].map(s => (
              <div key={s.step} style={{ textAlign: "center", minWidth: 0, flex: "1" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, margin: "0 auto 4px", border: "1.5px solid #F0E6D0" }}>{s.icon}</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: "#C48830" }}>STEP {s.step}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#6B5A2E" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Connected Brokerages ── */}
      {connected.length > 0 && (
        <div style={{ marginBottom: 10, animation: "fadeUp .4s ease .12s both" }}>
          <div style={{ fontSize: 10, fontWeight: 900, fontFamily: "Poppins", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
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
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: broker.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, border: "1.5px solid " + broker.color + "22" }}>{broker.logo}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 900, fontFamily: "Poppins" }}>{broker.name}</span>
                        <span style={{ fontSize: 8, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: "#FFF8EE", color: "#C48830" }}>● CONNECTED</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#A09080", marginTop: 2 }}>{broker.accts.length} account{broker.accts.length !== 1 ? "s" : ""} · Last sync: {broker.lastSync}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 700 }}>${(broker.accts.reduce((s, a) => s + a.balance, 0) / 1000).toFixed(1)}k</div>
                      <div style={{ fontSize: 10, color: "#A09080" }}>Total Balance</div>
                    </div>
                    <span style={{ fontSize: 12, color: "#A09080", transform: isExpanded ? "rotate(180deg)" : "", transition: "transform .3s" }}>▾</span>
                  </div>

                  {/* Expanded Account Details */}
                  {isExpanded && (
                    <div style={{ borderTop: "2px solid #F0E6D0", animation: "fadeUp .2s ease both" }}>
                      {/* Account Cards */}
                      <div style={{ padding: "16px 22px" }}>
                        {broker.accts.map((acct, ai) => (
                          <div key={ai} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", background: "#FFFDF5", borderRadius: 16, marginBottom: 8, border: "1px solid #F0E6D0" }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: broker.color + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, fontFamily: "JetBrains Mono", color: broker.color }}>{acct.type === "Retirement" ? "IRA" : "MRG"}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 800, fontSize: 10, fontFamily: "Poppins" }}>{acct.name}</div>
                              <div style={{ fontSize: 10, color: "#A09080", fontFamily: "JetBrains Mono" }}>{acct.num} · {acct.type}</div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, textAlign: "right" }}>
                              <div>
                                <div style={{ fontSize: 8, fontWeight: 800, color: "#A09080", textTransform: "uppercase" }}>Balance</div>
                                <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 700 }}>${(acct.balance / 1000).toFixed(1)}k</div>
                              </div>
                              <div>
                                <div style={{ fontSize: 8, fontWeight: 800, color: "#A09080", textTransform: "uppercase" }}>Buying Power</div>
                                <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 700, color: "#C48830" }}>${(acct.buying / 1000).toFixed(1)}k</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Features & Actions */}
                      <div style={{ padding: "0 22px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {broker.features.map(f => (
                            <span key={f} style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: broker.color + "12", color: broker.color }}>{f}</span>
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button style={{ padding: "6px 14px", borderRadius: 10, border: "1.5px solid #F0E6D0", background: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", color: "#8A7040" }}>🔄 Sync Now</button>
                          <button onClick={() => setShowConfirm(broker.id)} style={{ padding: "6px 14px", borderRadius: 10, border: "1.5px solid #EF535033", background: "#FFEBEE", fontSize: 11, fontWeight: 700, cursor: "pointer", color: "#EF5350" }}>Disconnect</button>
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
        <div style={{ fontSize: 10, fontWeight: 900, fontFamily: "Poppins", marginBottom: 12 }}>Add a Brokerage</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6 }}>
          {available.map((broker, i) => {
            const isConnecting = connecting === broker.id;
            return (
              <div key={broker.id} style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: "18px 20px", transition: "all .3s", animation: "fadeUp .4s ease " + (i * .04) + "s both" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = broker.color + "44"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#F0E6D0"; e.currentTarget.style.transform = ""; }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: broker.color + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, border: "1.5px solid " + broker.color + "18" }}>{broker.logo}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 900, fontFamily: "Poppins" }}>{broker.name}</div>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: 3 }}>
                      {broker.features.slice(0, 4).map(f => (
                        <span key={f} style={{ fontSize: 8, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: "#FFF5E6", color: "#8A7040" }}>{f}</span>
                      ))}
                      {broker.features.length > 4 && <span style={{ fontSize: 8, color: "#A09080" }}>+{broker.features.length - 4}</span>}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleConnect(broker.id)} disabled={isConnecting}
                  style={{ width: "100%", padding: "10px", borderRadius: 14, border: "none", background: isConnecting ? "#FFF5E6" : "linear-gradient(135deg, " + broker.color + ", " + broker.color + "CC)", color: isConnecting ? "#A09080" : "#fff", fontSize: 10, fontWeight: 800, cursor: isConnecting ? "default" : "pointer", fontFamily: "Poppins", transition: "all .2s" }}>
                  {isConnecting ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <span style={{ display: "inline-block", width: 14, height: 14, border: "1.5px solid #A09080", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
                      Connecting via OAuth...
                    </span>
                  ) : "🔗 Connect " + broker.name}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Order Routing Preferences ── */}
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, marginTop: 10, animation: "fadeUp .4s ease .2s both" }}>
        <div style={{ fontSize: 11, fontWeight: 800, fontFamily: "Poppins", marginBottom: 4 }}>⚙️ Execution Settings</div>
        <div style={{ fontSize: 11, color: "#A09080", marginBottom: 7 }}>Control how BasketTrade routes orders across your linked accounts</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6 }}>
          {[
            { id: "smart", name: "Smart Routing", desc: "Auto-select best account based on buying power, margin, and commission", icon: "🧠", rec: true },
            { id: "lowest_cost", name: "Lowest Cost", desc: "Always route to the account with the lowest commissions", icon: "💰" },
            { id: "manual", name: "Manual Select", desc: "Choose which account to use before each basket purchase", icon: "✋" },
            { id: "split", name: "Split Across", desc: "Distribute positions across multiple accounts proportionally", icon: "🔀" },
          ].map(opt => (
            <div key={opt.id} onClick={() => setRoutePref(opt.id)}
              style={{ padding: "8px 10px", borderRadius: 16, border: "1.5px solid " + (routePref === opt.id ? "#C48830" : "#F0E6D0"), background: routePref === opt.id ? "#FFF8EE" : "#FFFDF5", cursor: "pointer", transition: "all .2s", position: "relative" }}>
              {opt.rec && <span style={{ position: "absolute", top: -6, right: 10, fontSize: 8, fontWeight: 800, padding: "1px 8px", borderRadius: 6, background: "#C48830", color: "#fff" }}>RECOMMENDED</span>}
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 10 }}>{opt.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", color: routePref === opt.id ? "#C48830" : "#5C4A1E" }}>{opt.name}</span>
              </div>
              <div style={{ fontSize: 11, color: "#8A7040", lineHeight: 1.5 }}>{opt.desc}</div>
              {routePref === opt.id && <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#C48830", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, position: "absolute", top: 14, right: 14 }}>✓</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Security Footer ── */}
      <div style={{ marginTop: 10, padding: "16px 22px", background: "#FFFDF5", border: "1.5px solid #F0E6D0", borderRadius: 18, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", animation: "fadeUp .4s ease .24s both" }}>
        {[
          { icon: "🔒", label: "256-bit Encryption", desc: "Bank-grade TLS" },
          { icon: "🔐", label: "OAuth 2.0", desc: "No passwords stored" },
          { icon: "🛡️", label: "SOC 2 Type II", desc: "Audited annually" },
          { icon: "📋", label: "Read + Trade", desc: "Permissioned access only" },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", flex: "1 1 140px" }}>
            <span style={{ fontSize: 11 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, fontFamily: "Poppins" }}>{s.label}</div>
              <div style={{ fontSize: 9, color: "#A09080" }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Disconnect Confirm Modal ── */}
      {showConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(45,32,22,.4)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowConfirm(null)}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "14px 28px 22px", width: 380, animation: "popIn .3s ease", border: "1.5px solid #F0E6D0" }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 40 }}>⚠️</span>
              <div style={{ fontSize: 10, fontWeight: 900, fontFamily: "Poppins", marginTop: 8 }}>Disconnect Brokerage?</div>
              <div style={{ fontSize: 12, color: "#8A7040", marginTop: 4, lineHeight: 1.5 }}>This will revoke BasketTrade's access. Open orders will still execute, but new basket trades won't route to this account.</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setShowConfirm(null)} style={{ flex: 1, padding: "12px", borderRadius: 14, border: "1.5px solid #F0E6D0", background: "#fff", fontSize: 10, fontWeight: 800, cursor: "pointer", color: "#8A7040" }}>Cancel</button>
              <button onClick={() => handleDisconnect(showConfirm)} style={{ flex: 1, padding: "12px", borderRadius: 14, border: "none", background: "#EF5350", color: "#fff", fontSize: 10, fontWeight: 800, cursor: "pointer" }}>Disconnect</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ═══════════════ MY ACCOUNT PAGE ═══════════════

// ═══════════════ NEWS PAGE ═══════════════

function NewsPage() {
  const [activeSection, setActiveSection] = useState("all");
  const sections = [
    { id: "all", label: "All", emoji: "📰" },
    { id: "guides", label: "Guides", emoji: "📚" },
    { id: "x", label: "X", emoji: "𝕏" },
    { id: "analyst", label: "Analyst", emoji: "🎯" },
    { id: "sector", label: "Sectors", emoji: "🌍" },
  ];

  const guides = [
    { id: 1, title: "Hedging 101: Protect Your Basket in Volatile Markets", tag: "Beginner", emoji: "🛡️", color: "#5B8C5A", summary: "Learn how to use options overlays, inverse ETFs, and position sizing to shield your portfolio from sudden drawdowns.", time: "5 min read", featured: true },
    { id: 2, title: "Building a Macro-Resilient Portfolio with EggBasket", tag: "Strategy", emoji: "🧺", color: "#C48830", summary: "How to combine inflation hedges, geopolitical shields, and growth baskets to weather any macro regime.", time: "8 min read", featured: true },
    { id: 3, title: "Tail Risk Hedging: When Black Swans Strike", tag: "Advanced", emoji: "🦢", color: "#7E57C2", summary: "Deep dive into VIX calls, put spreads, and dynamic hedging strategies for extreme market events.", time: "12 min read" },
    { id: 4, title: "Rate Cycle Playbook: Positioning for Fed Pivots", tag: "Strategy", emoji: "📉", color: "#42A5F5", summary: "Historical patterns show which asset classes outperform before, during, and after rate cut cycles.", time: "7 min read" },
    { id: 5, title: "Gold vs Crypto: The Ultimate Inflation Hedge Debate", tag: "Analysis", emoji: "⚖️", color: "#FFA726", summary: "Comparing safe havens and their performance across recent inflationary periods.", time: "6 min read" },
    { id: 6, title: "Sector Rotation: Following the Smart Money", tag: "Strategy", emoji: "🔄", color: "#E57373", summary: "How institutional fund flows signal the next winning sectors. Includes EggBasket sector tracking alerts.", time: "10 min read" },
  ];

  const xPosts = [
    { id: 1, handle: "@zerohedge", name: "ZeroHedge", verified: true, time: "12m", text: "BREAKING: 10Y yield surges past 4.65% as Treasury auction shows weakest demand since 2022. Risk-off incoming? 📉", likes: "4.2K", reposts: "1.8K", tag: "Bonds" },
    { id: 2, handle: "@unusual_whales", name: "Unusual Whales", verified: true, time: "28m", text: "Large NVDA put sweep: $120 strike, March expiry, $2.4M premium. Institutional hedging ahead of earnings? 🐋", likes: "3.1K", reposts: "892", tag: "Options" },
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
    { sector: "Technology", emoji: "💻", trend: "up", change: "+1.2%", headlines: [
      { title: "NVDA earnings beat: Revenue $38.2B vs $37.1B est.", time: "2h", hot: true },
      { title: "Apple announces M5 chip family, shares up 2.8%", time: "5h" },
      { title: "EU Digital Markets Act fines Meta $1.3B", time: "8h" },
    ]},
    { sector: "Energy", emoji: "⛽", trend: "up", change: "+2.8%", headlines: [
      { title: "Brent crude tops $85 on Middle East supply fears", time: "1h", hot: true },
      { title: "Chevron announces $20B buyback expansion", time: "4h" },
      { title: "OPEC+ extends production cuts through Q3 2026", time: "6h" },
    ]},
    { sector: "Healthcare", emoji: "🏥", trend: "up", change: "+0.6%", headlines: [
      { title: "Eli Lilly obesity drug shows 26% weight loss in Phase 3", time: "3h", hot: true },
      { title: "UnitedHealth raises 2026 guidance above consensus", time: "7h" },
      { title: "FDA fast-tracks Alzheimer's treatment from Biogen", time: "12h" },
    ]},
    { sector: "Financials", emoji: "🏦", trend: "down", change: "-0.4%", headlines: [
      { title: "Regional bank concerns resurface on CRE exposure", time: "1h" },
      { title: "Goldman Sachs Q4 trading revenue tops $5B", time: "6h" },
      { title: "Fed stress test results: all majors pass with buffers", time: "1d" },
    ]},
    { sector: "Defense", emoji: "🛡️", trend: "up", change: "+1.8%", headlines: [
      { title: "Pentagon awards $48B multi-year contract to Lockheed", time: "4h", hot: true },
      { title: "European defense spending pledges hit record levels", time: "8h" },
      { title: "RTX backlog reaches all-time high of $202B", time: "1d" },
    ]},
    { sector: "Real Estate", emoji: "🏠", trend: "down", change: "-1.1%", headlines: [
      { title: "30-year mortgage rate climbs to 7.2%, highest since Oct", time: "2h" },
      { title: "Office vacancy rate hits 20% in major metros", time: "1d" },
      { title: "REITs underperform as rate cut expectations fade", time: "1d" },
    ]},
  ];

  const actionCol = { UPGRADE: "#5B8C5A", DOWNGRADE: "#EF5350", HOLD: "#FFA726", ALERT: "#7E57C2" };
  const actionBg = { UPGRADE: "#EDF5ED", DOWNGRADE: "#FFEBEE", HOLD: "#FFF3E0", ALERT: "#F3E8FD" };

  const showGuides = activeSection === "all" || activeSection === "guides";
  const showX = activeSection === "all" || activeSection === "x";
  const showAnalyst = activeSection === "all" || activeSection === "analyst";
  const showSector = activeSection === "all" || activeSection === "sector";

  return (
    <div>
      {/* Section Filter Pills */}
      <div style={{ display: "flex", gap: 4, marginBottom: 10, overflowX: "auto", paddingBottom: 2 }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            style={{ display: "flex", alignItems: "center", gap: 3, padding: "5px 10px", borderRadius: 10, border: activeSection === s.id ? "1.5px solid #C48830" : "1.5px solid #F0E6D0", background: activeSection === s.id ? "#FFF8EE" : "#fff", color: activeSection === s.id ? "#C48830" : "#A09080", fontSize: 9, fontWeight: 800, cursor: "pointer", fontFamily: "Quicksand", whiteSpace: "nowrap", transition: "all .2s" }}>
            <span style={{ fontSize: 10 }}>{s.emoji}</span> {s.label}
          </button>
        ))}
      </div>

      {/* ── EggBasket Guides & Hedging ── */}
      {showGuides && <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, marginBottom: 8, animation: "fadeUp .4s ease both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 900, fontFamily: "Poppins" }}>📚 EggBasket Guides & Hedging</div>
          <span style={{ fontSize: 8, color: "#A09080" }}>{guides.length} articles</span>
        </div>
        {/* Featured cards */}
        <div style={{ display: "flex", gap: 6, marginBottom: 8, overflowX: "auto" }}>
          {guides.filter(g => g.featured).map(g => (
            <div key={g.id} style={{ minWidth: 200, flex: "0 0 auto", background: `linear-gradient(135deg, ${g.color}10, ${g.color}05)`, border: `1.5px solid ${g.color}22`, borderRadius: 14, padding: 12, cursor: "pointer", transition: "transform .2s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = ""}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>{g.emoji}</span>
                <span style={{ fontSize: 7, fontWeight: 800, color: g.color, background: g.color + "14", padding: "2px 6px", borderRadius: 4, textTransform: "uppercase" }}>{g.tag}</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", color: "#5C4A1E", lineHeight: 1.3, marginBottom: 4 }}>{g.title}</div>
              <div style={{ fontSize: 8, color: "#8A7040", lineHeight: 1.4 }}>{g.summary.slice(0, 80)}...</div>
              <div style={{ fontSize: 7, color: "#A09080", marginTop: 6, fontWeight: 600 }}>{g.time}</div>
            </div>
          ))}
        </div>
        {/* Article list */}
        {guides.filter(g => !g.featured).map((g, i) => (
          <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderTop: "1px solid #F0E6D0", cursor: "pointer" }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{g.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 800, fontFamily: "Poppins", color: "#5C4A1E", lineHeight: 1.3 }}>{g.title}</div>
              <div style={{ display: "flex", gap: 4, marginTop: 2, alignItems: "center" }}>
                <span style={{ fontSize: 7, fontWeight: 700, color: g.color, background: g.color + "14", padding: "1px 5px", borderRadius: 3 }}>{g.tag}</span>
                <span style={{ fontSize: 7, color: "#A09080" }}>{g.time}</span>
              </div>
            </div>
            <span style={{ fontSize: 10, color: "#D0C8B8" }}>›</span>
          </div>
        ))}
      </div>}

      {/* ── News from X ── */}
      {showX && <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, marginBottom: 8, animation: "fadeUp .4s ease .05s both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 900, fontFamily: "Poppins" }}>𝕏 Trending on X</div>
          <span style={{ fontSize: 8, color: "#5B8C5A", fontWeight: 700 }}>● Live</span>
        </div>
        {xPosts.map((p, i) => (
          <div key={p.id} style={{ padding: "8px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#fff", fontWeight: 900 }}>{p.name.charAt(0)}</div>
                <span style={{ fontSize: 9, fontWeight: 800, fontFamily: "Poppins", color: "#5C4A1E" }}>{p.name}</span>
                {p.verified && <svg width="10" height="10" viewBox="0 0 24 24" fill="#1DA1F2"><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/></svg>}
                <span style={{ fontSize: 7, color: "#A09080" }}>{p.handle}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 7, fontWeight: 700, color: "#1A1A1A", background: "#F0E6D0", padding: "1px 5px", borderRadius: 3 }}>{p.tag}</span>
                <span style={{ fontSize: 7, color: "#A09080" }}>{p.time}</span>
              </div>
            </div>
            <div style={{ fontSize: 9, color: "#5C4A1E", lineHeight: 1.4, marginLeft: 26, marginBottom: 4 }}>{p.text}</div>
            <div style={{ display: "flex", gap: 12, marginLeft: 26 }}>
              <span style={{ fontSize: 7, color: "#A09080" }}>♡ {p.likes}</span>
              <span style={{ fontSize: 7, color: "#A09080" }}>⟳ {p.reposts}</span>
            </div>
          </div>
        ))}
      </div>}

      {/* ── Analyst Reports ── */}
      {showAnalyst && <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, marginBottom: 8, animation: "fadeUp .4s ease .1s both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 900, fontFamily: "Poppins" }}>🎯 Analyst Reports</div>
          <span style={{ fontSize: 8, color: "#A09080" }}>{analystNotes.length} notes</span>
        </div>
        {analystNotes.map((a, i) => (
          <div key={a.id} style={{ padding: "8px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 7, fontWeight: 900, color: actionCol[a.action], background: actionBg[a.action], padding: "2px 6px", borderRadius: 4 }}>{a.action}</span>
                <span style={{ fontSize: 9, fontWeight: 800, fontFamily: "Poppins", color: "#5C4A1E" }}>{a.firm}</span>
              </div>
              <span style={{ fontSize: 7, color: "#A09080" }}>{a.time}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
              <span style={{ fontSize: 8, color: "#8A7040" }}>by {a.analyst}</span>
              <span style={{ fontSize: 8, fontFamily: "JetBrains Mono", fontWeight: 800, color: a.color }}>{a.target}</span>
            </div>
            <div style={{ fontSize: 8, color: "#5C4A1E", lineHeight: 1.4 }}>{a.summary}</div>
          </div>
        ))}
      </div>}

      {/* ── Global Sector News ── */}
      {showSector && <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, marginBottom: 8, animation: "fadeUp .4s ease .15s both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 900, fontFamily: "Poppins" }}>🌍 Global Sector News</div>
          <span style={{ fontSize: 8, color: "#A09080" }}>6 sectors</span>
        </div>
        {sectorNews.map((s, si) => (
          <div key={s.sector} style={{ marginBottom: si < sectorNews.length - 1 ? 8 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, padding: "4px 6px", background: s.trend === "up" ? "#EDF5ED" : "#FFEBEE", borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 12 }}>{s.emoji}</span>
                <span style={{ fontSize: 9, fontWeight: 800, fontFamily: "Poppins", color: "#5C4A1E" }}>{s.sector}</span>
              </div>
              <span style={{ fontSize: 9, fontFamily: "JetBrains Mono", fontWeight: 800, color: s.trend === "up" ? "#5B8C5A" : "#EF5350" }}>{s.change}</span>
            </div>
            {s.headlines.map((h, hi) => (
              <div key={hi} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 6px", borderBottom: hi < s.headlines.length - 1 ? "1px solid #F0E6D020" : "none" }}>
                {h.hot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF5350", flexShrink: 0 }} />}
                {!h.hot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D0C8B8", flexShrink: 0 }} />}
                <span style={{ fontSize: 8, color: "#5C4A1E", flex: 1, lineHeight: 1.3 }}>{h.title}</span>
                <span style={{ fontSize: 7, color: "#A09080", flexShrink: 0 }}>{h.time}</span>
              </div>
            ))}
          </div>
        ))}
      </div>}
    </div>
  );
}

function MyAccountPage({ onNavigate }) {
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
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #F0E6D0" }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: "#6B5A2E" }}>{label}</span>
      <div onClick={onToggle} style={{ width: 44, height: 24, borderRadius: 12, background: on ? "#C48830" : "#E8DCC8", cursor: "pointer", position: "relative", transition: "background .2s" }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: on ? 22 : 2, transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.15)" }} />
      </div>
    </div>
  );

  const MenuItem = ({ emoji, label, desc, badge, badgeColor, onClick, danger }) => (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid #F0E6D0", transition: "background .15s" }}
      onMouseEnter={e => e.currentTarget.style.background = "#fff"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: danger ? "#FFEBEE" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>{emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: danger ? "#EF5350" : "#5C4A1E" }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: "#A09080", marginTop: 1 }}>{desc}</div>}
      </div>
      {badge && <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 8, background: (badgeColor || "#C48830") + "18", color: badgeColor || "#C48830" }}>{badge}</span>}
      <span style={{ color: "#E8DCC8", fontSize: 12 }}>›</span>
    </div>
  );

  // Sub-page: back button
  const BackHeader = ({ title, emoji }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
      <button onClick={() => setAcctSection(null)} style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid #F0E6D0", background: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
      <div>
        <div style={{ fontSize: 12, fontWeight: 900, fontFamily: "Poppins" }}>{emoji} {title}</div>
      </div>
    </div>
  );

  // ── SUB-SECTIONS ──
  if (acctSection === "brokerages") return <div><BackHeader title="Linked Brokerages" emoji="🏦" /><BrokeragesPage /></div>;

  if (acctSection === "trades") return (
    <div>
      <BackHeader title="Trade History" emoji="📋" />
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr .5fr .5fr .5fr .7fr", padding: "8px 12px", borderBottom: "2px solid #F0E6D0", fontSize: 10, color: "#A09080", textTransform: "uppercase", letterSpacing: 1, fontWeight: 800, background: "#fff" }}><div>Basket</div><div>Action</div><div>Date</div><div>Status</div><div style={{ textAlign: "right" }}>Amount</div></div>
        {recentTrades.map((t, i) => <div key={t.id} style={{ display: "grid", gridTemplateColumns: "1.3fr .5fr .5fr .5fr .7fr", padding: "8px 12px", borderBottom: i < recentTrades.length - 1 ? "1px solid #F0E6D0" : "none", alignItems: "center", transition: "background .2s" }} onMouseEnter={e => e.currentTarget.style.background = "#fff"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ fontSize: 10 }}>{t.emoji}</span><span style={{ fontWeight: 800, fontSize: 12, fontFamily: "Poppins" }}>{t.basket}</span></div>
          <div style={{ fontSize: 11, fontWeight: 800, color: t.action === "Buy" || t.action === "Dividend" ? "#C48830" : t.action === "Sell" ? "#EF5350" : "#42A5F5" }}>{t.action}</div>
          <div style={{ fontSize: 11, color: "#8A7040" }}>{t.date}</div>
          <div><span style={{ fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 14, background: t.status === "Completed" ? "#FFF8EE" : "#FFF3E0", color: t.status === "Completed" ? "#5B8C5A" : "#FFA726" }}>{t.status}</span></div>
          <div style={{ textAlign: "right", fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 12, color: t.amount.startsWith("+") ? "#5B8C5A" : "#EF5350" }}>{t.amount}</div>
        </div>)}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
        <StatCard label="Executed" value="142" emoji="🎯" color="terracotta" /><StatCard label="Win Rate" value="72%" emoji="🏆" color="sage" /><StatCard label="Avg Return" value="+2.8%" emoji="✨" color="golden" />
      </div>
    </div>
  );

  if (acctSection === "profile") return (
    <div>
      <BackHeader title="Profile" emoji="👤" />
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 14 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 24, paddingBottom: 20, borderBottom: "2px solid #F0E6D0" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#C48830,#EF5350)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#fff", fontWeight: 900, fontFamily: "Poppins" }}>JD</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 900, fontFamily: "Poppins" }}>John Doe</div>
            <div style={{ fontSize: 10, color: "#A09080" }}>john.doe@email.com</div>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 8, background: "#FFF8EE", color: "#C48830", marginTop: 4, display: "inline-block" }}>Pro Member</span>
          </div>
        </div>
        {[
          { label: "Full Name", val: "John Doe" },
          { label: "Email", val: "john.doe@email.com" },
          { label: "Phone", val: "+1 (555) 234-5678" },
          { label: "Date of Birth", val: "March 15, 1992" },
          { label: "Country", val: "United States" },
          { label: "Tax ID (SSN)", val: "•••-••-4821" },
          { label: "Member Since", val: "January 2024" },
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < 6 ? "1px solid #F0E6D0" : "none" }}>
            <span style={{ fontSize: 12, color: "#A09080", fontWeight: 700 }}>{f.label}</span>
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: f.label.includes("Tax") || f.label.includes("Phone") ? "JetBrains Mono" : "Quicksand", color: "#5C4A1E" }}>{f.val}</span>
          </div>
        ))}
        <button style={{ marginTop: 8, width: "100%", padding: 12, borderRadius: 14, border: "1.5px solid #C48830", background: "#FFF8EE", color: "#C48830", fontSize: 10, fontWeight: 800, cursor: "pointer", fontFamily: "Poppins" }}>✏️ Edit Profile</button>
      </div>
    </div>
  );

  if (acctSection === "security") return (
    <div>
      <BackHeader title="Login & Security" emoji="🔐" />
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, fontFamily: "Poppins", marginBottom: 8, color: "#6B5A2E" }}>Authentication</div>
        <div style={{ padding: "14px 0", borderBottom: "1px solid #F0E6D0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700 }}>Password</div>
            <div style={{ fontSize: 11, color: "#A09080" }}>Last changed 42 days ago</div>
          </div>
          <button style={{ padding: "8px 16px", borderRadius: 10, border: "1.5px solid #F0E6D0", background: "#fff", fontSize: 11, fontWeight: 800, cursor: "pointer", color: "#42A5F5" }}>Change</button>
        </div>
        <Toggle on={twoFA} onToggle={() => setTwoFA(!twoFA)} label="Two-Factor Authentication (2FA)" />
        <Toggle on={biometric} onToggle={() => setBiometric(!biometric)} label="Biometric Login (Face ID / Touch ID)" />
        <div style={{ fontSize: 11, fontWeight: 800, fontFamily: "Poppins", marginBottom: 12, marginTop: 10, color: "#6B5A2E" }}>Active Sessions</div>
        {[
          { device: "MacBook Pro — Chrome", loc: "Portland, OR", time: "Active now", current: true },
          { device: "iPhone 15 Pro — Safari", loc: "Portland, OR", time: "2 hours ago", current: false },
          { device: "iPad Air — Safari", loc: "Portland, OR", time: "3 days ago", current: false },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #F0E6D0" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{s.device}</div>
              <div style={{ fontSize: 10, color: "#A09080" }}>{s.loc} · {s.time}</div>
            </div>
            {s.current ? <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 8, background: "#FFF8EE", color: "#C48830" }}>This device</span>
            : <button style={{ padding: "5px 12px", borderRadius: 8, border: "1.5px solid #FFEBEE", background: "#fff", fontSize: 10, fontWeight: 800, cursor: "pointer", color: "#EF5350" }}>Revoke</button>}
          </div>
        ))}
        <button style={{ marginTop: 8, width: "100%", padding: 12, borderRadius: 14, border: "1.5px solid #EF5350", background: "#FFEBEE", color: "#EF5350", fontSize: 10, fontWeight: 800, cursor: "pointer" }}>🚫 Sign Out All Other Devices</button>
      </div>
    </div>
  );

  if (acctSection === "notifications") return (
    <div>
      <BackHeader title="Notifications" emoji="🔔" />
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, fontFamily: "Poppins", marginBottom: 4, color: "#6B5A2E" }}>Communication</div>
        <Toggle on={emailNotifs} onToggle={() => setEmailNotifs(!emailNotifs)} label="Email notifications" />
        <Toggle on={pushNotifs} onToggle={() => setPushNotifs(!pushNotifs)} label="Push notifications" />
        <div style={{ fontSize: 11, fontWeight: 800, fontFamily: "Poppins", marginBottom: 4, marginTop: 10, color: "#6B5A2E" }}>Trading</div>
        <Toggle on={tradeConfirm} onToggle={() => setTradeConfirm(!tradeConfirm)} label="Trade confirmations" />
        <Toggle on={priceAlerts} onToggle={() => setPriceAlerts(!priceAlerts)} label="Price & macro alerts" />
        <div style={{ marginTop: 16, padding: "14px 18px", background: "#E3F2FD", borderRadius: 14, fontSize: 11, color: "#42A5F5", fontWeight: 700 }}>
          ℹ️ Manage specific basket alerts from each basket's detail page.
        </div>
      </div>
    </div>
  );

  if (acctSection === "privacy") return (
    <div>
      <BackHeader title="Privacy" emoji="🛡️" />
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 14 }}>
        <Toggle on={dataSharing} onToggle={() => setDataSharing(!dataSharing)} label="Share anonymized data for product improvement" />
        <Toggle on={analytics} onToggle={() => setAnalytics(!analytics)} label="Usage analytics" />
        <div style={{ padding: "14px 0", borderBottom: "1px solid #F0E6D0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontSize: 10, fontWeight: 700 }}>Download my data</div><div style={{ fontSize: 11, color: "#A09080" }}>Export all your account and trading data</div></div>
          <button style={{ padding: "8px 16px", borderRadius: 10, border: "1.5px solid #F0E6D0", background: "#fff", fontSize: 11, fontWeight: 800, cursor: "pointer", color: "#42A5F5" }}>Request</button>
        </div>
        <div style={{ padding: "14px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontSize: 10, fontWeight: 700, color: "#EF5350" }}>Delete my account</div><div style={{ fontSize: 11, color: "#A09080" }}>Permanently remove all data. This cannot be undone.</div></div>
          <button style={{ padding: "8px 16px", borderRadius: 10, border: "1.5px solid #EF5350", background: "#FFEBEE", fontSize: 11, fontWeight: 800, cursor: "pointer", color: "#EF5350" }}>Delete</button>
        </div>
      </div>
    </div>
  );

  if (acctSection === "policies") return (
    <div>
      <BackHeader title="Legal & Policies" emoji="📄" />
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, overflow: "hidden" }}>
        {[
          { title: "Terms of Service", ver: "v3.2 — Updated Jan 2026", emoji: "📜" },
          { title: "Privacy Policy", ver: "v2.8 — Updated Dec 2025", emoji: "🔒" },
          { title: "Trading Disclaimer", ver: "v1.4 — Updated Nov 2025", emoji: "⚖️" },
          { title: "Brokerage Data Agreement", ver: "v2.1 — Updated Jan 2026", emoji: "🤝" },
          { title: "Cookie Policy", ver: "v1.1 — Updated Sep 2025", emoji: "🍪" },
          { title: "Acceptable Use Policy", ver: "v1.0 — Updated Aug 2025", emoji: "✅" },
        ].map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderBottom: "1px solid #F0E6D0", cursor: "pointer", transition: "background .15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#fff"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <span style={{ fontSize: 11 }}>{p.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700 }}>{p.title}</div>
              <div style={{ fontSize: 10, color: "#A09080" }}>{p.ver}</div>
            </div>
            <span style={{ color: "#42A5F5", fontSize: 11, fontWeight: 700 }}>View →</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, padding: "14px 18px", background: "#fff", borderRadius: 14, border: "1px solid #F0E6D0", fontSize: 11, color: "#A09080" }}>
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
        <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: "14px 24px", display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#C48830,#EF5350)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 900, fontFamily: "Poppins", flexShrink: 0 }}>JD</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 900, fontFamily: "Poppins" }}>John Doe</div>
            <div style={{ fontSize: 12, color: "#A09080" }}>john.doe@email.com</div>
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 8, background: "#FFF8EE", color: "#C48830" }}>Pro Member</span>
              <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 8, background: "#FFF8EE", color: "#C48830" }}>{connectedBrokers.length} Broker{connectedBrokers.length !== 1 ? "s" : ""} Linked</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 800 }}>${(connectedBrokers.reduce((s, b) => s + b.accts.reduce((a, ac) => a + ac.balance, 0), 0) / 1000).toFixed(1)}k</div>
            <div style={{ fontSize: 10, color: "#A09080", fontWeight: 700 }}>Aggregate Balance</div>
          </div>
        </div>
      </div>

      {/* ── Menu Sections ── */}
      <div style={{ display: "grid", gap: 6 }}>
        {/* Account */}
        <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, overflow: "hidden", animation: "fadeUp .4s ease .05s both" }}>
          <div style={{ padding: "8px 12px", borderBottom: "2px solid #F0E6D0", background: "#fff" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#A09080", textTransform: "uppercase", letterSpacing: 1 }}>Account</div>
          </div>
          <MenuItem emoji="👤" label="Profile" desc="Name, email, phone, personal info" onClick={() => setAcctSection("profile")} />
          <MenuItem emoji="🏦" label="Linked Brokerages" desc="Manage your connected brokerage accounts" badge={connectedBrokers.length + " connected"} badgeColor="#C48830" onClick={() => setAcctSection("brokerages")} />
          <MenuItem emoji="📋" label="Trade History" desc="View all executed trades and performance" badge="142 trades" badgeColor="#42A5F5" onClick={() => setAcctSection("trades")} />
        </div>

        {/* Security & Privacy */}
        <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, overflow: "hidden", animation: "fadeUp .4s ease .1s both" }}>
          <div style={{ padding: "8px 12px", borderBottom: "2px solid #F0E6D0", background: "#fff" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#A09080", textTransform: "uppercase", letterSpacing: 1 }}>Security & Privacy</div>
          </div>
          <MenuItem emoji="🔐" label="Login & Security" desc="Password, 2FA, active sessions" badge="2FA On" badgeColor="#C48830" onClick={() => setAcctSection("security")} />
          <MenuItem emoji="🛡️" label="Privacy" desc="Data sharing, analytics, account deletion" onClick={() => setAcctSection("privacy")} />
          <MenuItem emoji="🔔" label="Notifications" desc="Email, push, trade confirmations, alerts" onClick={() => setAcctSection("notifications")} />
        </div>

        {/* Legal */}
        <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, overflow: "hidden", animation: "fadeUp .4s ease .15s both" }}>
          <div style={{ padding: "8px 12px", borderBottom: "2px solid #F0E6D0", background: "#fff" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#A09080", textTransform: "uppercase", letterSpacing: 1 }}>Legal & Support</div>
          </div>
          <MenuItem emoji="📄" label="Legal & Policies" desc="Terms, privacy policy, disclaimers" onClick={() => setAcctSection("policies")} />
          <MenuItem emoji="💬" label="Support" desc="Help center, contact us, report an issue" badge="24/7" badgeColor="#FFA726" onClick={() => {}} />
          <MenuItem emoji="⭐" label="Rate BasketTrade" desc="Love the app? Leave us a review" onClick={() => {}} />
        </div>

        {/* Danger zone */}
        <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, overflow: "hidden", animation: "fadeUp .4s ease .2s both" }}>
          <MenuItem emoji="🚪" label="Sign Out" danger onClick={() => {}} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "12px 0 8px", animation: "fadeUp .4s ease .25s both" }}>
        <div style={{ fontSize: 10, color: "#E8DCC8", fontWeight: 700 }}>BasketTrade v2.4.0 · © 2026 BasketTrade Inc.</div>
        <div style={{ fontSize: 9, color: "#E8DCC8", marginTop: 2 }}>Not a broker-dealer. All trades executed via linked accounts.</div>
      </div>
    </div>
  );
}

// ═══════════════ CHECKOUT ═══════════════

// ═══════════════ PORTFOLIO HOROSCOPE ═══════════════
function HoroscopePage() {
  const [view, setView] = useState("lunar");

  // ── Moon Phase Data ──
  const lunarDay = 12; // days into current cycle
  const moonPhase = lunarDay < 3.7 ? "🌑 New Moon" : lunarDay < 7.4 ? "🌒 Waxing Crescent" : lunarDay < 11.1 ? "🌓 First Quarter" : lunarDay < 14.8 ? "🌔 Waxing Gibbous" : lunarDay < 18.5 ? "🌕 Full Moon" : lunarDay < 22.1 ? "🌖 Waning Gibbous" : lunarDay < 25.8 ? "🌗 Last Quarter" : "🌘 Waning Crescent";
  const nextFull = 3; // days to full moon
  const nextNew = 17;
  const moonPct = ((lunarDay / 29.5) * 100).toFixed(0);

  // ── Planetary Positions ──
  const planets = [
    { name: "Mercury", symbol: "☿", sign: "Aquarius", retro: true, retroDates: "Feb 4 – Feb 24", marketEffect: "Communication breakdowns. Earnings revisions likely. Tech glitches disrupt trading. Historically S&P -1.2% avg during Mercury Rx.", color: "#EF5350", intensity: "High" },
    { name: "Venus", symbol: "♀", sign: "Pisces", retro: false, retroDates: null, marketEffect: "Venus in Pisces favors luxury, entertainment, and consumer sentiment. Risk appetite elevated. Gold catches a bid on aesthetic value cycles.", color: "#5B8C5A", intensity: "Mild" },
    { name: "Mars", symbol: "♂", sign: "Gemini", retro: false, retroDates: null, marketEffect: "Mars in Gemini drives dual-directional momentum. Sector rotation accelerates. Volume spikes in info-tech and telecom. Day traders thrive.", color: "#FFA726", intensity: "Moderate" },
    { name: "Jupiter", symbol: "♃", sign: "Taurus", retro: false, retroDates: null, marketEffect: "Jupiter in Taurus expands material wealth cycles. Commodities, real estate, and value stocks in a multi-month tailwind. Banking sector benefits from expansion energy.", color: "#5B8C5A", intensity: "Strong" },
    { name: "Saturn", symbol: "♄", sign: "Pisces", retro: false, retroDates: null, marketEffect: "Saturn in Pisces restructures financial systems. Regulatory pressure on crypto and shadow banking. Bonds find discipline. 29.5-year Saturn cycle suggests secular regime shift.", color: "#42A5F5", intensity: "Structural" },
  ];

  // ── Cycle Correlations ──
  const cycles = [
    { name: "Lunar Cycle (29.5d)", icon: "🌕", phase: "Waxing Gibbous", correlation: "+68%", note: "Markets historically rally +0.8% in 5 days before full moon. Institutional buying peaks at waxing gibbous. Full moon = local top risk.", barPct: 68, color: "#C48830" },
    { name: "Mercury Retrograde", icon: "☿", phase: "IN RETROGRADE", correlation: "-62%", note: "S&P averages -1.2% during Rx periods (3-4x/year, ~21 days each). Miscommunication drives earnings misses. Avoid initiating new positions.", barPct: 62, color: "#EF5350" },
    { name: "Sunspot Cycle (11yr)", icon: "☀️", phase: "Solar Maximum", correlation: "+54%", note: "We're at solar max (Cycle 25, peak 2024-25). Historically correlated with market volatility spikes. The Jevons solar-economic hypothesis shows agricultural & commodity sensitivity.", barPct: 54, color: "#FFA726" },
    { name: "Saturn Return (29.5yr)", icon: "♄", phase: "Pisces transit", correlation: "+71%", note: "Saturn entered Pisces 2023 — last time was 1994 (bond crisis) and 1964 (structural shift). Major financial regulation and institutional restructuring ahead.", barPct: 71, color: "#42A5F5" },
    { name: "Jupiter-Saturn Conjunction", icon: "♃♄", phase: "Next: 2040", correlation: "+73%", note: "Every ~20 years: 2000 (dot-com), 1980 (Volcker), 1961 (Kennedy boom), 1940 (war economy). 2020 conjunction marked COVID pivot. Pattern suggests next structural break ~2040.", barPct: 73, color: "#AB47BC" },
    { name: "Metonic Cycle (19yr)", icon: "🌙", phase: "Year 6 of 19", correlation: "+58%", note: "Moon returns to exact same phase on same calendar date every 19 years. 2007 → 2026 echo: credit conditions tightening, yield curve dynamics rhyming. Watch spring equinox.", barPct: 58, color: "#C48830" },
  ];

  // ── Current Celestial Weather ──
  const celestialWeather = {
    overall: "Stormy",
    score: 38,
    color: "#EF5350",
    summary: "Mercury retrograde in Aquarius creates a volatile backdrop. The waxing gibbous moon amplifies risk appetite into next week's full moon, but retrograde energy warns against overcommitting. Jupiter in Taurus provides a floor for commodity and value plays. Saturn's disciplining hand in Pisces keeps speculation in check — this is a cycle for patience, not aggression.",
    signals: [
      { signal: "Full Moon approaching (3 days)", bias: "Caution", icon: "🌕", desc: "Institutional selling historically picks up 1-2 days after full moon", color: "#EF5350" },
      { signal: "Mercury Rx until Feb 24", bias: "Bearish", icon: "☿", desc: "Avoid new trades. Expect earnings revisions and data surprises", color: "#EF5350" },
      { signal: "Jupiter in Taurus (through May)", bias: "Bullish", icon: "♃", desc: "Long-cycle tailwind for commodities, value, and real assets", color: "#5B8C5A" },
      { signal: "Venus enters Pisces", bias: "Neutral-Bull", icon: "♀", desc: "Consumer sentiment lifts. Luxury and entertainment favored", color: "#5B8C5A" },
    ]
  };

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 12, fontWeight: 900, fontFamily: "Poppins" }}>🌙 Celestial Market Cycles</h1>
        <p style={{ color: "#A09080", fontSize: 9, marginTop: 2 }}>Lunar phases, planetary retrogrades & astronomical cycle correlations</p>
      </div>

      {/* View tabs */}
      <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
        {[{ id: "lunar", l: "🌕 Lunar" }, { id: "planets", l: "☿ Planets" }, { id: "cycles", l: "♄ Cycles" }].map(t => (
          <button key={t.id} onClick={() => setView(t.id)} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: "none", background: view === t.id ? "#1A1A2E" : "#fff", color: view === t.id ? "#E8DCC8" : "#A09080", fontSize: 9, fontWeight: 800, cursor: "pointer", fontFamily: "Quicksand", border: view !== t.id ? "1.5px solid #F0E6D0" : "1.5px solid #1A1A2E" }}>{t.l}</button>
        ))}
      </div>

      {/* ── CELESTIAL WEATHER BANNER ── */}
      <div style={{ background: "linear-gradient(135deg, #0D1B2A, #1B2838, #162447)", borderRadius: 14, padding: "12px 12px", marginBottom: 8, position: "relative", overflow: "hidden" }}>
        {/* Stars */}
        {[...Array(20)].map((_, i) => <div key={i} style={{ position: "absolute", width: i % 3 === 0 ? 2 : 1, height: i % 3 === 0 ? 2 : 1, borderRadius: "50%", background: "#fff", opacity: 0.2 + (i % 4) * 0.15, top: (i * 17 + 3) % 80 + "%", left: (i * 23 + 7) % 95 + "%", animation: `blink ${2 + i % 3}s ease ${i * 0.3}s infinite` }} />)}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 8, fontWeight: 700, color: "#7A8BA0", textTransform: "uppercase", letterSpacing: 1 }}>Celestial Weather</div>
              <div style={{ fontSize: 14, fontWeight: 900, fontFamily: "Poppins", color: celestialWeather.color }}>{celestialWeather.overall}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "JetBrains Mono", color: celestialWeather.color }}>{celestialWeather.score}</div>
              <div style={{ fontSize: 7, color: "#7A8BA0", fontWeight: 700 }}>/ 100 SCORE</div>
            </div>
          </div>
          {/* Moon Phase Visual */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", background: "rgba(255,255,255,.05)", borderRadius: 10, padding: "8px 10px", marginBottom: 8 }}>
            <div style={{ fontSize: 28, lineHeight: 1 }}>🌔</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#E8DCC8", fontFamily: "Poppins" }}>{moonPhase}</div>
              <div style={{ fontSize: 8, color: "#7A8BA0" }}>Day {lunarDay} of 29.5 · {moonPct}% illuminated</div>
              <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                <span style={{ fontSize: 7, color: "#C48830", fontWeight: 700 }}>🌕 Full in {nextFull}d</span>
                <span style={{ fontSize: 7, color: "#7A8BA0", fontWeight: 700 }}>🌑 New in {nextNew}d</span>
              </div>
            </div>
            {/* Moon progress bar */}
            <div style={{ width: 50, height: 50, borderRadius: "50%", border: "2px solid #334", position: "relative", overflow: "hidden", flexShrink: 0 }}>
              <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: moonPct + "%", background: "#E8DCC8", transition: "width .5s" }} />
            </div>
          </div>
          <p style={{ fontSize: 8, color: "#9AABBD", lineHeight: 1.5 }}>{celestialWeather.summary}</p>
        </div>
      </div>

      {/* ── LUNAR VIEW ── */}
      {view === "lunar" && <div>
        {/* Signals */}
        <div style={{ fontSize: 9, fontWeight: 800, fontFamily: "Poppins", marginBottom: 6, color: "#5C4A1E" }}>Active Celestial Signals</div>
        {celestialWeather.signals.map((s, i) => (
          <div key={i} style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 10, padding: "8px 10px", marginBottom: 4, animation: "fadeUp .3s ease " + (i * .05) + "s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <span style={{ fontSize: 12 }}>{s.icon}</span>
                <span style={{ fontSize: 9, fontWeight: 800, color: "#5C4A1E" }}>{s.signal}</span>
              </div>
              <span style={{ fontSize: 8, fontWeight: 800, color: s.color, background: s.color + "15", padding: "1px 6px", borderRadius: 4 }}>{s.bias}</span>
            </div>
            <div style={{ fontSize: 8, color: "#8A7A68", lineHeight: 1.3, paddingLeft: 20 }}>{s.desc}</div>
          </div>
        ))}

        {/* Historical lunar pattern */}
        <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 10, padding: "8px 10px", marginTop: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 800, fontFamily: "Poppins", marginBottom: 6 }}>🌕 Lunar Cycle → Market Pattern (50yr data)</div>
          <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 50, marginBottom: 4 }}>
            {[3,5,7,8,10,9,7,4,2,-1,-3,-4,-2,0,2,4,6,8,9,10,8,6,4,3,2,1,0,-1,3,5].map((v, i) => (
              <div key={i} style={{ flex: 1, height: Math.abs(v) * 4 + 2, background: v >= 0 ? "#C48830" : "#EF5350", borderRadius: 1, opacity: i === lunarDay ? 1 : 0.4, transition: "all .3s", position: "relative" }}>
                {i === lunarDay && <div style={{ position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#C48830" }} />}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, color: "#A09080" }}>
            <span>🌑 New</span><span>🌓 Q1</span><span>🌕 Full</span><span>🌗 Q3</span><span>🌑 New</span>
          </div>
          <div style={{ fontSize: 8, color: "#8A7A68", marginTop: 6, lineHeight: 1.4 }}>
            Strongest returns cluster around waxing phases (days 5-13). Post-full-moon correction is statistically significant (p &lt; 0.03). Current position: <span style={{ fontWeight: 800, color: "#C48830" }}>day {lunarDay} — approaching peak</span>.
          </div>
        </div>
      </div>}

      {/* ── PLANETS VIEW ── */}
      {view === "planets" && <div>
        <div style={{ fontSize: 9, fontWeight: 800, fontFamily: "Poppins", marginBottom: 6, color: "#5C4A1E" }}>Planetary Positions & Market Effects</div>
        {planets.map((p, i) => (
          <div key={i} style={{ background: p.retro ? "#1A1A2E" : "#fff", border: `1.5px solid ${p.retro ? "#EF535044" : "#F0E6D0"}`, borderRadius: 10, padding: "8px 10px", marginBottom: 4, animation: "fadeUp .3s ease " + (i * .04) + "s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <span style={{ fontSize: 16, fontFamily: "serif" }}>{p.symbol}</span>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", color: p.retro ? "#E8DCC8" : "#5C4A1E" }}>{p.name} <span style={{ fontWeight: 600, color: p.retro ? "#7A8BA0" : "#8A7A68" }}>in {p.sign}</span></div>
                  {p.retro && <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 1 }}>
                    <span style={{ fontSize: 7, fontWeight: 900, background: "#EF5350", color: "#fff", padding: "1px 5px", borderRadius: 3, animation: "blink 2s ease infinite" }}>℞ RETROGRADE</span>
                    <span style={{ fontSize: 7, color: "#7A8BA0" }}>{p.retroDates}</span>
                  </div>}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 8, fontWeight: 800, color: p.color, background: p.color + "18", padding: "1px 6px", borderRadius: 4 }}>{p.intensity}</span>
              </div>
            </div>
            <div style={{ fontSize: 8, color: p.retro ? "#9AABBD" : "#8A7A68", lineHeight: 1.4, marginTop: 2 }}>{p.marketEffect}</div>
          </div>
        ))}

        {/* Retrograde Calendar */}
        <div style={{ background: "#1A1A2E", borderRadius: 10, padding: "8px 10px", marginTop: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: "#E8DCC8", fontFamily: "Poppins", marginBottom: 6 }}>☿ Retrograde Calendar 2026</div>
          {[
            { planet: "Mercury ☿", dates: "Feb 4 – Feb 24", status: "ACTIVE", color: "#EF5350" },
            { planet: "Mercury ☿", dates: "May 29 – Jun 22", status: "Upcoming", color: "#FFA726" },
            { planet: "Mercury ☿", dates: "Sep 23 – Oct 15", status: "Upcoming", color: "#FFA726" },
            { planet: "Venus ♀", dates: "Jul 10 – Aug 20", status: "Upcoming", color: "#FFA726" },
            { planet: "Mars ♂", dates: "Oct 30 – Jan 12 '27", status: "Upcoming", color: "#FFA726" },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderTop: i > 0 ? "1px solid #ffffff11" : "none" }}>
              <span style={{ fontSize: 9, color: "#E8DCC8", fontWeight: 600 }}>{r.planet}</span>
              <span style={{ fontSize: 8, color: "#7A8BA0", fontFamily: "JetBrains Mono" }}>{r.dates}</span>
              <span style={{ fontSize: 7, fontWeight: 800, color: r.color, background: r.color + "22", padding: "1px 5px", borderRadius: 3 }}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>}

      {/* ── CYCLES VIEW ── */}
      {view === "cycles" && <div>
        <div style={{ fontSize: 9, fontWeight: 800, fontFamily: "Poppins", marginBottom: 6, color: "#5C4A1E" }}>Astronomical Cycles × Market Correlation</div>
        {cycles.map((c, i) => (
          <div key={i} style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 10, padding: "8px 10px", marginBottom: 4, animation: "fadeUp .3s ease " + (i * .04) + "s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <span style={{ fontSize: 14 }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", color: "#5C4A1E" }}>{c.name}</div>
                  <div style={{ fontSize: 8, fontWeight: 700, color: c.phase === "IN RETROGRADE" ? "#EF5350" : "#8A7A68" }}>{c.phase}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 900, color: c.color }}>{c.correlation}</div>
                <div style={{ fontSize: 7, color: "#A09080" }}>correlation</div>
              </div>
            </div>
            {/* Correlation bar */}
            <div style={{ height: 4, background: "#F0E6D0", borderRadius: 2, marginBottom: 4 }}>
              <div style={{ height: "100%", width: c.barPct + "%", background: c.color, borderRadius: 2, transition: "width .5s" }} />
            </div>
            <div style={{ fontSize: 8, color: "#8A7A68", lineHeight: 1.4 }}>{c.note}</div>
          </div>
        ))}

        {/* Historical echo */}
        <div style={{ background: "linear-gradient(135deg, #0D1B2A, #162447)", borderRadius: 10, padding: "10px 12px", marginTop: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: "#E8DCC8", fontFamily: "Poppins", marginBottom: 4 }}>🔄 Cyclical Echo: 2007 → 2026</div>
          <div style={{ fontSize: 8, color: "#9AABBD", lineHeight: 1.5 }}>
            The Metonic cycle (19 years) places 2026 as a lunar echo of 2007. Key parallels: yield curve normalization after prolonged inversion, housing market stretched, credit conditions tightening, and Saturn in the same sign. The 2007 analog suggests a <span style={{ fontWeight: 800, color: "#EF5350" }}>Q3 vulnerability window</span> — but Jupiter's Taurus transit (absent in 2007) provides a stabilizing counterweight through material wealth expansion.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 8 }}>
            <div style={{ background: "rgba(255,255,255,.06)", borderRadius: 6, padding: "6px 8px" }}>
              <div style={{ fontSize: 7, color: "#7A8BA0", fontWeight: 700, textTransform: "uppercase" }}>2007 Analog</div>
              <div style={{ fontSize: 9, color: "#EF5350", fontWeight: 800 }}>S&P peaked Oct</div>
            </div>
            <div style={{ background: "rgba(255,255,255,.06)", borderRadius: 6, padding: "6px 8px" }}>
              <div style={{ fontSize: 7, color: "#7A8BA0", fontWeight: 700, textTransform: "uppercase" }}>2026 Projection</div>
              <div style={{ fontSize: 9, color: "#FFA726", fontWeight: 800 }}>Watch Aug-Oct</div>
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
    { name: "Northeast", emoji: "🏙️", temp: "28°F", condition: "❄️ Snow", wind: "18mph NW", sentiment: "Bearish", color: "#42A5F5",
      impact: "Heavy snow disrupts logistics + retail foot traffic. Energy demand spikes → nat gas +3.2%. Airlines delayed → carrier stocks -1.4%.",
      affected: [{ ticker: "UNG", move: "+3.2%", clr: "#5B8C5A" }, { ticker: "HD", move: "+1.8%", clr: "#5B8C5A" }, { ticker: "DAL", move: "-1.4%", clr: "#EF5350" }, { ticker: "WMT", move: "-0.6%", clr: "#EF5350" }] },
    { name: "Southeast", emoji: "🌴", temp: "72°F", condition: "☀️ Clear", wind: "8mph S", sentiment: "Bullish", color: "#5B8C5A",
      impact: "Mild weather supports construction + outdoor retail. Tourism steady. No disruption to ports or shipping lanes.",
      affected: [{ ticker: "DHI", move: "+0.8%", clr: "#5B8C5A" }, { ticker: "LOW", move: "+0.5%", clr: "#5B8C5A" }, { ticker: "DIS", move: "+0.3%", clr: "#5B8C5A" }, { ticker: "FDX", move: "+0.2%", clr: "#5B8C5A" }] },
    { name: "Midwest", emoji: "🌾", temp: "15°F", condition: "🌨️ Ice Storm", wind: "25mph N", sentiment: "Bearish", color: "#EF5350",
      impact: "Ice storms halt grain transport on Mississippi River. Commodity futures volatile. Agricultural equipment demand paused. Heating costs surge.",
      affected: [{ ticker: "CORN", move: "+2.1%", clr: "#5B8C5A" }, { ticker: "DE", move: "-1.2%", clr: "#EF5350" }, { ticker: "UNG", move: "+2.8%", clr: "#5B8C5A" }, { ticker: "RAIL", move: "-0.9%", clr: "#EF5350" }] },
    { name: "West Coast", emoji: "🌊", temp: "58°F", condition: "🌧️ Rain", wind: "12mph W", sentiment: "Neutral", color: "#FFA726",
      impact: "Atmospheric river brings heavy rain to CA. Drought relief positive for agriculture long-term but short-term flooding risks. Tech corridor unaffected.",
      affected: [{ ticker: "AAPL", move: "0.0%", clr: "#A09080" }, { ticker: "DWA", move: "+0.4%", clr: "#5B8C5A" }, { ticker: "AGR", move: "+1.1%", clr: "#5B8C5A" }, { ticker: "PG", move: "-0.2%", clr: "#EF5350" }] },
    { name: "Gulf Coast", emoji: "🛢️", temp: "65°F", condition: "⛅ Partly Cloudy", wind: "10mph SE", sentiment: "Bullish", color: "#5B8C5A",
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
        <h1 style={{ fontSize: 12, fontWeight: 900, fontFamily: "Poppins" }}>🌤️ Weather × Markets</h1>
        <p style={{ color: "#A09080", fontSize: 9, marginTop: 2 }}>US weather patterns & their impact on stock performance</p>
      </div>

      <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
        {[{ id: "current", l: "📡 Live" }, { id: "seasonal", l: "📅 Seasonal" }, { id: "alpha", l: "📈 Alpha" }].map(t => (
          <button key={t.id} onClick={() => setView(t.id)} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: `1.5px solid ${view === t.id ? "#42A5F5" : "#F0E6D0"}`, background: view === t.id ? "#42A5F5" : "#fff", color: view === t.id ? "#fff" : "#A09080", fontSize: 9, fontWeight: 800, cursor: "pointer", fontFamily: "Quicksand" }}>{t.l}</button>
        ))}
      </div>

      {/* ── WEATHER ALPHA BANNER ── */}
      <div style={{ background: "linear-gradient(135deg, #1B3A5C, #2D5A87, #1B4B6C)", borderRadius: 14, padding: "10px 12px", marginBottom: 8, position: "relative", overflow: "hidden" }}>
        {/* Cloud/sun decorations */}
        <div style={{ position: "absolute", top: 4, right: 12, fontSize: 20, opacity: 0.15 }}>⛅</div>
        <div style={{ position: "absolute", bottom: 4, right: 40, fontSize: 14, opacity: 0.1 }}>🌧️</div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 7, fontWeight: 700, color: "#7AAEDB", textTransform: "uppercase", letterSpacing: 1 }}>Weather Alpha Score</div>
              <div style={{ fontSize: 14, fontWeight: 900, fontFamily: "Poppins", color: weatherAlpha.color }}>{weatherAlpha.label}</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: "50%", border: `3px solid ${weatherAlpha.color}`, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.3)" }}>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 16, fontWeight: 900, color: weatherAlpha.color }}>{weatherAlpha.score}</span>
            </div>
          </div>
          <p style={{ fontSize: 8, color: "#AECCE6", lineHeight: 1.4 }}>{weatherAlpha.summary}</p>
        </div>
      </div>

      {/* ── LIVE VIEW ── */}
      {view === "current" && <div>
        <div style={{ fontSize: 9, fontWeight: 800, fontFamily: "Poppins", marginBottom: 6, color: "#5C4A1E" }}>US Regional Weather & Market Impact</div>
        {regions.map((r, i) => (
          <div key={i} style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 10, padding: "8px 10px", marginBottom: 4, animation: "fadeUp .3s ease " + (i * .04) + "s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <span style={{ fontSize: 14 }}>{r.emoji}</span>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins" }}>{r.name}</div>
                  <div style={{ fontSize: 8, color: "#A09080" }}>{r.condition} · {r.temp} · Wind {r.wind}</div>
                </div>
              </div>
              <span style={{ fontSize: 8, fontWeight: 800, color: r.color, background: r.color + "15", padding: "2px 6px", borderRadius: 4 }}>{r.sentiment}</span>
            </div>
            <div style={{ fontSize: 8, color: "#6B5A2E", lineHeight: 1.3, marginBottom: 6 }}>{r.impact}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 3 }}>
              {r.affected.map((a, j) => (
                <div key={j} style={{ background: "#FFFDF5", borderRadius: 6, padding: "4px 6px", textAlign: "center" }}>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 8, fontWeight: 800 }}>{a.ticker}</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 8, fontWeight: 700, color: a.clr }}>{a.move}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>}

      {/* ── SEASONAL VIEW ── */}
      {view === "seasonal" && <div>
        <div style={{ fontSize: 9, fontWeight: 800, fontFamily: "Poppins", marginBottom: 6, color: "#5C4A1E" }}>Seasonal Weather Patterns × Market Correlation</div>
        {seasonal.map((s, i) => (
          <div key={i} style={{ background: s.active ? s.color + "08" : "#fff", border: `1.5px solid ${s.active ? s.color + "44" : "#F0E6D0"}`, borderRadius: 10, padding: "8px 10px", marginBottom: 4, animation: "fadeUp .3s ease " + (i * .04) + "s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", color: "#5C4A1E" }}>
                  {s.pattern} {s.active && <span style={{ fontSize: 7, background: s.color, color: "#fff", padding: "1px 5px", borderRadius: 3, marginLeft: 4 }}>ACTIVE</span>}
                </div>
                <div style={{ fontSize: 8, color: "#A09080" }}>{s.period}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 900, color: s.color }}>{s.correlation}</div>
                <div style={{ fontSize: 7, color: "#A09080" }}>correlation</div>
              </div>
            </div>
            <div style={{ height: 4, background: "#F0E6D0", borderRadius: 2, marginBottom: 4 }}>
              <div style={{ height: "100%", width: s.barPct + "%", background: s.color, borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 8, color: "#6B5A2E", lineHeight: 1.3 }}>{s.desc}</div>
          </div>
        ))}

        {/* Seasonal Calendar Mini */}
        <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 10, padding: "8px 10px", marginTop: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 800, fontFamily: "Poppins", marginBottom: 6 }}>📅 Weather-Sensitive Calendar</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 2 }}>
            {["J","F","M","A","M","J","J","A","S","O","N","D"].map((m, i) => {
              const isCurrent = i === 1;
              const risk = i >= 5 && i <= 10 ? "#EF5350" : i >= 0 && i <= 2 ? "#42A5F5" : i >= 2 && i <= 4 ? "#5B8C5A" : "#FFA726";
              return (
                <div key={i} style={{ textAlign: "center", padding: "4px 0", borderRadius: 4, background: isCurrent ? risk : risk + "15", border: isCurrent ? `2px solid ${risk}` : "none" }}>
                  <div style={{ fontSize: 7, fontWeight: 800, color: isCurrent ? "#fff" : risk }}>{m}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 6, fontSize: 7, color: "#A09080", justifyContent: "center" }}>
            <span><span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 1, background: "#42A5F5", marginRight: 2, verticalAlign: "middle" }} />Winter</span>
            <span><span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 1, background: "#5B8C5A", marginRight: 2, verticalAlign: "middle" }} />Planting</span>
            <span><span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 1, background: "#EF5350", marginRight: 2, verticalAlign: "middle" }} />Hurricane</span>
            <span><span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 1, background: "#FFA726", marginRight: 2, verticalAlign: "middle" }} />Harvest</span>
          </div>
        </div>
      </div>}

      {/* ── ALPHA VIEW ── */}
      {view === "alpha" && <div>
        <div style={{ fontSize: 9, fontWeight: 800, fontFamily: "Poppins", marginBottom: 6, color: "#5C4A1E" }}>Weather-Driven Trade Signals</div>
        {weatherAlpha.signals.map((s, i) => (
          <div key={i} style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 10, padding: "8px 10px", marginBottom: 4, animation: "fadeUp .3s ease " + (i * .04) + "s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <span style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", color: s.color }}>{s.signal}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 40, height: 4, background: "#F0E6D0", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: s.confidence + "%", background: s.color, borderRadius: 2 }} />
                </div>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 9, fontWeight: 800, color: s.color }}>{s.confidence}%</span>
              </div>
            </div>
            <div style={{ fontSize: 8, color: "#6B5A2E", lineHeight: 1.3 }}>{s.reason}</div>
          </div>
        ))}

        {/* Historical weather alpha */}
        <div style={{ background: "linear-gradient(135deg, #1B3A5C, #2D5A87)", borderRadius: 10, padding: "10px 12px", marginTop: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: "#E8DCC8", fontFamily: "Poppins", marginBottom: 6 }}>📊 Historical Weather Alpha (10yr backtest)</div>
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
                <div style={{ fontSize: 8, color: "#AECCE6", fontWeight: 700, marginBottom: 2 }}>{h.label}</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 9, fontWeight: 800, color: h.clr }}>{h.avgReturn}</span>
                  <span style={{ fontSize: 8, color: "#7AAEDB" }}>Win: {h.win}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 8, color: "#7AAEDB", textAlign: "center" }}>Based on NOAA data × equity returns 2015–2025</div>
        </div>
      </div>}
    </div>
  );
}


// ═══════════════ CURRENCIES SCENARIO ═══════════════
function CurrenciesScenarioPage() {
  const [pair, setPair] = useState("dxy");
  const pairs = {
    dxy: { name: "US Dollar Index", icon: "💵", price: "104.2", change: "+0.3%", clr: "#5B8C5A",
      scenarios: [
        { name: "Dollar Bull", prob: "35%", target: "108-112", color: "#5B8C5A", desc: "Fed stays hawkish, US exceptionalism continues. EM currencies crushed." },
        { name: "Dollar Neutral", prob: "40%", target: "102-106", color: "#FFA726", desc: "Range-bound. Mixed data offsets. Carry trades persist." },
        { name: "Dollar Bear", prob: "25%", target: "96-100", color: "#EF5350", desc: "Fed pivots aggressively. Global risk-on. EM and commodities rally." }
      ] },
    eurusd: { name: "EUR/USD", icon: "🇪🇺", price: "1.0785", change: "-0.2%", clr: "#EF5350",
      scenarios: [
        { name: "Euro Strength", prob: "30%", target: "1.12-1.15", color: "#5B8C5A", desc: "ECB lags Fed cuts. European recovery surprises. Flows rotate to EU assets." },
        { name: "Rangebound", prob: "45%", target: "1.06-1.10", color: "#FFA726", desc: "Both central banks converge. Trade balance neutral." },
        { name: "Parity Risk", prob: "25%", target: "0.98-1.04", color: "#EF5350", desc: "European recession deepens. Energy crisis redux. Capital flight to USD." }
      ] },
    usdjpy: { name: "USD/JPY", icon: "🇯🇵", price: "151.8", change: "+0.5%", clr: "#5B8C5A",
      scenarios: [
        { name: "BOJ Tightens", prob: "35%", target: "140-145", color: "#5B8C5A", desc: "BOJ normalizes. Carry trade unwinds. JPY surges. Global vol spikes." },
        { name: "Gradual Drift", prob: "40%", target: "148-155", color: "#FFA726", desc: "Slow adjustment. MOF intervention threats. Range-bound with bias higher." },
        { name: "Carry Blowup", prob: "25%", target: "155-165", color: "#EF5350", desc: "Rate differential widens further. JPY freefalls. BOJ forced to intervene." }
      ] },
    btcusd: { name: "BTC/USD", icon: "₿", price: "$97,200", change: "+2.1%", clr: "#5B8C5A",
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
        <h1 style={{ fontSize: 12, fontWeight: 900, fontFamily: "Poppins" }}>💱 Currency Scenarios</h1>
        <p style={{ color: "#A09080", fontSize: 9, marginTop: 2 }}>FX pair scenarios — rate differentials & macro flows</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4, marginBottom: 8 }}>
        {Object.entries(pairs).map(([id, pr]) => (
          <button key={id} onClick={() => setPair(id)} style={{ padding: "8px 4px", borderRadius: 10, border: `1.5px solid ${pair === id ? "#C48830" : "#F0E6D0"}`, background: pair === id ? "#FFF8EE" : "#fff", cursor: "pointer", textAlign: "center" }}>
            <div style={{ fontSize: 14 }}>{pr.icon}</div>
            <div style={{ fontSize: 8, fontWeight: 800, color: pair === id ? "#C48830" : "#A09080" }}>{id.toUpperCase()}</div>
          </button>
        ))}
      </div>
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 12, padding: "10px 12px", marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 900, fontFamily: "Poppins" }}>{p.name}</div>
          <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 700 }}>{p.price} <span style={{ color: p.clr, fontSize: 9 }}>{p.change}</span></div>
        </div>
        {p.scenarios.map((sc, i) => (
          <div key={i} style={{ background: sc.color + "11", borderRadius: 8, padding: "8px 10px", marginBottom: 4, border: `1px solid ${sc.color}22` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: sc.color }}>{sc.name}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 9, fontWeight: 800, color: sc.color }}>{sc.target}</span>
                <span style={{ fontSize: 8, fontWeight: 700, color: "#A09080" }}>{sc.prob}</span>
              </div>
            </div>
            <div style={{ fontSize: 8, color: "#6B5A2E", lineHeight: 1.3 }}>{sc.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════ MACRO DASHBOARD PAGE ═══════════════
function MacroDashboardPage({ onGoRiskLab }) {
  return (
    <div>
      <div style={{ marginBottom: 8, animation: "fadeUp .3s ease both" }}>
        <h1 style={{ fontSize: 12, fontWeight: 900, fontFamily: "Poppins" }}>🔥 Macro Dashboard</h1>
        <p style={{ color: "#A09080", fontSize: 9, marginTop: 2 }}>Current regime, macro indicators & economic outlook</p>
      </div>

      {/* ── Full Regime Banner ── */}
      <div style={{ background: currentRegime.bg, border: `2px solid ${currentRegime.color}33`, borderRadius: 14, padding: "12px 14px", marginBottom: 8, animation: "fadeUp .4s ease both" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 14 }}>{currentRegime.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: "#A09080", textTransform: "uppercase", letterSpacing: 1 }}>Current Macro Regime</div>
            <div style={{ fontSize: 14, fontWeight: 900, fontFamily: "Poppins", color: currentRegime.color }}>{currentRegime.name}</div>
          </div>
          <div style={{ background: "#fff", borderRadius: 10, padding: "6px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 8, color: "#A09080", fontWeight: 700 }}>Confidence</div>
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 13, fontWeight: 800, color: currentRegime.color }}>{currentRegime.confidence}%</div>
          </div>
        </div>
        <div style={{ fontSize: 9, color: "#6B5A2E", lineHeight: 1.5, marginBottom: 8 }}>{currentRegime.desc}</div>
        <div style={{ fontSize: 9, color: "#8A7040", lineHeight: 1.5, background: "#fff", borderRadius: 10, padding: "7px 10px" }}>
          <span style={{ fontWeight: 800, color: currentRegime.color }}>Playbook:</span> {currentRegime.playbook}
        </div>
      </div>

      {/* ── Macro Indicators Grid ── */}
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 12, padding: 10, marginBottom: 8, animation: "fadeUp .4s ease .1s both" }}>
        <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", marginBottom: 6 }}>📡 Key Indicators</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {macroIndicators.map(ind => {
            const sc = { bullish: "#C48830", bearish: "#EF5350", neutral: "#A09080" };
            const bg = { bullish: "#FFF8EE", bearish: "#FFEBEE", neutral: "#fff" };
            const delta = ind.value - ind.prev;
            return (
              <div key={ind.id} style={{ background: bg[ind.signal], borderRadius: 10, padding: "8px 10px", border: `1px solid ${sc[ind.signal]}22` }}>
                <div style={{ fontSize: 8, fontWeight: 800, color: "#A09080", textTransform: "uppercase", letterSpacing: .5, marginBottom: 3 }}>{ind.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 700, color: "#5C4A1E" }}>{ind.value}{ind.unit}</span>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 9, fontWeight: 700, color: sc[ind.signal] }}>
                    {delta >= 0 ? "▲" : "▼"}{Math.abs(delta).toFixed(ind.unit === "%" ? 2 : 1)}
                  </span>
                </div>
                <div style={{ fontSize: 8, fontWeight: 800, color: sc[ind.signal], textTransform: "uppercase", marginTop: 2 }}>{ind.signal}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Regime History ── */}
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 12, padding: 10, marginBottom: 8, animation: "fadeUp .4s ease .15s both" }}>
        <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", marginBottom: 6 }}>📜 Regime Timeline</div>
        {[
          { regime: "Reflation", start: "Jan 15", end: "Present", duration: "23 days", color: "#EF5350", emoji: "🔥", active: true },
          { regime: "Goldilocks", start: "Nov 20", end: "Jan 14", duration: "55 days", color: "#5B8C5A", emoji: "🌿", active: false },
          { regime: "Risk-Off", start: "Oct 5", end: "Nov 19", duration: "45 days", color: "#42A5F5", emoji: "🧊", active: false },
          { regime: "Stagflation", start: "Aug 12", end: "Oct 4", duration: "53 days", color: "#8A7040", emoji: "💀", active: false },
        ].map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none" }}>
            <span style={{ fontSize: 12 }}>{r.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: r.color, fontFamily: "Poppins" }}>{r.regime} {r.active && <span style={{ fontSize: 7, background: r.color, color: "#fff", padding: "1px 5px", borderRadius: 4 }}>ACTIVE</span>}</div>
              <div style={{ fontSize: 8, color: "#A09080" }}>{r.start} – {r.end} · {r.duration}</div>
            </div>
            <div style={{ width: 40, height: 4, background: "#F0E6D0", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: r.active ? "100%" : "0%", background: r.color, borderRadius: 2, animation: r.active ? "alertProgress 2s linear infinite" : "none" }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── What This Means For You ── */}
      <div style={{ background: currentRegime.bg, border: `1.5px solid ${currentRegime.color}33`, borderRadius: 12, padding: 10, marginBottom: 8, animation: "fadeUp .4s ease .2s both" }}>
        <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", color: currentRegime.color, marginBottom: 6 }}>⚡ Portfolio Impact</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {[
            { label: "Favors", items: "Energy, Gold, Value, Commodities", clr: "#5B8C5A" },
            { label: "Avoids", items: "Long Duration, Growth, REITs, Bonds", clr: "#EF5350" },
            { label: "Hedge With", items: "TIPS, Gold Futures, Put Spreads", clr: "#42A5F5" },
            { label: "Watch For", items: "CPI prints, Fed minutes, Oil supply", clr: "#FFA726" },
          ].map((item, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 8, padding: "6px 8px" }}>
              <div style={{ fontSize: 8, fontWeight: 800, color: item.clr, textTransform: "uppercase", marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 8, color: "#6B5A2E", lineHeight: 1.3 }}>{item.items}</div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onGoRiskLab} style={{ width: "100%", padding: 11, background: "linear-gradient(135deg,#C48830,#EF5350)", color: "#fff", border: "none", borderRadius: 12, fontSize: 10, fontWeight: 900, cursor: "pointer", fontFamily: "Poppins" }}>🧪 Open Risk Lab →</button>
    </div>
  );
}

function RiskLabPage({ onOpenMacro }) {
  const [stressId, setStressId] = useState(null);
  const [hedgeFilter, setHedgeFilter] = useState("all");
  const [dismissedHedges, setDismissedHedges] = useState([]);
  const activeStress = stressScenarios.find(s => s.id === stressId);
  const filteredHedges = (hedgeFilter === "all" ? hedgeRecommendations : hedgeRecommendations.filter(h => h.priority === hedgeFilter)).filter(h => !dismissedHedges.includes(h.id));

  return (
    <div>
      <div style={{ marginBottom: 10, animation: "fadeUp .3s ease both" }}>
        <h1 style={{ fontSize: 10, fontWeight: 900, fontFamily: "Poppins" }}>🧪 Risk Lab</h1>
        <p style={{ color: "#A09080", fontSize: 10, marginTop: 3 }}>Stress testing, hedging & portfolio risk analysis</p>
      </div>

      {/* ── 1. Regime Banner (compact, clickable) ── */}
      <div onClick={onOpenMacro} style={{ background: currentRegime.bg, border: `1.5px solid ${currentRegime.color}33`, borderRadius: 12, padding: "8px 12px", marginBottom: 8, animation: "fadeUp .4s ease both", cursor: "pointer", transition: "all .3s" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = currentRegime.color} onMouseLeave={e => e.currentTarget.style.borderColor = currentRegime.color + "33"}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11 }}>{currentRegime.emoji}</span>
            <div>
              <div style={{ fontSize: 8, fontWeight: 800, color: "#A09080", textTransform: "uppercase", letterSpacing: .8 }}>Regime</div>
              <div style={{ fontSize: 11, fontWeight: 900, fontFamily: "Poppins", color: currentRegime.color }}>{currentRegime.name} <span style={{ fontFamily: "JetBrains Mono", fontSize: 9, fontWeight: 700, opacity: .7 }}>{currentRegime.confidence}%</span></div>
            </div>
          </div>
          <span style={{ fontSize: 9, color: currentRegime.color, fontWeight: 800 }}>Details →</span>
        </div>
      </div>

      {/* ── 2. Hedge Recommendations (with expiration) ── */}
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, marginBottom: 8, animation: "fadeUp .4s ease .1s both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
          <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins" }}>🛡️ Hedge Recommendations</div>
          <div style={{ display: "flex", gap: 2, background: "#FFFDF5", borderRadius: 8, padding: 2 }}>
            {["all","high","medium","low"].map(f => (
              <button key={f} onClick={() => setHedgeFilter(f)} style={{ padding: "3px 8px", borderRadius: 6, border: "none", background: hedgeFilter === f ? "#fff" : "transparent", color: hedgeFilter === f ? "#C48830" : "#A09080", fontSize: 8, fontWeight: 800, cursor: "pointer", textTransform: "capitalize", boxShadow: hedgeFilter === f ? "0 1px 3px rgba(0,0,0,.06)" : "none" }}>{f}</button>
            ))}
          </div>
        </div>
        {filteredHedges.length === 0 && <div style={{ textAlign: "center", padding: "20px 0", color: "#A09080", fontSize: 9 }}>All hedges executed or expired ✓</div>}
        {filteredHedges.map((h, i) => {
          const pCol = { high: "#EF5350", medium: "#FFA726", low: "#42A5F5" };
          const pBg = { high: "#FFEBEE", medium: "#FFF3E0", low: "#E3F2FD" };
          const aCol = { BUY: "#C48830", SELL: "#EF5350", ADD: "#C48830", REDUCE: "#EF5350", ROTATE: "#42A5F5" };
          const expPct = h.totalDuration > 0 ? ((h.totalDuration - (h.expiresIn * (h.expiresUnit === "hrs" ? 1 : 24))) / h.totalDuration) * 100 : 0;
          const circumference = 2 * Math.PI * 14;
          const strokeDashoffset = circumference * (1 - expPct / 100);
          const isUrgent = (h.expiresUnit === "hrs" && h.expiresIn <= 6) || (h.expiresUnit === "days" && h.expiresIn <= 1);
          return (
            <div key={h.id} style={{ padding: "10px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none", animation: "fadeUp .3s ease " + (i * .04) + "s both" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                {/* Expiration Circle */}
                <div style={{ flexShrink: 0, position: "relative", width: 36, height: 36 }}>
                  <svg width="36" height="36" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#F0E6D0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke={isUrgent ? "#EF5350" : pCol[h.priority]} strokeWidth="3"
                      strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset .5s", animation: isUrgent ? "blink 2s ease infinite" : "none" }} />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 9, fontWeight: 900, color: isUrgent ? "#EF5350" : "#5C4A1E", lineHeight: 1 }}>{h.expiresIn}</div>
                    <div style={{ fontSize: 6, fontWeight: 700, color: "#A09080", lineHeight: 1 }}>{h.expiresUnit}</div>
                  </div>
                </div>
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 3, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 8, fontWeight: 900, padding: "1px 6px", borderRadius: 4, background: aCol[h.action] || "#A09080", color: "#fff" }}>{h.action}</span>
                    <span style={{ fontWeight: 800, fontSize: 9, fontFamily: "Poppins" }}>{h.instrument}</span>
                    <span style={{ fontSize: 7, fontWeight: 800, padding: "1px 5px", borderRadius: 4, background: pBg[h.priority], color: pCol[h.priority] }}>{h.priority.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: 8, color: "#6B5A2E", lineHeight: 1.3, marginBottom: 4 }}>{h.desc}</div>
                  <div style={{ display: "flex", gap: 4, fontSize: 8, color: "#A09080", flexWrap: "wrap" }}>
                    <span>💰 {h.cost}</span>
                    <span>📈 {h.impact}</span>
                  </div>
                </div>
                {/* Action buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 3, flexShrink: 0 }}>
                  <button style={{ background: "linear-gradient(135deg,#C48830,#EF5350)", color: "#fff", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 8, fontWeight: 800, cursor: "pointer" }}>Execute</button>
                  <button onClick={() => setDismissedHedges(prev => [...prev, h.id])} style={{ background: "#F0E6D0", color: "#A09080", border: "none", borderRadius: 8, padding: "4px 10px", fontSize: 7, fontWeight: 800, cursor: "pointer" }}>Dismiss</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Stress Test ── */}
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, marginBottom: 8, animation: "fadeUp .4s ease .15s both" }}>
        <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", marginBottom: 7 }}>💥 Stress Test Scenarios</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(80px,1fr))", gap: 6, marginBottom: 8 }}>
          {stressScenarios.map(s => {
            const active = stressId === s.id;
            const col = s.portfolioPL >= 0 ? "#5B8C5A" : "#EF5350";
            return (
              <button key={s.id} onClick={() => setStressId(active ? null : s.id)} style={{ background: active ? (s.portfolioPL >= 0 ? "#EDF5ED" : "#FFEBEE") : "#fff", border: `1.5px solid ${active ? col : "#F0E6D0"}`, borderRadius: 12, padding: "6px 8px", cursor: "pointer", textAlign: "left", transition: "all .2s" }}>
                <div style={{ fontSize: 10, marginBottom: 2 }}>{s.emoji}</div>
                <div style={{ fontSize: 9, fontWeight: 800, fontFamily: "Poppins" }}>{s.name}</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 700, color: col, marginTop: 2 }}>{s.portfolioPL >= 0 ? "+" : ""}{s.portfolioPL}%</div>
              </button>
            );
          })}
        </div>
        {activeStress && (
          <div style={{ animation: "fadeUp .3s ease both" }}>
            <div style={{ fontSize: 9, fontWeight: 800, fontFamily: "Poppins", marginBottom: 6 }}>Impact: <span style={{ color: activeStress.portfolioPL >= 0 ? "#5B8C5A" : "#EF5350" }}>{activeStress.name}</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 4 }}>
              {myBaskets.map(b => {
                const impact = activeStress.impacts[b.id];
                if (impact === undefined) return null;
                const dollarImpact = Math.round(b.value * impact / 100);
                return (
                  <div key={b.id} style={{ background: impact >= 0 ? "#EDF5ED" : "#FFEBEE", borderRadius: 10, padding: "6px 10px", border: `1px solid ${impact >= 0 ? "#5B8C5A" : "#EF5350"}22`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <span style={{ fontSize: 10 }}>{b.emoji}</span>
                      <span style={{ fontWeight: 800, fontSize: 9, fontFamily: "Poppins" }}>{b.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 700, color: impact >= 0 ? "#5B8C5A" : "#EF5350" }}>{impact >= 0 ? "+" : ""}{impact}%</span>
                      <span style={{ fontFamily: "JetBrains Mono", fontSize: 9, fontWeight: 600, color: "#8A7040" }}>{fmtS(dollarImpact)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 6, padding: "8px 10px", background: activeStress.portfolioPL >= 0 ? "#EDF5ED" : "#FFEBEE", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 800, fontSize: 9, fontFamily: "Poppins" }}>Total Portfolio</span>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 700, color: activeStress.portfolioPL >= 0 ? "#5B8C5A" : "#EF5350" }}>{activeStress.portfolioPL >= 0 ? "+" : ""}{activeStress.portfolioPL}% ({fmtS(Math.round(41240 * activeStress.portfolioPL / 100))})</span>
            </div>
          </div>
        )}
      </div>

      {/* ── 4. Portfolio Risk Metrics ── */}
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, marginBottom: 8, animation: "fadeUp .4s ease .2s both" }}>
        <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", marginBottom: 7 }}>📊 Portfolio Risk Metrics</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {[
            { label: "Sharpe", value: portfolioRisk.sharpe.toFixed(2), good: portfolioRisk.sharpe > 1 },
            { label: "Beta", value: portfolioRisk.beta.toFixed(2), good: portfolioRisk.beta < 1.3 },
            { label: "Ann. Vol", value: portfolioRisk.volatility.toFixed(1) + "%", good: portfolioRisk.volatility < 20 },
            { label: "Max DD", value: portfolioRisk.maxDrawdown.toFixed(1) + "%", good: portfolioRisk.maxDrawdown > -15 },
            { label: "VaR 95%", value: fmtS(portfolioRisk.var95), good: false },
            { label: "Calmar", value: portfolioRisk.calmar.toFixed(2), good: portfolioRisk.calmar > 1 },
          ].map((m, i) => (
            <div key={i} style={{ background: m.good ? "#EDF5ED" : "#FFEBEE", borderRadius: 8, padding: "6px 8px" }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: "#A09080" }}>{m.label}</div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 800, color: m.good ? "#5B8C5A" : "#EF5350" }}>{m.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, padding: "6px 8px", background: portfolioRisk.sectorConcentration > 40 ? "#FFEBEE" : "#FFF8EE", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontSize: 9, fontWeight: 800, fontFamily: "Poppins" }}>⚠️ Concentration</div><div style={{ fontSize: 8, color: "#8A7040" }}>Top: {portfolioRisk.topHolding.ticker} ({portfolioRisk.topHolding.pct}%)</div></div>
          <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 700, color: "#EF5350" }}>{portfolioRisk.sectorConcentration}%</div>
        </div>
      </div>

      {/* ── 5. Basket Correlations (END) ── */}
      <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, marginBottom: 8, animation: "fadeUp .4s ease .3s both" }}>
        <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", marginBottom: 7 }}>🔗 Basket Correlations</div>
        <div style={{ display: "grid", gridTemplateColumns: "80px repeat(" + myBaskets.length + ", 1fr)", gap: 4, fontSize: 9 }}>
          <div />
          {myBaskets.map(b => <div key={b.id} style={{ textAlign: "center", fontWeight: 800, padding: 4, fontSize: 8 }}>{b.emoji} {b.name.split(" ")[0]}</div>)}
          {myBaskets.map((b, ri) => (
            <React.Fragment key={b.id}>
              <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 3, padding: "3px 0" }}><span>{b.emoji}</span><span style={{ fontSize: 8 }}>{b.name.split(" ")[0]}</span></div>
              {basketCorrelations[ri] && basketCorrelations[ri].map((c, ci) => {
                const abs = Math.abs(c);
                const bg = ri === ci ? "#FFF5E6" : c > 0.5 ? "rgba(232,116,97," + (abs * 0.4) + ")" : c < -0.05 ? "rgba(91,155,213," + (abs * 0.6) + ")" : "rgba(107,155,110," + (abs * 0.3) + ")";
                return <div key={ci} style={{ textAlign: "center", padding: "8px 2px", borderRadius: 6, background: bg, fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 10, color: ri === ci ? "#A09080" : "#5C4A1E" }}>{c.toFixed(2)}</div>;
              })}
            </React.Fragment>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 9, color: "#8A7040", lineHeight: 1.5 }}>
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "rgba(232,116,97,0.35)", marginRight: 3, verticalAlign: "middle" }} /> High correlation
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "rgba(91,155,213,0.35)", marginRight: 3, marginLeft: 8, verticalAlign: "middle" }} /> Negative (hedge)
        </div>

        {/* Factor Exposure */}
        <div style={{ marginTop: 12, borderTop: "1px solid #F0E6D0", paddingTop: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 800, fontFamily: "Poppins", marginBottom: 6 }}>Factor Exposure</div>
          {factorExposures.map((f, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontSize: 8, fontWeight: 700 }}>{f.factor}</span>
                <span style={{ fontSize: 8, fontFamily: "JetBrains Mono", color: "#C48830" }}>{(f.exposure * 100).toFixed(0)}% vs {(f.benchmark * 100).toFixed(0)}%</span>
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

function CheckoutModal({ cart, onClose, onExecute }) {
  const [step, setStep] = useState("review"); const total = cart.reduce((s, b) => s + b.price, 0);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(45,32,22,.4)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "calc(100% - 24px)", maxWidth: 360, maxHeight: "85vh", overflow: "auto", animation: "popIn .4s ease" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "18px 24px", borderBottom: "2px solid #F0E6D0", display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ fontSize: 12 }}>🧺</span><span style={{ fontSize: 10, fontWeight: 900, fontFamily: "Poppins" }}>{step === "review" ? "Checkout" : step === "executing" ? "Processing..." : "Done!"}</span></div><button onClick={onClose} style={{ background: "#fff", border: "none", width: 32, height: 32, borderRadius: 10, cursor: "pointer", fontSize: 11, color: "#A09080" }}>✕</button></div>
        <div style={{ padding: "18px 24px" }}>
          {step === "review" && <div>{cart.map((b, i) => <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: i < cart.length - 1 ? "1px solid #F0E6D0" : "none" }}><div style={{ display: "flex", gap: 6, alignItems: "center" }}><span style={{ fontSize: 11 }}>{b.emoji}</span><div><div style={{ fontWeight: 800, fontFamily: "Poppins" }}>{b.name}</div><div style={{ fontSize: 10, color: "#A09080" }}>{b.stocks.length} stocks</div></div></div><div style={{ fontFamily: "JetBrains Mono", fontWeight: 700 }}>{fmt(b.price)}</div></div>)}<div style={{ display: "flex", justifyContent: "space-between", paddingTop: 14, borderTop: "2px solid #F0E6D0", marginTop: 6 }}><span style={{ fontWeight: 800 }}>Total</span><span style={{ fontFamily: "Poppins", fontSize: 12, fontWeight: 900, color: "#C48830" }}>{fmt(total)}</span></div><button onClick={() => { setStep("executing"); setTimeout(() => setStep("done"), 2200); }} style={{ width: "100%", marginTop: 16, padding: 13, background: "linear-gradient(135deg,#C48830,#EF5350)", color: "#fff", border: "none", borderRadius: 16, fontSize: 11, fontWeight: 900, cursor: "pointer", fontFamily: "Poppins" }}>🛒 Execute</button></div>}
          {step === "executing" && <div style={{ textAlign: "center", padding: "40px 0" }}><div style={{ fontSize: 48, animation: "wiggle .5s ease infinite", marginBottom: 8 }}>🧺</div><div style={{ width: 40, height: 40, borderRadius: "50%", border: "4px solid #F0E6D0", borderTopColor: "#C48830", margin: "0 auto 18px", animation: "spin .8s linear infinite" }} /><div style={{ fontWeight: 800, fontFamily: "Poppins" }}>Filling your basket...</div></div>}
          {step === "done" && <div style={{ textAlign: "center", padding: "36px 0" }}><div style={{ fontSize: 52, animation: "popIn .5s ease" }}>🎉</div><div style={{ fontSize: 11, fontWeight: 900, fontFamily: "Poppins", margin: "10px 0" }}>Complete!</div><button onClick={() => { onExecute(); onClose(); }} style={{ marginTop: 14, padding: "10px 28px", background: "#C48830", color: "#fff", border: "none", borderRadius: 14, fontWeight: 800, cursor: "pointer" }}>Dashboard 🏠</button></div>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════ MAIN APP ═══════════════════════════

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedBasket, setSelectedBasket] = useState(null);
  const [activeScenario, setActiveScenario] = useState(null);
  const [flippedCards, setFlippedCards] = useState({});
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
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    setHeaderCollapsed(false);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [page]);

  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 2200); };
  const addToCart = (b) => { if (cart.find(c => c.id === b.id)) setCart(cart.filter(c => c.id !== b.id)); else { setCart([...cart, b]); notify(b.emoji + " " + b.name + " added to cart!"); } };
  const handleCreate = (data) => { const nb = { id: Date.now(), name: data.name, emoji: data.emoji, strategy: data.strategy, color: "terracotta", stocks: data.instruments.map(i => i.ticker), value: 0, change: 0, allocation: 0, desc: data.instruments.length + " instruments · " + data.strategy, costBasis: 0, dayPL: 0, totalPL: 0 }; setCustomBaskets([...customBaskets, nb]); notify(data.emoji + " " + data.name + " created!"); };

  const filteredExplorer = activeScenario ? explorerBaskets.filter(b => b.scenario === activeScenario) : explorerBaskets;
  const critCount = macroAlerts.filter(a => a.severity === "critical").length;
  const todayEvents = calendarEvents.filter(e => e.date === "2026-02-06").length;

  const navItems = [
    { id: "dashboard", label: "Home", emoji: "🏠" },
    { id: "risklab", label: "Risk Lab", emoji: "🧪" },
    { id: "explorer", label: "Market", emoji: "🛒" },
    { id: "news", label: "News", emoji: "📰" },
    { id: "account", label: "Account", emoji: "👤" },
  ];

  return (
    <div style={{ fontFamily: "'Quicksand',sans-serif", background: "#E8E4E0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 0" }}>
      <style>{STYLES}</style>

      {/* ═══ iPHONE FRAME ═══ */}
      <div style={{ width: 393, height: 852, background: "#FFFDF5", borderRadius: 48, border: "8px solid #1A1A1A", position: "relative", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,.25), 0 0 0 2px #333, inset 0 0 0 1px #444", display: "flex", flexDirection: "column" }}>

        {/* ── Dynamic Island ── */}
        <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", width: 126, height: 34, borderRadius: 14, background: "#1A1A1A", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#0D3B66", border: "1.5px solid #333" }} />
        </div>
        {/* Status bar text */}
        <div style={{ position: "absolute", top: 14, left: 28, fontSize: 12, fontWeight: 700, color: "#1A1A1A", fontFamily: "Poppins", zIndex: 250 }}>9:41</div>
        <div style={{ position: "absolute", top: 14, right: 24, display: "flex", gap: 5, alignItems: "center", zIndex: 250 }}>
          <svg width="16" height="12" viewBox="0 0 16 12"><rect x="0" y="6" width="3" height="6" rx="0.5" fill="#1A1A1A" opacity="0.4"/><rect x="4.5" y="3.5" width="3" height="8.5" rx="0.5" fill="#1A1A1A" opacity="0.6"/><rect x="9" y="1" width="3" height="11" rx="0.5" fill="#1A1A1A" opacity="0.8"/><rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="#1A1A1A"/></svg>
          <svg width="15" height="12" viewBox="0 0 15 12"><path d="M7.5 2.5C9.8 2.5 11.8 3.5 13.2 5L14.5 3.5C12.7 1.5 10.2 0.3 7.5 0.3S2.3 1.5 0.5 3.5L1.8 5C3.2 3.5 5.2 2.5 7.5 2.5z" fill="#1A1A1A" opacity="0.4"/><path d="M7.5 5.5c1.5 0 2.9.6 3.9 1.6L12.8 5.6c-1.4-1.3-3.2-2.1-5.3-2.1s-3.9.8-5.3 2.1L3.6 7.1c1-.9 2.4-1.6 3.9-1.6z" fill="#1A1A1A" opacity="0.7"/><circle cx="7.5" cy="10" r="2" fill="#1A1A1A"/></svg>
          <svg width="26" height="12" viewBox="0 0 26 12"><rect x="0" y="1" width="22" height="10" rx="3" stroke="#1A1A1A" strokeWidth="1.2" fill="none" opacity="0.5"/><rect x="2" y="3" width="16" height="6" rx="1.5" fill="#1A1A1A"/><rect x="23" y="4" width="2.5" height="4" rx="1" fill="#1A1A1A" opacity="0.4"/></svg>
        </div>

        {/* ── Top Header Bar (Dashboard only, collapses on scroll) ── */}
        <div style={{
          background: "#fff", borderBottom: "1.5px solid #F0E6D0", flexShrink: 0, zIndex: 200,
          paddingTop: 52,
          maxHeight: page === "dashboard" ? (headerCollapsed ? 52 : 110) : 52,
          overflow: "hidden",
          transition: "max-height .3s ease",
        }}>
          {page === "dashboard" && <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 18px 10px",
            opacity: headerCollapsed ? 0 : 1, transform: headerCollapsed ? "translateY(-10px)" : "translateY(0)",
            transition: "opacity .25s ease, transform .25s ease",
          }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => { setPage("dashboard"); setSelectedBasket(null); setPortfolioView(false); }}>
              <svg width="34" height="34" viewBox="0 0 64 64" style={{ animation: "basketBounce 2.5s ease-in-out infinite" }}>
                <defs>
                  <linearGradient id="bsk" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D4A76A"/><stop offset="100%" stopColor="#A67C52"/></linearGradient>
                  <linearGradient id="bskH" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C49A5C"/><stop offset="100%" stopColor="#8B6914"/></linearGradient>
                </defs>
                <path d="M16 26 Q32 4 48 26" fill="none" stroke="url(#bskH)" strokeWidth="3.5" strokeLinecap="round"/>
                <path d="M17.5 26 Q32 6 46.5 26" fill="none" stroke="#D4A76A" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                <path d="M10 28 L14 50 Q32 54 50 50 L54 28 Z" fill="url(#bsk)" stroke="#8B6914" strokeWidth="1"/>
                <rect x="8" y="26" width="48" height="4" rx="2" fill="#C49A5C" stroke="#8B6914" strokeWidth="0.8"/>
                <path d="M12 33 Q32 35 52 33" fill="none" stroke="#8B6914" strokeWidth="0.7" opacity="0.5"/>
                <path d="M13 38 Q32 40 51 38" fill="none" stroke="#8B6914" strokeWidth="0.7" opacity="0.5"/>
                <path d="M13.5 43 Q32 45 50.5 43" fill="none" stroke="#8B6914" strokeWidth="0.7" opacity="0.5"/>
                {[18,24,30,36,42].map(x => <line key={x} x1={x} y1="28" x2={x + (x < 32 ? 1.5 : -1.5)} y2="50" stroke="#8B6914" strokeWidth="0.6" opacity="0.4"/>)}
                <rect x="10" y="26.5" width="44" height="1.2" rx="0.6" fill="#E8C97A" opacity="0.6"/>
                <ellipse cx="24" cy="24" rx="7.5" ry="9.5" fill="#FFF8E1" stroke="#F0D9A0" strokeWidth="1" style={{ animation: "eggWobble 3.5s ease-in-out infinite" }}/>
                <ellipse cx="40" cy="24" rx="7" ry="9" fill="#FAFAFA" stroke="#E0E0E0" strokeWidth="1" style={{ animation: "eggWobble 3.5s ease-in-out .6s infinite" }}/>
                <ellipse cx="32" cy="21" rx="7.5" ry="9.5" fill="#FFF9C4" stroke="#FFE082" strokeWidth="1" style={{ animation: "eggWobble 3.5s ease-in-out 1.2s infinite" }}/>
                <ellipse cx="30" cy="18" rx="2.2" ry="3.5" fill="#fff" opacity="0.55"/>
                <ellipse cx="22" cy="21" rx="2" ry="3" fill="#fff" opacity="0.45"/>
                <ellipse cx="38" cy="21" rx="2" ry="3" fill="#fff" opacity="0.45"/>
              </svg>
              <div>
                <span style={{ fontWeight: 900, fontSize: 15, fontFamily: "Poppins", background: "linear-gradient(135deg,#C48830,#D4A03C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "block", lineHeight: 1.1 }}>EggBasket</span>
                <span style={{ fontSize: 7, fontWeight: 700, color: "#C8B898", letterSpacing: 1.5, textTransform: "uppercase" }}>Smart Trading</span>
              </div>
            </div>
            {/* Alert + Calendar */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button onClick={() => { setPage("alerts"); setSelectedBasket(null); }}
                style={{ position: "relative", width: 32, height: 32, borderRadius: "50%", border: page === "alerts" ? "2px solid #C48830" : "1.5px solid #F0E6D0", background: page === "alerts" ? "#FFF8EE" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
                🔔
                {critCount > 0 && <span style={{ position: "absolute", top: -2, right: -2, width: 14, height: 14, borderRadius: "50%", background: "#EF5350", color: "#fff", fontSize: 7, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #fff" }}>{critCount}</span>}
              </button>
              <button onClick={() => { setPage("calendar"); setSelectedBasket(null); }}
                style={{ position: "relative", width: 32, height: 32, borderRadius: "50%", border: page === "calendar" ? "2px solid #C48830" : "1.5px solid #F0E6D0", background: page === "calendar" ? "#FFF8EE" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
                📅
                {todayEvents > 0 && <span style={{ position: "absolute", top: -2, right: -2, width: 14, height: 14, borderRadius: "50%", background: "#FFA726", color: "#fff", fontSize: 7, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #fff" }}>{todayEvents}</span>}
              </button>
            </div>
          </div>}
        </div>

        {notification && <div style={{ position: "absolute", top: 58, left: "50%", transform: "translateX(-50%)", zIndex: 350, background: "#fff", color: "#C48830", padding: "7px 16px", borderRadius: 12, fontSize: 11, fontWeight: 800, animation: "popIn .3s ease", boxShadow: "0 6px 20px rgba(0,0,0,.1)", border: "1.5px solid #F0E6D0", whiteSpace: "nowrap" }}>🥚 {notification}</div>}

        {/* ── Scrollable Content ── */}
        <div ref={scrollRef} onScroll={(e) => {
          if (page === "dashboard") {
            const st = e.target.scrollTop;
            setHeaderCollapsed(st > 30);
          }
        }} style={{ flex: 1, overflow: "auto", overflowX: "hidden", padding: "10px 12px 10px" }}>
        {selectedBasket && <BasketDetail basket={selectedBasket} onBack={() => setSelectedBasket(null)} />}

        {/* ══ PORTFOLIO FULL VIEW ══ */}
        {portfolioView && !selectedBasket && (() => {
          const tv = myBaskets.reduce((s, b) => s + b.value, 0);
          const tc = myBaskets.reduce((s, b) => s + b.costBasis, 0);
          const tp = tv - tc;
          const dp = myBaskets.reduce((s, b) => s + b.dayPL, 0);
          const allStks = [];
          [...myBaskets, ...customBaskets].forEach(b => {
            const sts = basketStocks[b.id] || [];
            sts.forEach(st => allStks.push({ ...st, basket: b.name, basketEmoji: b.emoji, basketColor: b.color, basketId: b.id }));
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
                <button onClick={() => setPortfolioView(false)} style={{ width: 30, height: 30, borderRadius: 10, border: "1.5px solid #F0E6D0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#C48830" }}>←</button>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 900, fontFamily: "Poppins", color: "#5C4A1E" }}>📊 Portfolio Overview</div>
                  <div style={{ fontSize: 9, color: "#A09080" }}>{myBaskets.length} baskets · {allStks.length} holdings</div>
                </div>
              </div>

              {/* Portfolio Value Hero */}
              <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 16, padding: 14, marginBottom: 8 }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: "#A09080", textTransform: "uppercase", marginBottom: 2 }}>Total Portfolio Value</div>
                <div style={{ fontSize: 24, fontWeight: 900, fontFamily: "Poppins", color: "#5C4A1E", letterSpacing: "-1px" }}>{fmt(tv)}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 700, color: tp >= 0 ? "#5B8C5A" : "#EF5350" }}>{tp >= 0 ? "+" : ""}{fmtS(Math.round(tp))} total</span>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 700, color: dp >= 0 ? "#5B8C5A" : "#EF5350", background: dp >= 0 ? "#EDF5ED" : "#FFEBEE", padding: "2px 6px", borderRadius: 5 }}>{dp >= 0 ? "+" : ""}{fmtS(Math.round(dp))} today</span>
                </div>
              </div>

              {/* Basket Breakdown */}
              <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", marginBottom: 6 }}>🧺 Basket Breakdown</div>
                {myBaskets.map((b, i) => {
                  const c = CL[b.color] || CL.terracotta;
                  const pct = tv > 0 ? (b.value / tv * 100).toFixed(1) : 0;
                  return (
                    <div key={b.id} onClick={() => { setPortfolioView(false); if (basketStocks[b.id]) setSelectedBasket(b); }}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none", cursor: "pointer" }}>
                      <span style={{ fontSize: 16 }}>{b.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", color: "#5C4A1E" }}>{b.name}</div>
                        <div style={{ height: 4, background: "#F5F0E8", borderRadius: 2, marginTop: 3 }}>
                          <div style={{ height: "100%", width: pct + "%", background: c.a, borderRadius: 2 }} />
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 700 }}>{fmt(b.value)}</div>
                        <div style={{ fontSize: 8, color: "#A09080" }}>{pct}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* All Holdings (sparkline rows) */}
              <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ padding: "8px 12px", borderBottom: "1.5px solid #F0E6D0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", color: "#5C4A1E" }}>All Holdings</span>
                  <span style={{ fontSize: 8, color: "#A09080", fontWeight: 600 }}>{allStks.length} instruments</span>
                </div>
                {allStks.map((st, i) => {
                  const pl = (st.current - st.avgCost) * st.shares * ((st.dir || "long") === "short" ? -1 : 1);
                  const plPct = ((st.current - st.avgCost) / st.avgCost * 100) * ((st.dir || "long") === "short" ? -1 : 1);
                  const sparkData = genSparkline(st.avgCost, st.current, st.ticker);
                  const sparkColor = st.change >= 0 ? "#5B8C5A" : "#EF5350";
                  const c2 = CL[st.basketColor] || CL.terracotta;
                  return (
                    <div key={st.ticker + st.basket + i}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderBottom: i < allStks.length - 1 ? "1px solid #F0E6D0" : "none", transition: "background .15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#FFFDF5"} onMouseLeave={e => e.currentTarget.style.background = ""}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", color: "#5C4A1E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{st.name || st.ticker}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 1 }}>
                          <span style={{ fontSize: 7, fontFamily: "JetBrains Mono", color: "#A09080", fontWeight: 600 }}>{st.ticker}</span>
                          <span style={{ fontSize: 7, color: "#A09080" }}>·</span>
                          <span style={{ fontSize: 7, fontWeight: 700, color: c2.a, background: c2.l, padding: "0px 4px", borderRadius: 3 }}>{st.basketEmoji} {st.basket.split(" ")[0]}</span>
                        </div>
                      </div>
                      <div style={{ width: 54, flexShrink: 0 }}>
                        <SparkSVG data={sparkData} color={sparkColor} w={54} h={18} />
                      </div>
                      <div style={{ textAlign: "right", minWidth: 64, flexShrink: 0 }}>
                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 800, color: "#5C4A1E" }}>
                          ${st.current >= 1000 ? st.current.toLocaleString() : st.current.toFixed(2)}
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2, marginTop: 1 }}>
                          <span style={{ fontSize: 7, fontFamily: "JetBrains Mono", fontWeight: 700, color: pl >= 0 ? "#5B8C5A" : "#EF5350" }}>
                            {pl >= 0 ? "+" : ""}{Math.abs(pl) >= 1000 ? (pl / 1000).toFixed(1) + "k" : Math.round(pl)}
                          </span>
                          <span style={{ fontSize: 6, fontWeight: 800, padding: "1px 3px", borderRadius: 3, background: (plPct >= 0 ? "#5B8C5A" : "#EF5350") + "14", color: plPct >= 0 ? "#5B8C5A" : "#EF5350" }}>
                            {plPct >= 0 ? "+" : ""}{plPct.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Portfolio Risk Metrics */}
              <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", marginBottom: 7 }}>📊 Portfolio Risk Metrics</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 8 }}>
                  {[
                    { label: "Sharpe", val: portfolioRisk.sharpe.toFixed(2), good: portfolioRisk.sharpe > 1, icon: "📐" },
                    { label: "Beta", val: portfolioRisk.beta.toFixed(2), good: portfolioRisk.beta < 1.3, icon: "📊" },
                    { label: "Vol", val: portfolioRisk.volatility.toFixed(1) + "%", good: portfolioRisk.volatility < 20, icon: "〰️" },
                    { label: "Max DD", val: portfolioRisk.maxDrawdown.toFixed(1) + "%", good: portfolioRisk.maxDrawdown > -15, icon: "📉" },
                    { label: "VaR 95%", val: fmtS(portfolioRisk.var95), good: false, icon: "⚠️" },
                    { label: "Calmar", val: portfolioRisk.calmar.toFixed(2), good: portfolioRisk.calmar > 1, icon: "🎯" },
                  ].map((m, mi) => (
                    <div key={mi} style={{ background: m.good ? "#EDF5ED" : "#FFEBEE", borderRadius: 8, padding: "6px 6px", textAlign: "center" }}>
                      <div style={{ fontSize: 9, marginBottom: 1 }}>{m.icon}</div>
                      <div style={{ fontSize: 7, fontWeight: 700, color: "#A09080", textTransform: "uppercase" }}>{m.label}</div>
                      <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 800, color: m.good ? "#5B8C5A" : "#EF5350" }}>{m.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "6px 8px", background: portfolioRisk.sectorConcentration > 40 ? "#FFEBEE" : "#FFF8EE", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 8, fontWeight: 800, fontFamily: "Poppins" }}>⚠️ Concentration</div>
                    <div style={{ fontSize: 7, color: "#8A7040" }}>Top: {portfolioRisk.topHolding.ticker} ({portfolioRisk.topHolding.pct}%)</div>
                  </div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 700, color: "#EF5350" }}>{portfolioRisk.sectorConcentration}%</div>
                </div>
              </div>

              {/* Per-Basket Metrics */}
              <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", marginBottom: 7 }}>🧪 Per-Basket Metrics</div>
                <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #F0E6D0" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.4fr .7fr .7fr .7fr", padding: "6px 10px", background: "#FFFDF5", fontSize: 7, fontWeight: 800, color: "#A09080", textTransform: "uppercase", letterSpacing: .5, borderBottom: "1.5px solid #F0E6D0" }}>
                    <div>Basket</div><div>Sharpe</div><div>Beta</div><div>Alpha</div>
                  </div>
                  {myBaskets.map((b, mi) => { const brm = basketRiskMetrics[b.id]; if (!brm) return null; return (
                    <div key={b.id} style={{ display: "grid", gridTemplateColumns: "1.4fr .7fr .7fr .7fr", padding: "6px 10px", borderBottom: mi < myBaskets.length - 1 ? "1px solid #F0E6D0" : "none", fontSize: 10, alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}><span style={{ fontSize: 9 }}>{b.emoji}</span><span style={{ fontWeight: 700, fontFamily: "Poppins", fontSize: 8 }}>{b.name}</span></div>
                      <div style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 9, color: brm.sharpe > 1 ? "#C48830" : "#FFA726" }}>{brm.sharpe.toFixed(2)}</div>
                      <div style={{ fontFamily: "JetBrains Mono", fontWeight: 600, fontSize: 9, color: brm.beta < 1.3 ? "#5B8C5A" : "#EF5350" }}>{brm.beta.toFixed(2)}</div>
                      <div style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 9, color: brm.alpha > 0 ? "#5B8C5A" : "#EF5350" }}>{brm.alpha > 0 ? "+" : ""}{brm.alpha.toFixed(1)}%</div>
                    </div>); })}
                </div>
              </div>

              {/* Factor Exposures */}
              <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", marginBottom: 7 }}>📈 Factor Exposures</div>
                {factorExposures.map((f, fi) => {
                  const overweight = f.exposure > f.benchmark;
                  return (
                    <div key={fi} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0", borderTop: fi > 0 ? "1px solid #F0E6D020" : "none" }}>
                      <span style={{ fontSize: 8, fontWeight: 700, color: "#5C4A1E", width: 55 }}>{f.factor}</span>
                      <div style={{ flex: 1, position: "relative", height: 8, background: "#F5F0E8", borderRadius: 4 }}>
                        <div style={{ position: "absolute", left: (f.benchmark * 100) + "%", top: 0, bottom: 0, width: 1.5, background: "#A0908066", zIndex: 1 }} />
                        <div style={{ height: "100%", width: (f.exposure * 100) + "%", background: overweight ? "#C48830" : "#5B8C5A", borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 8, fontFamily: "JetBrains Mono", fontWeight: 800, color: overweight ? "#C48830" : "#5B8C5A", minWidth: 24, textAlign: "right" }}>{(f.exposure * 100).toFixed(0)}%</span>
                    </div>
                  );
                })}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: 7, color: "#A09080" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 8, height: 2, background: "#A0908066", borderRadius: 1 }} /><span>Benchmark</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 8, height: 4, background: "#C48830", borderRadius: 1 }} /><span>Overweight</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 8, height: 4, background: "#5B8C5A", borderRadius: 1 }} /><span>Underweight</span></div>
                </div>
              </div>

              {/* Basket Correlations */}
              <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", marginBottom: 7 }}>🔗 Basket Correlations</div>
                <div style={{ display: "grid", gridTemplateColumns: "80px repeat(" + myBaskets.length + ", 1fr)", gap: 4, fontSize: 9 }}>
                  <div />
                  {myBaskets.map(b => <div key={b.id} style={{ textAlign: "center", fontWeight: 800, padding: 4, fontSize: 8 }}>{b.emoji} {b.name.split(" ")[0]}</div>)}
                  {myBaskets.map((b, ri) => (
                    <React.Fragment key={b.id}>
                      <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 3, padding: "3px 0" }}><span>{b.emoji}</span><span style={{ fontSize: 8 }}>{b.name.split(" ")[0]}</span></div>
                      {basketCorrelations[ri] && basketCorrelations[ri].map((cv, ci) => {
                        const abs = Math.abs(cv);
                        const bg = ri === ci ? "#FFF5E6" : cv > 0.5 ? "rgba(232,116,97," + (abs * 0.4) + ")" : cv < -0.05 ? "rgba(91,155,213," + (abs * 0.6) + ")" : "rgba(107,155,110," + (abs * 0.3) + ")";
                        return <div key={ci} style={{ textAlign: "center", padding: "8px 2px", borderRadius: 6, background: bg, fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 10, color: ri === ci ? "#A09080" : "#5C4A1E" }}>{cv.toFixed(2)}</div>;
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
          <div onClick={() => setPage("macro")} style={{ background: currentRegime.bg, border: `1.5px solid ${currentRegime.color}33`, borderRadius: 12, padding: "8px 10px", marginBottom: 8, cursor: "pointer", transition: "all .3s", animation: "fadeUp .3s ease both" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = currentRegime.color} onMouseLeave={e => e.currentTarget.style.borderColor = currentRegime.color + "33"}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11 }}>{currentRegime.emoji}</span>
                <div>
                  <div style={{ fontSize: 8, fontWeight: 800, color: "#A09080", textTransform: "uppercase", letterSpacing: .8 }}>Macro Regime</div>
                  <div style={{ fontSize: 11, fontWeight: 900, fontFamily: "Poppins", color: currentRegime.color }}>{currentRegime.name} <span style={{ fontFamily: "JetBrains Mono", fontSize: 9, fontWeight: 700, opacity: .7 }}>{currentRegime.confidence}%</span></div>
                </div>
              </div>
              <span style={{ fontSize: 9, color: currentRegime.color, fontWeight: 800 }}>Details →</span>
            </div>
          </div>

          {/* ── Portfolio Hero ── */}
          <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 18, padding: "18px 16px 14px", marginBottom: 7, animation: "fadeUp .4s ease .05s both", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 8, right: 50, fontSize: 11, opacity: 0.12, animation: "float 4s ease-in-out infinite" }}>🥚</div>
            <div style={{ position: "absolute", top: 30, right: 16, fontSize: 12, opacity: 0.08, animation: "float 3.5s ease-in-out .5s infinite" }}>🥚</div>
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
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#8B6914", marginBottom: 3 }}>
                    {chartHover ? <span style={{ transition: "all .15s" }}>📍 {displayLabel}</span> : "☀️ Good morning, John"}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 900, fontFamily: "Poppins", letterSpacing: "-1px", lineHeight: 1.1, color: "#5C4A1E", transition: "all .15s" }}>
                    ${displayVal >= 1000 ? displayVal.toLocaleString() : displayVal}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 700, color: changeColor, transition: "all .15s" }}>{isPositive ? "+" : ""}{fmt(Math.abs(changeDollar))}</span>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 700, color: changeColor, background: isPositive ? "#EDF5ED" : "#FFEBEE", padding: "2px 8px", borderRadius: 8, transition: "all .15s" }}>{isPositive ? "+" : ""}{changePct.toFixed(2)}%</span>
                    <span style={{ fontSize: 10, color: "#8A7A68", fontWeight: 600 }}>{chartHover ? "from Jan" : "Today"}</span>
                  </div>
                </>);
              })()}
            </div>
            <div style={{ margin: "18px 0 10px" }}>
              <MiniChart data={portfolioHistory} color="#C48830" chartId="main" onHover={setChartHover} />
            </div>
            <div style={{ display: "flex", gap: 1, background: "#FFFDF5", borderRadius: 8, padding: 2, width: "fit-content" }}>
              {["1D","1W","1M","3M","1Y","ALL"].map(t => <button key={t} style={{ padding: "3px 8px", borderRadius: 6, border: "none", background: t === "1Y" ? "#fff" : "transparent", color: t === "1Y" ? "#C48830" : "#A09080", fontSize: 9, fontWeight: 800, cursor: "pointer", fontFamily: "Quicksand", boxShadow: t === "1Y" ? "0 1px 4px rgba(0,0,0,.06)" : "none" }}>{t}</button>)}
            </div>
          </div>

          {/* ── Alerts (auto-rotating) ── */}
          <div style={{ marginBottom: 8 }}>
            <AlertsWidget alerts={macroAlerts} onViewAll={() => setPage("alerts")} />
          </div>

          {/* ── Trade Signals ── */}
          <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 18, padding: "8px 12px", marginBottom: 8, animation: "fadeUp .4s ease .15s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11 }}>⚡</span>
                <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "Poppins" }}>Trade Signals</span>
                <span style={{ fontSize: 10, fontWeight: 800, background: "#FFF8EE", color: "#C48830", padding: "2px 8px", borderRadius: 10 }}>{tradeSignals.filter(s => s.status === "pending").length} pending</span>
              </div>
              <button onClick={() => setPage("risklab")} style={{ background: "none", border: "none", color: "#C48830", fontWeight: 800, fontSize: 11, cursor: "pointer" }}>View All →</button>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {tradeSignals.slice(0, 4).map(s => {
                const sigCol = { BUY: "#C48830", SELL: "#EF5350", HOLD: "#FFA726", TRIM: "#FFA726" };
                const sigBg = { BUY: "#FFF8EE", SELL: "#FFEBEE", HOLD: "#FFF3E0", TRIM: "#FFF3E0" };
                return (
                  <div key={s.id} style={{ flex: "1 1 calc(50% - 4px)", minWidth: 0, background: "#FFFDF5", border: "1px solid #F0E6D0", borderRadius: 10, padding: "7px 10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <span style={{ fontSize: 8, fontWeight: 900, padding: "1px 5px", borderRadius: 4, background: sigBg[s.signal], color: sigCol[s.signal] }}>{s.signal}</span>
                      <span style={{ fontSize: 8, color: "#A09080" }}>{s.time}</span>
                    </div>
                    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                      <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 800 }}>{s.ticker}</span>
                    </div>
                    <div style={{ fontSize: 8, color: "#8A7040", lineHeight: 1.3, marginTop: 2 }}>{s.reason.slice(0, 50)}...</div>
                    <div style={{ marginTop: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ height: 3, flex: 1, background: "#FFF5E6", borderRadius: 2, marginRight: 6 }}>
                        <div style={{ height: "100%", width: s.strength + "%", background: sigCol[s.signal], borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 8, fontFamily: "JetBrains Mono", fontWeight: 700, color: sigCol[s.signal] }}>{s.strength}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── My Baskets (container box) ── */}
          <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: "8px 12px", marginBottom: 8, animation: "fadeUp .5s ease .3s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 900, fontFamily: "Poppins" }}>🧺 My Baskets</div>
                <button onClick={() => setShowCreate(true)} style={{ background: "#C48830", color: "#fff", border: "none", padding: "4px 8px", borderRadius: 8, fontSize: 9, fontWeight: 800, cursor: "pointer" }}>+ New</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span onClick={() => setBasketView("baskets")} style={{ fontSize: 15, cursor: "pointer", color: basketView === "baskets" ? "#C48830" : "#D0C8B8", transition: "color .2s" }}>⊞</span>
                <span onClick={() => setBasketView("stocks")} style={{ fontSize: 15, cursor: "pointer", color: basketView === "stocks" ? "#C48830" : "#D0C8B8", transition: "color .2s" }}>☰</span>
                <span onClick={() => setPortfolioView(true)} style={{ fontSize: 10, fontWeight: 800, color: "#C48830", cursor: "pointer", fontFamily: "Quicksand" }}>View →</span>
              </div>
            </div>

            {/* Create CTA */}
            <div onClick={() => setShowCreate(true)} style={{ background: "linear-gradient(135deg,#fff,#FFF8EE)", border: "2px dashed #FFA726", borderRadius: 18, padding: "18px 20px", marginBottom: 7, cursor: "pointer", transition: "all .3s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#C48830"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#FFA726"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>✨</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 900, fontFamily: "Poppins" }}>Create Your Own Basket</div><div style={{ fontSize: 11, color: "#8A7040", marginTop: 1 }}>Mix stocks, options, futures & crypto</div></div>
                <div style={{ display: "flex", gap: 4 }}>{["📈","📊","⏳","₿"].map(t => <span key={t} style={{ fontSize: 11, background: "#fff", width: 28, height: 28, borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{t}</span>)}</div>
              </div>
            </div>

            {/* ── Baskets View (rich cards, clickable) ── */}
            {basketView === "baskets" && <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6 }}>
              {[...myBaskets, ...customBaskets].map((b, i) => { const c = CL[b.color] || CL.terracotta; const health = getBasketHealth(b); const isBad = health.status === "critical" || health.status === "warning"; return (
                <div key={b.id} onClick={() => { if (basketStocks[b.id]) setSelectedBasket(b); }} style={{ background: "#FFFDF5", border: `2px solid ${isBad ? health.clr + "44" : "#F0E6D0"}`, borderRadius: 18, cursor: "pointer", transition: "all .3s", overflow: "hidden" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = c.a; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = isBad ? health.clr + "44" : "#F0E6D0"; e.currentTarget.style.transform = ""; }}>
                  <div style={{ background: c.l, padding: "10px 16px 8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ fontSize: 12 }}>{b.emoji}</span><div><div style={{ fontSize: 11, fontWeight: 800, fontFamily: "Poppins" }}>{b.name}</div><div style={{ fontSize: 9, color: c.a, fontWeight: 700, textTransform: "uppercase" }}>{b.strategy}</div></div></div>
                      <div style={{ textAlign: "right" }}><div style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 700 }}>{b.value > 0 ? fmt(b.value) : "—"}</div>{b.change !== 0 && <div style={{ fontSize: 10, fontWeight: 700, color: b.change >= 0 ? "#5B8C5A" : "#EF5350" }}>{b.change >= 0 ? "+" : ""}{b.change}%</div>}</div>
                    </div>
                  </div>
                  <div style={{ padding: "8px 16px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, padding: "5px 8px", background: health.bg, borderRadius: 8, border: isBad ? `1px solid ${health.clr}33` : "1px solid transparent" }}>
                      {isBad ? <span style={{ width: 18, height: 18, borderRadius: "50%", background: health.clr, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 900, flexShrink: 0, animation: health.status === "critical" ? "pulse 2s ease infinite" : "none" }}>!</span> : <span style={{ fontSize: 10, flexShrink: 0 }}>{health.icon}</span>}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: health.clr, fontFamily: "Poppins" }}>{health.label}</div>
                        <div style={{ fontSize: 8, color: "#8A7040", lineHeight: 1.3, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{health.tip}</div>
                      </div>
                    </div>
                    {b.totalPL !== 0 && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 10, color: "#A09080", fontWeight: 700 }}>P&L</span><span style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 700, color: b.totalPL >= 0 ? "#5B8C5A" : "#EF5350" }}>{fmtS(b.totalPL)}</span></div>}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>{b.stocks.slice(0, 5).map(s => <span key={s} style={{ fontSize: 9, fontFamily: "JetBrains Mono", fontWeight: 600, background: c.l, color: c.a, padding: "2px 6px", borderRadius: 6 }}>{s}</span>)}{b.stocks.length > 5 && <span style={{ fontSize: 9, color: "#A09080" }}>+{b.stocks.length - 5}</span>}</div>
                  </div>
                </div>); })}
            </div>}

            {/* ── Stocks List View (sparkline rows) ── */}
            {basketView === "stocks" && <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #F0E6D0", background: "#fff" }}>
              <div style={{ padding: "8px 12px", borderBottom: "1.5px solid #F0E6D0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", color: "#5C4A1E" }}>All Holdings</span>
                <span style={{ fontSize: 8, color: "#A09080", fontWeight: 600 }}>sorted by P&L</span>
              </div>
              {(() => {
                const allStks = [];
                [...myBaskets, ...customBaskets].forEach(b => {
                  const sts = basketStocks[b.id] || [];
                  sts.forEach(st => allStks.push({ ...st, basket: b.name, basketEmoji: b.emoji, basketColor: b.color, basketId: b.id }));
                });
                allStks.sort((a, bb) => {
                  const plA = (a.current - a.avgCost) * a.shares * ((a.dir || "long") === "short" ? -1 : 1);
                  const plB = (bb.current - bb.avgCost) * bb.shares * ((bb.dir || "long") === "short" ? -1 : 1);
                  return plB - plA;
                });
                return allStks.map((st, i) => {
                  const pl = (st.current - st.avgCost) * st.shares * ((st.dir || "long") === "short" ? -1 : 1);
                  const plPct = ((st.current - st.avgCost) / st.avgCost * 100) * ((st.dir || "long") === "short" ? -1 : 1);
                  const sparkData = genSparkline(st.avgCost, st.current, st.ticker);
                  const sparkColor = st.change >= 0 ? "#5B8C5A" : "#EF5350";
                  const c2 = CL[st.basketColor] || CL.terracotta;
                  return (
                    <div key={st.ticker + st.basket + i} onClick={() => { const b = [...myBaskets, ...customBaskets].find(b2 => b2.id === st.basketId); if (b && basketStocks[b.id]) setSelectedBasket(b); }}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderBottom: i < allStks.length - 1 ? "1px solid #F0E6D0" : "none", cursor: "pointer", transition: "background .15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#FFFDF5"} onMouseLeave={e => e.currentTarget.style.background = ""}>
                      {/* Left: name + ticker + basket */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", color: "#5C4A1E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{st.name || st.ticker}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 1 }}>
                          <span style={{ fontSize: 7, fontFamily: "JetBrains Mono", color: "#A09080", fontWeight: 600 }}>{st.ticker.length > 10 ? st.ticker.slice(0, 10) + ".." : st.ticker}</span>
                          <span style={{ fontSize: 7, color: "#A09080" }}>·</span>
                          <span style={{ fontSize: 7, fontWeight: 700, color: c2.a, background: c2.l, padding: "0px 4px", borderRadius: 3 }}>{st.basketEmoji} {st.basket.split(" ")[0]}</span>
                        </div>
                      </div>
                      {/* Center: sparkline */}
                      <div style={{ width: 54, flexShrink: 0 }}>
                        <SparkSVG data={sparkData} color={sparkColor} w={54} h={18} />
                      </div>
                      {/* Right: price + P&L */}
                      <div style={{ textAlign: "right", minWidth: 64, flexShrink: 0 }}>
                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 800, color: "#5C4A1E" }}>
                          ${st.current >= 1000 ? st.current.toLocaleString() : st.current.toFixed(2)}
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2, marginTop: 1 }}>
                          <span style={{ fontSize: 7, fontFamily: "JetBrains Mono", fontWeight: 700, color: pl >= 0 ? "#5B8C5A" : "#EF5350" }}>
                            {pl >= 0 ? "+" : ""}{Math.abs(pl) >= 1000 ? (pl / 1000).toFixed(1) + "k" : Math.round(pl)}
                          </span>
                          <span style={{ fontSize: 6, fontWeight: 800, padding: "1px 3px", borderRadius: 3, background: (plPct >= 0 ? "#5B8C5A" : "#EF5350") + "14", color: plPct >= 0 ? "#5B8C5A" : "#EF5350" }}>
                            {plPct >= 0 ? "+" : ""}{plPct.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <span style={{ fontSize: 9, color: "#D0C8B8" }}>›</span>
                    </div>
                  );
                });
              })()}
            </div>}
          </div>

          {/* ── Realized P&L (closed trades only) ── */}
          <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 14, padding: 12, animation: "fadeUp .5s ease .5s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
              <div style={{ fontSize: 11, fontWeight: 800, fontFamily: "Poppins" }}>💰 Realized P&L</div>
              <span style={{ fontSize: 8, color: "#A09080", fontWeight: 600 }}>Closed trades only</span>
            </div>
            {(() => {
              const totalRealized = realizedTrades.reduce((s, t) => s + t.pl, 0);
              const wins = realizedTrades.filter(t => t.pl > 0);
              const losses = realizedTrades.filter(t => t.pl < 0);
              return <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
                  <div style={{ background: totalRealized >= 0 ? "#EDF5ED" : "#FFEBEE", borderRadius: 10, padding: "8px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 7, color: "#A09080", fontWeight: 700, textTransform: "uppercase" }}>Net Realized</div>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 800, color: totalRealized >= 0 ? "#5B8C5A" : "#EF5350" }}>{fmtS(Math.round(totalRealized))}</div>
                  </div>
                  <div style={{ background: "#EDF5ED", borderRadius: 10, padding: "8px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 7, color: "#A09080", fontWeight: 700, textTransform: "uppercase" }}>Wins ({wins.length})</div>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 800, color: "#5B8C5A" }}>{fmtS(Math.round(wins.reduce((s, t) => s + t.pl, 0)))}</div>
                  </div>
                  <div style={{ background: "#FFEBEE", borderRadius: 10, padding: "8px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 7, color: "#A09080", fontWeight: 700, textTransform: "uppercase" }}>Losses ({losses.length})</div>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 800, color: "#EF5350" }}>{fmtS(Math.round(losses.reduce((s, t) => s + t.pl, 0)))}</div>
                  </div>
                </div>
                {realizedTrades.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderTop: i > 0 ? "1px solid #F0E6D0" : "none" }}>
                    <span style={{ fontSize: 14 }}>{t.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", color: "#5C4A1E" }}>{t.ticker} <span style={{ fontWeight: 600, color: "#A09080" }}>· {t.shares} shares</span></div>
                      <div style={{ fontSize: 8, color: "#A09080" }}>${t.buyPrice.toFixed(2)} → ${t.sellPrice.toFixed(2)} · {t.date}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 800, color: t.pl >= 0 ? "#5B8C5A" : "#EF5350" }}>{t.pl >= 0 ? "+" : ""}{fmtS(Math.round(t.pl))}</div>
                      <div style={{ fontSize: 7, fontWeight: 700, color: t.pl >= 0 ? "#5B8C5A" : "#EF5350" }}>{t.pl >= 0 ? "+" : ""}{(((t.sellPrice - t.buyPrice) / t.buyPrice) * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
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
            const tickerIcons = { XOM:"⛽", CVX:"⛽", GLD:"🥇", "BRK.B":"🏛️", COST:"🏪", AAPL:"🍎", MSFT:"🪟", GOOGL:"🔍", AMZN:"📦", NVDA:"🎮", AMD:"💎", AVGO:"📡", TSLA:"⚡", COIN:"🪙", LMT:"✈️", RTX:"🚀", GD:"🛡️", NOC:"🛩️", O:"🏠", AMT:"📡", XLU:"💡", TLT:"📜", PLD:"🏗️", JNJ:"💊", PG:"🧴", WMT:"🛒", KO:"🥤", MCD:"🍔", PEP:"🥤", MMM:"🔧", ENPH:"☀️", SEDG:"☀️", FSLR:"🌞", RUN:"🏃", PLUG:"🔌", PLTR:"👁️", PATH:"🤖", ISRG:"🏥", TQQQ:"📈", SPXL:"📊", ARKK:"🚀", UNH:"🏥", LLY:"💉", ABBV:"💊", MRK:"🧬", TMO:"🔬" };
            return (
              <div style={{ position: "fixed", inset: 0, background: "rgba(45,32,22,.5)", backdropFilter: "blur(14px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1000 }} onClick={() => setSelectedShopBasket(null)}>
                <div style={{ background: "#FFFDF8", borderRadius: "22px 22px 0 0", width: "100%", maxWidth: 393, maxHeight: "88vh", overflow: "auto", animation: "fadeUp .35s ease both" }} onClick={e => e.stopPropagation()}>
                  <div style={{ background: `linear-gradient(135deg, ${clr.a}12, ${clr.a}06)`, padding: "18px 16px 14px", textAlign: "center", position: "relative" }}>
                    <button onClick={() => setSelectedShopBasket(null)} style={{ position: "absolute", top: 12, right: 14, width: 28, height: 28, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.8)", cursor: "pointer", fontSize: 12, color: "#A09080" }}>✕</button>
                    <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 6px" }}>
                      <div style={{ fontSize: 46, lineHeight: 1 }}>🧺</div>
                      {b.stocks.slice(0, 4).map((t, i) => {
                        const positions = [{ top: -6, left: -8 }, { top: -8, right: -8 }, { top: 22, left: -14 }, { top: 20, right: -14 }];
                        return <span key={t} style={{ position: "absolute", ...positions[i], fontSize: 15, animation: `float ${3 + i * .5}s ease-in-out ${i * .2}s infinite` }}>{tickerIcons[t] || "📈"}</span>;
                      })}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 900, fontFamily: "Poppins", color: "#5C4A1E" }}>{b.emoji} {b.name}</div>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 4 }}>
                      <span style={{ fontSize: 8, fontWeight: 800, padding: "2px 7px", borderRadius: 5, background: clr.a + "18", color: clr.a }}>{b.strategy}</span>
                    </div>
                    <p style={{ fontSize: 8, color: "#8A7040", lineHeight: 1.4, marginTop: 6, maxWidth: 280, margin: "6px auto 0" }}>{b.desc}</p>
                  </div>
                  <div style={{ padding: "0 12px 12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 58px 40px 52px", padding: "8px 4px 5px", fontSize: 7, fontWeight: 800, color: "#A09080", textTransform: "uppercase", letterSpacing: .5, borderBottom: "1.5px solid #F0E6D0" }}>
                      <div style={{ width: 24 }}></div><div>Item</div><div style={{ textAlign: "right" }}>Price</div><div style={{ textAlign: "center" }}>Qty</div><div></div>
                    </div>
                    {b.stocks.map((ticker, ti) => {
                      const price = explorerStockPrices[ticker] || 0;
                      const shares = getShares(ticker);
                      return (
                        <div key={ticker} style={{ display: "grid", gridTemplateColumns: "auto 1fr 58px 40px 52px", padding: "7px 4px", alignItems: "center", borderBottom: "1px solid #FFF5E6" }}>
                          <div style={{ width: 24, fontSize: 13, textAlign: "center" }}>{tickerIcons[ticker] || "📈"}</div>
                          <div style={{ fontFamily: "JetBrains Mono", fontWeight: 800, fontSize: 10 }}>{ticker}</div>
                          <div style={{ textAlign: "right", fontFamily: "JetBrains Mono", fontSize: 9, color: "#6B5A2E" }}>${price >= 1000 ? (price / 1000).toFixed(1) + "k" : price.toFixed(0)}</div>
                          <div style={{ textAlign: "center", fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 800 }}>{shares}</div>
                          <div style={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                            <button onClick={() => setShareCount(ticker, -1)} style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid #F0E6D0", background: "#fff", cursor: "pointer", fontSize: 10, color: "#EF5350", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                            <button onClick={() => setShareCount(ticker, 1)} style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid " + clr.a + "44", background: clr.a + "08", cursor: "pointer", fontSize: 10, color: clr.a, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 4px 4px", borderTop: "2px solid #F0E6D0", marginTop: 4 }}>
                      <div>
                        <div style={{ fontSize: 7, color: "#A09080", textTransform: "uppercase", fontWeight: 700 }}>Basket Total</div>
                        <div style={{ fontFamily: "Poppins", fontSize: 15, fontWeight: 900, color: "#5C4A1E" }}>${totalCost >= 1000 ? (totalCost / 1000).toFixed(1) + "k" : totalCost.toFixed(0)}</div>
                      </div>
                      <button onClick={() => addToCart(b)} style={{ background: inCart ? "#5B8C5A" : "linear-gradient(135deg,#C48830,#D4A03C)", color: "#fff", border: "none", borderRadius: 12, padding: "9px 18px", fontSize: 10, fontWeight: 900, cursor: "pointer", fontFamily: "Poppins" }}>{inCart ? "✓ In Basket" : "🧺 Add to Basket"}</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── Market Header + Cart ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <h1 style={{ fontSize: 12, fontWeight: 900, fontFamily: "Poppins", color: "#5C4A1E" }}>🛒 Market</h1>
              <p style={{ color: "#A09080", fontSize: 8, marginTop: 1 }}>Search stocks or browse baskets</p>
            </div>
            <button onClick={() => setShowCheckout(true)} style={{ position: "relative", display: "flex", alignItems: "center", gap: 3, padding: "5px 10px", borderRadius: 10, background: cart.length > 0 ? "linear-gradient(135deg,#C48830,#D4A03C)" : "#fff", color: cart.length > 0 ? "#fff" : "#A09080", border: cart.length > 0 ? "none" : "1.5px solid #F0E6D0", cursor: "pointer", fontSize: 10, fontWeight: 800 }}>
              🛒 {cart.length > 0 ? cart.length : ""}
              {cart.length > 0 && <span style={{ position: "absolute", top: -4, right: -4, width: 14, height: 14, borderRadius: "50%", background: "#FF7043", color: "#fff", fontSize: 7, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #fff" }}>{cart.length}</span>}
            </button>
          </div>

          {/* ── Stock Search Bar ── */}
          <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 12, padding: "8px 12px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, color: "#A09080" }}>🔍</span>
              <input
                type="text"
                placeholder="Search stocks by ticker or name..."
                value={stockSearch}
                onChange={e => setStockSearch(e.target.value)}
                style={{ flex: 1, border: "none", outline: "none", fontSize: 10, fontFamily: "Quicksand", fontWeight: 600, color: "#5C4A1E", background: "transparent" }}
              />
              {stockSearch && <button onClick={() => setStockSearch("")} style={{ border: "none", background: "#F0E6D0", borderRadius: "50%", width: 18, height: 18, cursor: "pointer", fontSize: 9, color: "#A09080", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>}
            </div>
          </div>

          {/* ── Stock Search Results ── */}
          {stockSearch.length >= 1 && (() => {
            const q = stockSearch.toUpperCase();
            const stockNames = { XOM:"Exxon Mobil", CVX:"Chevron", GLD:"SPDR Gold", "BRK.B":"Berkshire Hathaway", COST:"Costco", AAPL:"Apple", MSFT:"Microsoft", GOOGL:"Alphabet", AMZN:"Amazon", NVDA:"NVIDIA", AMD:"AMD", AVGO:"Broadcom", TSLA:"Tesla", COIN:"Coinbase", LMT:"Lockheed Martin", RTX:"RTX Corp", GD:"General Dynamics", NOC:"Northrop Grumman", O:"Realty Income", AMT:"American Tower", XLU:"Utilities ETF", TLT:"20+ Yr Treasury", PLD:"Prologis", JNJ:"Johnson & Johnson", PG:"Procter & Gamble", WMT:"Walmart", KO:"Coca-Cola", MCD:"McDonald's", PEP:"PepsiCo", MMM:"3M", ENPH:"Enphase Energy", SEDG:"SolarEdge", FSLR:"First Solar", RUN:"Sunrun", PLUG:"Plug Power", PLTR:"Palantir", PATH:"UiPath", ISRG:"Intuitive Surgical", TQQQ:"ProShares 3x QQQ", SPXL:"Direxion 3x SPX", ARKK:"ARK Innovation", UNH:"UnitedHealth", LLY:"Eli Lilly", ABBV:"AbbVie", MRK:"Merck", TMO:"Thermo Fisher" };
            const tickerIcons = { XOM:"⛽", CVX:"⛽", GLD:"🥇", "BRK.B":"🏛️", COST:"🏪", AAPL:"🍎", MSFT:"🪟", GOOGL:"🔍", AMZN:"📦", NVDA:"🎮", AMD:"💎", AVGO:"📡", TSLA:"⚡", COIN:"🪙", LMT:"✈️", RTX:"🚀", GD:"🛡️", NOC:"🛩️", O:"🏠", AMT:"📡", XLU:"💡", TLT:"📜", PLD:"🏗️", JNJ:"💊", PG:"🧴", WMT:"🛒", KO:"🥤", MCD:"🍔", PEP:"🥤", MMM:"🔧", ENPH:"☀️", SEDG:"☀️", FSLR:"🌞", RUN:"🏃", PLUG:"🔌", PLTR:"👁️", PATH:"🤖", ISRG:"🏥", TQQQ:"📈", SPXL:"📊", ARKK:"🚀", UNH:"🏥", LLY:"💉", ABBV:"💊", MRK:"🧬", TMO:"🔬" };
            const allStocks = Object.entries(explorerStockPrices).filter(([ticker, price]) => {
              const name = (stockNames[ticker] || "").toUpperCase();
              return ticker.toUpperCase().includes(q) || name.includes(q);
            }).slice(0, 8);
            if (allStocks.length === 0) return (
              <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 12, padding: "16px", marginBottom: 10, textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>🔍</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#A09080" }}>No stocks found for "{stockSearch}"</div>
              </div>
            );
            return (
              <div style={{ background: "#fff", border: "1.5px solid #F0E6D0", borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
                <div style={{ padding: "6px 12px", background: "#FFFDF5", borderBottom: "1px solid #F0E6D0" }}>
                  <span style={{ fontSize: 8, fontWeight: 800, color: "#A09080", textTransform: "uppercase" }}>Individual Stocks</span>
                </div>
                {allStocks.map(([ticker, price], i) => (
                  <div key={ticker} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: i < allStocks.length - 1 ? "1px solid #FFF5E6" : "none" }}>
                    <span style={{ fontSize: 16 }}>{tickerIcons[ticker] || "📈"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 800, color: "#5C4A1E" }}>{ticker}</div>
                      <div style={{ fontSize: 8, color: "#A09080", fontWeight: 600 }}>{stockNames[ticker] || ticker}</div>
                    </div>
                    <div style={{ textAlign: "right", marginRight: 6 }}>
                      <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 700, color: "#5C4A1E" }}>${price >= 1000 ? (price / 1000).toFixed(2) + "k" : price.toFixed(2)}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); notify("🛒 " + ticker + " added!"); }} style={{ background: "linear-gradient(135deg,#C48830,#D4A03C)", color: "#fff", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 8, fontWeight: 800, cursor: "pointer" }}>Buy</button>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* ── Baskets Section Label ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Poppins", color: "#5C4A1E" }}>🧺 Baskets</div>
            <div style={{ flex: 1, height: 1, background: "#F0E6D0" }} />
            <div style={{ display: "flex", gap: 3 }}>
              <button onClick={() => setActiveScenario(null)} style={{ padding: "3px 8px", borderRadius: 6, border: "1px solid " + (!activeScenario ? "#C48830" : "#F0E6D0"), background: !activeScenario ? "#FFF8EE" : "#fff", color: !activeScenario ? "#C48830" : "#A09080", fontSize: 7, fontWeight: 800, cursor: "pointer" }}>All</button>
              {macroScenarios.slice(0, 4).map(s => (
                <button key={s.id} onClick={() => setActiveScenario(activeScenario === s.id ? null : s.id)} style={{ padding: "3px 8px", borderRadius: 6, border: "1px solid " + (activeScenario === s.id ? "#C48830" : "#F0E6D0"), background: activeScenario === s.id ? "#FFF8EE" : "#fff", color: activeScenario === s.id ? "#C48830" : "#A09080", fontSize: 7, fontWeight: 800, cursor: "pointer" }}>{s.name}</button>
              ))}
            </div>
          </div>

          {/* ── 2-Column Flippable Card Grid ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {filteredExplorer.map((b, i) => {
              const clr = CL[b.color] || CL.terracotta;
              const inCart = !!cart.find(cc => cc.id === b.id);
              const relevance = getRegimeRelevance(b, currentRegime);
              const rm = explorerRiskMetrics[b.id];
              const isFlipped = !!flippedCards[b.id];
              const basketYoY = b.stocks.reduce((sum, t) => sum + (stockYoYReturns[t] || 0), 0) / b.stocks.length;
              const retColor = basketYoY >= 0 ? "#5B8C5A" : "#EF5350";
              return (
                <div key={b.id} style={{ perspective: 800, animation: "fadeUp .3s ease " + (i * .03) + "s both" }}>
                  <div style={{
                    position: "relative", width: "100%", transition: "transform .5s ease",
                    transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0)",
                  }}>

                    {/* ═══ FRONT ═══ */}
                    <div style={{
                      position: isFlipped ? "absolute" : "relative", inset: 0, backfaceVisibility: "hidden",
                      background: "#fff", border: "2px solid " + (inCart ? "#5B8C5A" : clr.a + "44"),
                      borderRadius: 14, padding: "10px 10px 8px", cursor: "pointer",
                      display: "flex", flexDirection: "column",
                    }}
                      onMouseEnter={e => { if (!isFlipped) { e.currentTarget.style.borderColor = inCart ? "#5B8C5A" : clr.a; e.currentTarget.style.boxShadow = "0 6px 18px " + clr.a + "18"; }}}
                      onMouseLeave={e => { if (!isFlipped) { e.currentTarget.style.borderColor = inCart ? "#5B8C5A" : clr.a + "44"; e.currentTarget.style.boxShadow = ""; }}}>

                      {/* Top row: YoY return badge + flip icon */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <div style={{ fontSize: 10, fontWeight: 900, fontFamily: "JetBrains Mono", color: retColor, background: retColor + "12", padding: "2px 6px", borderRadius: 5 }}>
                          {basketYoY >= 0 ? "+" : ""}{basketYoY.toFixed(1)}% <span style={{ fontSize: 6, fontWeight: 700, opacity: .7 }}>YoY</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setFlippedCards(f => ({ ...f, [b.id]: !f[b.id] })); }}
                          style={{ width: 22, height: 22, borderRadius: 6, border: "1.5px solid #F0E6D0", background: "#FFFDF5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#A09080" }}
                          title="View metrics">📊</button>
                      </div>

                      {/* Badges */}
                      {inCart && <div style={{ position: "absolute", top: 34, right: 8, width: 16, height: 16, borderRadius: "50%", background: "#5B8C5A", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}><span style={{ color: "#fff", fontSize: 8, fontWeight: 900 }}>✓</span></div>}
                      {relevance >= 70 && !inCart && <div style={{ position: "absolute", top: 34, right: 8, background: currentRegime.color, borderRadius: 4, padding: "1px 5px", zIndex: 2 }}><span style={{ color: "#fff", fontSize: 6, fontWeight: 900 }}>FIT</span></div>}

                      {/* Big emoji + bold name */}
                      <div style={{ textAlign: "center", marginBottom: 4 }} onClick={() => setSelectedShopBasket({ ...b, relevance })}>
                        <div style={{ fontSize: 32, lineHeight: 1, marginBottom: 3 }}>{b.emoji}</div>
                        <div style={{ fontSize: 11, fontWeight: 900, fontFamily: "Poppins", color: "#5C4A1E", lineHeight: 1.15 }}>{b.name}</div>
                        <div style={{ fontSize: 7, color: "#A09080", fontWeight: 700, marginTop: 2 }}>{b.strategy} · {b.risk}</div>
                      </div>

                      {/* Ticker list with YoY returns */}
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, margin: "4px 0 6px" }} onClick={() => setSelectedShopBasket({ ...b, relevance })}>
                        {b.stocks.map(t => {
                          const yoy = stockYoYReturns[t] || 0;
                          const yoyC = yoy >= 0 ? "#5B8C5A" : "#EF5350";
                          return (
                            <div key={t} style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              fontFamily: "JetBrains Mono", fontSize: 9, fontWeight: 800, color: "#5C4A1E",
                              background: clr.a + "08", padding: "4px 8px", borderRadius: 6,
                              border: "1px solid " + clr.a + "18",
                            }}>
                              <span>{t}</span>
                              <span style={{ fontSize: 8, fontWeight: 800, color: yoyC }}>{yoy >= 0 ? "+" : ""}{yoy.toFixed(1)}%</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Select button only (no rating) */}
                      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }} onClick={() => setSelectedShopBasket({ ...b, relevance })}>
                        <div style={{ fontSize: 8, fontWeight: 800, color: "#fff", background: inCart ? "#5B8C5A" : clr.a, padding: "4px 10px", borderRadius: 6 }}>{inCart ? "✓ Added" : "Select"}</div>
                      </div>
                    </div>

                    {/* ═══ BACK: Metrics ═══ */}
                    <div style={{
                      position: isFlipped ? "relative" : "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)",
                      background: "#fff", border: "2px solid " + clr.a + "44", borderRadius: 14, padding: "10px",
                      display: "flex", flexDirection: "column",
                    }}>
                      {/* Back header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: 14 }}>{b.emoji}</span>
                          <div>
                            <div style={{ fontSize: 9, fontWeight: 900, fontFamily: "Poppins", color: "#5C4A1E" }}>{b.name}</div>
                            <div style={{ fontSize: 7, color: clr.a, fontWeight: 800 }}>Risk & YoY Analysis</div>
                          </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setFlippedCards(f => ({ ...f, [b.id]: false })); }}
                          style={{ width: 22, height: 22, borderRadius: 6, border: "1.5px solid #F0E6D0", background: "#FFFDF5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#A09080" }}
                          title="Back to front">↩</button>
                      </div>

                      {/* Basket YoY Return */}
                      <div style={{ background: retColor + "0C", borderRadius: 8, padding: "6px 8px", textAlign: "center", marginBottom: 6 }}>
                        <div style={{ fontSize: 7, color: "#A09080", fontWeight: 700, textTransform: "uppercase" }}>Basket YoY Return</div>
                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 900, color: retColor }}>{basketYoY >= 0 ? "+" : ""}{basketYoY.toFixed(1)}%</div>
                      </div>

                      {/* Individual Stock YoY Returns */}
                      <div style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 7, fontWeight: 800, color: "#A09080", textTransform: "uppercase", marginBottom: 3 }}>Stock YoY Returns</div>
                        {b.stocks.map((t, ti) => {
                          const yoy = stockYoYReturns[t] || 0;
                          const yoyC = yoy >= 0 ? "#5B8C5A" : "#EF5350";
                          const barW = Math.min(Math.abs(yoy) / 1.5, 100);
                          return (
                            <div key={ti} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 0", borderTop: ti > 0 ? "1px solid #F0E6D020" : "none" }}>
                              <span style={{ fontSize: 8, fontFamily: "JetBrains Mono", fontWeight: 700, color: "#5C4A1E", width: 36 }}>{t}</span>
                              <div style={{ flex: 1, height: 5, background: "#F5F0E8", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: barW + "%", background: yoyC, borderRadius: 3 }} />
                              </div>
                              <span style={{ fontSize: 8, fontFamily: "JetBrains Mono", fontWeight: 800, color: yoyC, minWidth: 38, textAlign: "right" }}>{yoy >= 0 ? "+" : ""}{yoy.toFixed(1)}%</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Risk Metrics */}
                      {rm && <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                        {[
                          { label: "Sharpe Ratio", val: rm.sharpe.toFixed(2), good: rm.sharpe > 1, icon: "📐" },
                          { label: "Beta", val: rm.beta.toFixed(2), good: rm.beta < 1.5, icon: "📉" },
                          { label: "Volatility", val: rm.volatility.toFixed(0) + "%", good: rm.volatility < 25, icon: "🌊" },
                          { label: "Max Drawdown", val: rm.maxDD.toFixed(0) + "%", good: rm.maxDD > -15, icon: "⬇️" },
                          { label: "Sortino", val: rm.sortino.toFixed(2), good: rm.sortino > 1, icon: "🎯" },
                        ].map((m, mi) => (
                          <div key={mi} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 6px", background: m.good ? "#EDF5ED" : "#FFF5F5", borderRadius: 6 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <span style={{ fontSize: 8 }}>{m.icon}</span>
                              <span style={{ fontSize: 7, fontWeight: 700, color: "#5C4A1E" }}>{m.label}</span>
                            </div>
                            <span style={{ fontFamily: "JetBrains Mono", fontSize: 9, fontWeight: 800, color: m.good ? "#5B8C5A" : "#EF5350" }}>{m.val}</span>
                          </div>
                        ))}
                      </div>}

                      {/* Risk level bar */}
                      <div style={{ marginTop: 4, padding: "4px 8px", background: clr.a + "0C", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 7, fontWeight: 800, color: "#A09080", textTransform: "uppercase" }}>Risk Level</span>
                        <span style={{ fontSize: 9, fontWeight: 900, color: b.risk === "Low" ? "#5B8C5A" : b.risk === "Medium" ? "#FFA726" : "#EF5350" }}>{b.risk}</span>
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

        {/* ══ ALERTS ══ */}
        {page === "alerts" && !selectedBasket && <AlertsPage alerts={macroAlerts} />}

        {/* ══ MACRO DASHBOARD ══ */}
        {page === "macro" && !selectedBasket && <MacroDashboardPage onGoRiskLab={() => { setPage("risklab"); setRiskLabTab("risklab"); }} />}

        {/* ══ RISK LAB ══ */}
        {page === "risklab" && !selectedBasket && <div>
          <div style={{ display: "flex", gap: 2, background: "#fff", borderRadius: 10, padding: 2, marginBottom: 10, border: "1.5px solid #F0E6D0", flexWrap: "wrap" }}>
            {[{ id: "risklab", label: "🧪 Risk" }, { id: "tides", label: "🌊 Tides" }, { id: "weather", label: "🌤️ Weather" }, { id: "currencies", label: "💱 FX" }, { id: "myeggs", label: "🥚 Eggs" }, { id: "horoscope", label: "🌙 Horoscope" }].map(t => (
              <button key={t.id} onClick={() => setRiskLabTab(t.id)}
                style={{ flex: "1 1 auto", padding: "6px 6px", borderRadius: 7, border: "none", background: riskLabTab === t.id ? "#C48830" : "transparent", color: riskLabTab === t.id ? "#fff" : "#A09080", fontSize: 8, fontWeight: 800, cursor: "pointer", fontFamily: "Quicksand", transition: "all .2s", whiteSpace: "nowrap" }}>{t.label}</button>
            ))}
          </div>
          {riskLabTab === "risklab" && <RiskLabPage onOpenMacro={() => setPage("macro")} />}
          {riskLabTab === "tides" && <MacroTidesPage />}
          {riskLabTab === "weather" && <WeatherMarketPage />}
          {riskLabTab === "currencies" && <CurrenciesScenarioPage />}
          {riskLabTab === "myeggs" && <MyBasketsPage onSelectBasket={setSelectedBasket} />}
          {riskLabTab === "horoscope" && <HoroscopePage />}
        </div>}

        {/* ══ MY ACCOUNT ══ */}
        {page === "account" && !selectedBasket && <MyAccountPage onNavigate={setPage} />}

        {/* ══ NEWS ══ */}
        {page === "news" && !selectedBasket && <NewsPage />}
        </div>

        {/* ── Bottom Tab Bar ── */}
        <div style={{ flexShrink: 0, background: "#fff", borderTop: "1px solid #F0E6D0", padding: "4px 6px 26px", display: "flex", justifyContent: "space-around", alignItems: "center", zIndex: 200 }}>
          {navItems.map(p => {
            const isActive = page === p.id && !selectedBasket;
            return (
              <button key={p.id} onClick={() => { setPage(p.id); setSelectedBasket(null); setPortfolioView(false); }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, padding: "3px 4px", border: "none", background: "transparent", cursor: "pointer", position: "relative", transition: "all .15s" }}>
                <span style={{ fontSize: 19, filter: isActive ? "none" : "grayscale(60%)", opacity: isActive ? 1 : 0.5, transition: "all .15s" }}>{p.emoji}</span>
                <span style={{ fontSize: 8, fontWeight: isActive ? 800 : 600, color: isActive ? "#C48830" : "#A09080", fontFamily: "Quicksand" }}>{p.label}</span>
                {isActive && <div style={{ position: "absolute", top: -3, width: 4, height: 4, borderRadius: "50%", background: "#C48830" }} />}
                {p.id === "alerts" && critCount > 0 && <span style={{ position: "absolute", top: 0, right: 2, width: 14, height: 14, borderRadius: "50%", background: "#EF5350", color: "#fff", fontSize: 7, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #fff" }}>{critCount}</span>}
              </button>
            );
          })}
        </div>

        {/* ── Home Indicator ── */}
        <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", width: 134, height: 5, borderRadius: 3, background: "#1A1A1A", opacity: 0.2, zIndex: 250 }} />

        {/* ── Modals (inside phone frame) ── */}
        {showCreate && <CreateBasketModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
        {showCheckout && cart.length > 0 && <CheckoutModal cart={cart} onClose={() => setShowCheckout(false)} onExecute={() => setCart([])} />}
        {showCheckout && cart.length === 0 && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.3)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowCheckout(false)}><div style={{ background: "#fff", borderRadius: 16, padding: "36px 28px", textAlign: "center", animation: "popIn .4s ease", margin: 20 }} onClick={e => e.stopPropagation()}><div style={{ fontSize: 42, marginBottom: 8 }}>🛒</div><div style={{ fontSize: 12, fontWeight: 900, fontFamily: "Poppins", marginBottom: 4, color: "#8B6914" }}>Your cart is empty!</div><div style={{ fontSize: 12, color: "#A09080", marginBottom: 12 }}>Browse our fresh baskets and add some eggs 🥚</div><button onClick={() => { setShowCheckout(false); setPage("explorer"); }} style={{ padding: "10px 24px", background: "linear-gradient(135deg,#C48830,#D4A03C)", color: "#fff", border: "none", borderRadius: 14, fontWeight: 800, cursor: "pointer", fontSize: 10, fontFamily: "Quicksand" }}>🛒 Start Shopping</button></div></div>}
        <AIAgent onNotify={notify} onNavigate={setPage} />
      </div>
    </div>
  );
}
