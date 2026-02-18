// Static data extracted from App.jsx
// This file contains all mock data for the trading app

export const calendarEvents = [
  { date:"2026-02-06", type:"earnings", ticker:"AMZN", name:"Amazon", quarter:"Q4 '25", time:"AMC", expected:"$1.48", sector:"Consumer", impact:"high" },
  { date:"2026-02-06", type:"earnings", ticker:"GOOGL", name:"Alphabet", quarter:"Q4 '25", time:"AMC", expected:"$1.92", sector:"Technology", impact:"high" },
  { date:"2026-02-07", type:"event", ticker:"MACRO", name:"Jobs Report (NFP)", desc:"Non-Farm Payrolls — Jan 2026", sector:"Macro", impact:"high", icon:"chart-bar" },
  { date:"2026-02-10", type:"earnings", ticker:"KO", name:"Coca-Cola", quarter:"Q4 '25", time:"BMO", expected:"$0.52", sector:"Staples", impact:"medium" },
  { date:"2026-02-10", type:"earnings", ticker:"PEP", name:"PepsiCo", quarter:"Q4 '25", time:"BMO", expected:"$1.94", sector:"Staples", impact:"medium" },
  { date:"2026-02-11", type:"earnings", ticker:"SHOP", name:"Shopify", quarter:"Q4 '25", time:"BMO", expected:"$0.44", sector:"Technology", impact:"medium" },
  { date:"2026-02-11", type:"event", ticker:"MACRO", name:"CPI Report", desc:"Consumer Price Index — Jan 2026", sector:"Macro", impact:"high", icon:"fire" },
  { date:"2026-02-12", type:"earnings", ticker:"CSCO", name:"Cisco", quarter:"Q2 FY26", time:"AMC", expected:"$0.92", sector:"Technology", impact:"medium" },
  { date:"2026-02-12", type:"event", ticker:"NVDA", name:"NVIDIA GTC Keynote", desc:"New GPU arch expected", sector:"Technology", impact:"high", icon:"bolt" },
  { date:"2026-02-13", type:"earnings", ticker:"ABNB", name:"Airbnb", quarter:"Q4 '25", time:"AMC", expected:"$0.58", sector:"Consumer", impact:"medium" },
  { date:"2026-02-14", type:"event", ticker:"MACRO", name:"Retail Sales", desc:"US Retail Sales — Jan 2026", sector:"Macro", impact:"medium", icon:"cart" },
  { date:"2026-02-17", type:"event", ticker:"MACRO", name:"Presidents' Day", desc:"US Markets Closed", sector:"Holiday", impact:"low", icon:"flag" },
  { date:"2026-02-18", type:"earnings", ticker:"WMT", name:"Walmart", quarter:"Q4 FY26", time:"BMO", expected:"$1.64", sector:"Staples", impact:"high" },
  { date:"2026-02-18", type:"earnings", ticker:"HD", name:"Home Depot", quarter:"Q4 '25", time:"BMO", expected:"$3.02", sector:"Consumer", impact:"high" },
  { date:"2026-02-19", type:"event", ticker:"MACRO", name:"FOMC Minutes", desc:"Fed Meeting Minutes Release", sector:"Macro", impact:"high", icon:"bank" },
  { date:"2026-02-20", type:"earnings", ticker:"BKNG", name:"Booking Holdings", quarter:"Q4 '25", time:"AMC", expected:"$38.20", sector:"Consumer", impact:"medium" },
  { date:"2026-02-24", type:"event", ticker:"AAPL", name:"Apple Shareholder Meeting", desc:"Annual shareholder meeting & vote", sector:"Technology", impact:"medium", icon:"apple-fruit" },
  { date:"2026-02-25", type:"event", ticker:"MACRO", name:"Consumer Confidence", desc:"CB Consumer Confidence — Feb", sector:"Macro", impact:"medium", icon:"chart-up" },
  { date:"2026-02-26", type:"earnings", ticker:"NVDA", name:"NVIDIA", quarter:"Q4 FY26", time:"AMC", expected:"$0.89", sector:"Technology", impact:"high" },
  { date:"2026-02-26", type:"earnings", ticker:"CRM", name:"Salesforce", quarter:"Q4 FY26", time:"AMC", expected:"$2.62", sector:"Technology", impact:"high" },
  { date:"2026-02-27", type:"earnings", ticker:"DELL", name:"Dell Technologies", quarter:"Q4 FY26", time:"AMC", expected:"$2.15", sector:"Technology", impact:"medium" },
  { date:"2026-02-27", type:"event", ticker:"MACRO", name:"GDP (2nd Estimate)", desc:"Q4 2025 GDP Revision", sector:"Macro", impact:"high", icon:"building" },
  { date:"2026-02-28", type:"event", ticker:"MACRO", name:"PCE Inflation", desc:"Fed's preferred inflation gauge", sector:"Macro", impact:"high", icon:"chart-bar" },
  { date:"2026-03-02", type:"earnings", ticker:"TGT", name:"Target", quarter:"Q4 '25", time:"BMO", expected:"$2.42", sector:"Consumer", impact:"medium" },
  { date:"2026-03-03", type:"event", ticker:"TSLA", name:"Tesla Investor Day", desc:"Robotaxi & energy update expected", sector:"Technology", impact:"high", icon:"car" },
  { date:"2026-03-04", type:"earnings", ticker:"COST", name:"Costco", quarter:"Q2 FY26", time:"AMC", expected:"$3.78", sector:"Staples", impact:"high" },
  { date:"2026-03-06", type:"event", ticker:"MACRO", name:"Jobs Report (NFP)", desc:"Non-Farm Payrolls — Feb 2026", sector:"Macro", impact:"high", icon:"chart-bar" },
  { date:"2026-03-09", type:"earnings", ticker:"ORCL", name:"Oracle", quarter:"Q3 FY26", time:"AMC", expected:"$1.52", sector:"Technology", impact:"medium" },
  { date:"2026-03-10", type:"event", ticker:"AAPL", name:"Apple Spring Event", desc:"New MacBook & iPad launch", sector:"Technology", impact:"high", icon:"apple-fruit" },
  { date:"2026-03-11", type:"event", ticker:"MACRO", name:"CPI Report", desc:"Consumer Price Index — Feb 2026", sector:"Macro", impact:"high", icon:"fire" },
  { date:"2026-03-12", type:"event", ticker:"META", name:"Meta Connect 2026", desc:"AR/VR hardware & AI updates", sector:"Technology", impact:"medium", icon:"goggles" },
  { date:"2026-03-17", type:"event", ticker:"MACRO", name:"FOMC Decision", desc:"Federal Reserve Rate Decision", sector:"Macro", impact:"high", icon:"bank" },
  { date:"2026-03-18", type:"earnings", ticker:"FDX", name:"FedEx", quarter:"Q3 FY26", time:"AMC", expected:"$4.62", sector:"Industrials", impact:"medium" },
  { date:"2026-03-20", type:"event", ticker:"MACRO", name:"Triple Witching", desc:"Options & futures quad expiration", sector:"Market", impact:"high", icon:"wizard" },
  { date:"2026-03-24", type:"earnings", ticker:"NKE", name:"Nike", quarter:"Q3 FY26", time:"AMC", expected:"$0.74", sector:"Consumer", impact:"medium" },
  { date:"2026-03-26", type:"event", ticker:"MSFT", name:"Microsoft Build Preview", desc:"Developer conference preview & AI features", sector:"Technology", impact:"medium", icon:"laptop" },
  { date:"2026-03-28", type:"event", ticker:"MACRO", name:"PCE Inflation", desc:"Personal Consumption Exp. — Feb", sector:"Macro", impact:"high", icon:"chart-bar" },
  { date:"2026-03-31", type:"event", ticker:"MACRO", name:"Quarter End", desc:"Q1 2026 ends — portfolio rebalancing expected", sector:"Market", impact:"medium", icon:"calendar" },
];

export const portfolioHistory = [
  { d:"Jan",v:42000 },{ d:"Feb",v:44500 },{ d:"Mar",v:41200 },{ d:"Apr",v:46800 },
  { d:"May",v:48200 },{ d:"Jun",v:45900 },{ d:"Jul",v:51200 },{ d:"Aug",v:53800 },
  { d:"Sep",v:52100 },{ d:"Oct",v:56400 },{ d:"Nov",v:58900 },{ d:"Dec",v:61247 },
];

export const myBaskets = [
  { id:1, name:"Inflation Hedge", icon:"shield", emoji:"🛡️", strategy:"Global Macro", color:"coral", stocks:["XOM","CVX","GLD","BRK.B","COST"], value:22480, change:2.14, allocation:55, desc:"Energy + gold + value for sticky CPI", costBasis:18200, dayPL:447, totalPL:4280 },
  { id:2, name:"Geopolitical Shield", icon:"globe", emoji:"🌍", strategy:"Global Macro", color:"plum", stocks:["LMT","RTX","GD","NOC","GLD"], value:18760, change:1.87, allocation:45, desc:"Defense + gold for geopolitical risk", costBasis:15800, dayPL:324, totalPL:2960 },
];

export const basketStocks = {
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

export const basketHistories = {
  1:[{d:"J",v:15200},{d:"F",v:15800},{d:"M",v:14900},{d:"A",v:16200},{d:"M",v:16800},{d:"J",v:16100},{d:"J",v:17200},{d:"A",v:17800},{d:"S",v:17200},{d:"O",v:18000},{d:"N",v:18200},{d:"D",v:18420}],
  2:[{d:"J",v:11800},{d:"F",v:11900},{d:"M",v:12100},{d:"A",v:12000},{d:"M",v:12200},{d:"J",v:12400},{d:"J",v:12300},{d:"A",v:12500},{d:"S",v:12600},{d:"O",v:12700},{d:"N",v:12800},{d:"D",v:12840}],
  3:[{d:"J",v:12400},{d:"F",v:11800},{d:"M",v:10600},{d:"A",v:11200},{d:"M",v:10800},{d:"J",v:9800},{d:"J",v:10200},{d:"A",v:9600},{d:"S",v:9200},{d:"O",v:9400},{d:"N",v:9100},{d:"D",v:8960}],
  4:[{d:"J",v:8200},{d:"F",v:9400},{d:"M",v:8800},{d:"A",v:10200},{d:"M",v:11000},{d:"J",v:10600},{d:"J",v:12200},{d:"A",v:13000},{d:"S",v:12400},{d:"O",v:13200},{d:"N",v:13800},{d:"D",v:14280}],
  5:[{d:"J",v:5800},{d:"F",v:5900},{d:"M",v:6000},{d:"A",v:6100},{d:"M",v:6200},{d:"J",v:6100},{d:"J",v:6300},{d:"A",v:6400},{d:"S",v:6500},{d:"O",v:6600},{d:"N",v:6700},{d:"D",v:6747}],
};

export const macroAlerts = [
  { id:1, severity:"critical", time:"2h", title:"Fed Holds Rates", summary:"Signals cuts in Q2.", tags:["Rates"], scenario:"rates_down", icon:"bank" },
  { id:2, severity:"warning", time:"5h", title:"CPI Hot at 3.4%", summary:"Core inflation beats.", tags:["CPI"], scenario:"inflation", icon:"fire" },
  { id:3, severity:"info", time:"8h", title:"China PMI at 48.1", summary:"Contraction signals.", tags:["China"], scenario:"geopolitical", icon:"globe" },
  { id:4, severity:"warning", time:"1d", title:"10Y Breaks 4.5%", summary:"Bond selloff accelerates.", tags:["Bonds"], scenario:"inflation", icon:"chart-bar" },
  { id:5, severity:"critical", time:"1d", title:"NVDA Revenue +265%", summary:"AI capex surging.", tags:["AI"], scenario:"tech_boom", icon:"bolt" },
];

export const terminalFeed = [
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

export const allInstruments = [
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
  { ticker:"SPY 540C 03/21", name:"SPY $540 Call", type:"option", price:12.40, change:8.50 },
  { ticker:"SPY 500P 03/21", name:"SPY $500 Put", type:"option", price:3.20, change:-12.40 },
  { ticker:"AAPL 200C 04/19", name:"AAPL $200 Call", type:"option", price:5.80, change:6.20 },
  { ticker:"QQQ 420P 03/21", name:"QQQ $420 Put", type:"option", price:4.60, change:-5.40 },
  { ticker:"NVDA 900C 03/21", name:"NVDA $900 Call", type:"option", price:18.20, change:14.80 },
  { ticker:"ES Mar26", name:"E-mini S&P 500", type:"future", price:5248.50, change:0.42 },
  { ticker:"NQ Mar26", name:"E-mini Nasdaq", type:"future", price:18420.00, change:0.68 },
  { ticker:"CL Mar26", name:"Crude Oil", type:"future", price:85.40, change:2.10 },
  { ticker:"GC Apr26", name:"Gold Future", type:"future", price:2185.60, change:0.32 },
  { ticker:"ZB Mar26", name:"30Y T-Bond", type:"future", price:118.28, change:-0.45 },
  { ticker:"ZN Mar26", name:"10Y T-Note", type:"future", price:110.42, change:-0.28 },
  { ticker:"TLT", name:"20+ Year Treasury ETF", type:"bond", price:92.40, change:-0.62 },
  { ticker:"IEF", name:"7-10 Year Treasury ETF", type:"bond", price:98.20, change:-0.34 },
  { ticker:"HYG", name:"High Yield Corp Bond", type:"bond", price:76.80, change:0.18 },
  { ticker:"TIPS", name:"TIPS Bond ETF", type:"bond", price:108.60, change:0.12 },
  { ticker:"BND", name:"Total Bond Market", type:"bond", price:72.40, change:-0.22 },
  { ticker:"EUR/USD", name:"Euro / Dollar", type:"forex", price:1.0842, change:-0.18 },
  { ticker:"USD/JPY", name:"Dollar / Yen", type:"forex", price:150.24, change:0.42 },
  { ticker:"GBP/USD", name:"Pound / Dollar", type:"forex", price:1.2648, change:0.08 },
  { ticker:"USD/CNH", name:"Dollar / Yuan (Off)", type:"forex", price:7.2180, change:0.24 },
  { ticker:"BTC-USD", name:"Bitcoin", type:"crypto", price:62480.00, change:4.20 },
  { ticker:"ETH-USD", name:"Ethereum", type:"crypto", price:3420.00, change:3.10 },
];

export const typeColors = { equity:"#42A5F5", option:"#AB47BC", future:"#FFA726", crypto:"#C48830", bond:"#C48830", forex:"#EF5350" };
export const typeLabels = { equity:"Stock", option:"Option", future:"Future", crypto:"Crypto", bond:"Bond", forex:"FX" };
export const typeIcons = { equity:"chart-up", option:"chart-bar", future:"hourglass", crypto:"bitcoin", bond:"building", forex:"currency" };

export const macroScenarios = [
  { id:"inflation", name:"High Inflation", icon:"fire", desc:"Commodities & value", color:"coral" },
  { id:"recession", name:"Recession Shield", icon:"rain", desc:"Defensives & dividends", color:"golden" },
  { id:"bull", name:"Bull Market", icon:"rocket", desc:"Growth & momentum", color:"sage" },
  { id:"rates_down", name:"Rate Cuts", icon:"money", desc:"REITs & duration", color:"terracotta" },
  { id:"geopolitical", name:"Geopolitical Risk", icon:"globe", desc:"Defense & haven", color:"plum" },
  { id:"tech_boom", name:"AI & Tech Boom", icon:"bolt", desc:"Semis & cloud", color:"sky" },
];

export const explorerBaskets = [
  { id:101, name:"Inflation Beaters", icon:"shield", emoji:"🛡️", scenario:"inflation", strategy:"Global Macro", color:"coral", stocks:["XOM","CVX","GLD","BRK.B","COST"], assets:{equity:3,future:1,bond:1}, composition:["Long XOM, CVX, BRK.B","Long Gold Futures","Short TLT (duration)"], price:500, monthlyReturn:2.1, risk:"Medium", popularity:4.9, buyers:14200, desc:"Multi-asset inflation hedge: energy equities + gold futures + short duration", tags:["Inflation","Multi-Asset"] },
  { id:102, name:"Rate Cut Winners", icon:"house", emoji:"🏠", scenario:"rates_down", strategy:"Multi-Asset", color:"terracotta", stocks:["O","AMT","XLU","TLT","PLD"], assets:{equity:3,bond:2}, composition:["Long REITs: O, AMT, PLD","Long 20Y+ Treasuries","Long Utilities ETF"], price:650, monthlyReturn:1.6, risk:"Low", popularity:4.9, buyers:11800, desc:"REITs + long-duration bonds for Fed easing cycle", tags:["Rates","Income","Bonds"] },
  { id:103, name:"Recession Fortress", icon:"castle", emoji:"🏰", scenario:"recession", strategy:"Defensive", color:"golden", stocks:["JNJ","PG","WMT","KO","MCD"], assets:{equity:5,option:2,bond:1}, composition:["Long staples: JNJ, PG, WMT, KO, MCD","Long SPY puts (tail hedge)","Long T-Bonds"], price:400, monthlyReturn:0.8, risk:"Low", popularity:4.9, buyers:18600, desc:"Staples + put protection + treasuries for downturns", tags:["Defensive","Options","Bonds"] },
  { id:104, name:"AI Infrastructure", icon:"bolt", emoji:"⚡", scenario:"tech_boom", strategy:"Growth + Derivs", color:"sky", stocks:["NVDA","AMD","AVGO","MSFT","AMZN"], assets:{equity:5,option:2,future:1}, composition:["Long NVDA, AMD, AVGO, MSFT, AMZN","Long NVDA calls (leverage)","Long Nasdaq futures"], price:1200, monthlyReturn:4.8, risk:"High", popularity:4.8, buyers:9200, desc:"AI equities + call options for leverage + Nasdaq futures", tags:["AI","Options","Futures"] },
  { id:105, name:"Geopolitical Hedge", icon:"shield", emoji:"🌐", scenario:"geopolitical", strategy:"Global Macro", color:"plum", stocks:["LMT","RTX","GLD","GD","NOC"], assets:{equity:3,future:1,forex:1,bond:1}, composition:["Long defense: LMT, RTX, GD","Long Gold futures","Long USD/JPY (safe haven)","Long T-Bonds"], price:800, monthlyReturn:1.9, risk:"Medium", popularity:4.7, buyers:6800, desc:"Defense stocks + gold + forex + bonds for geopolitical risk", tags:["Defense","FX","Multi-Asset"] },
  { id:106, name:"Bull Runners", icon:"bull", emoji:"🐂", scenario:"bull", strategy:"Leveraged", color:"sage", stocks:["TQQQ","SPXL","ARKK","TSLA","COIN"], assets:{equity:3,option:2,future:1,crypto:1}, composition:["Long high-beta: TSLA, ARKK, COIN","Long SPY/QQQ calls","Long ES futures","Long BTC"], price:900, monthlyReturn:5.2, risk:"Very High", popularity:4.6, buyers:7400, desc:"Max leverage: calls + futures + crypto + high-beta equities", tags:["Leverage","Crypto","Options"] },
  { id:107, name:"Tech Giants", icon:"laptop", emoji:"💻", scenario:"tech_boom", strategy:"Growth", color:"sky", stocks:["AAPL","MSFT","GOOGL","AMZN","NVDA"], assets:{equity:5}, composition:["Long mega-cap tech: AAPL, MSFT, GOOGL, AMZN, NVDA"], price:850, monthlyReturn:3.4, risk:"Medium", popularity:4.9, buyers:22400, desc:"Large-cap tech leaders — the backbone of US equity markets", tags:["Tech","Growth"] },
  { id:108, name:"Dividend Kings", icon:"crown", emoji:"👑", scenario:"rates_down", strategy:"Income", color:"golden", stocks:["JNJ","PG","KO","PEP","MMM"], assets:{equity:5}, composition:["Long 50+ year dividend aristocrats"], price:420, monthlyReturn:1.2, risk:"Low", popularity:4.8, buyers:16800, desc:"50+ years of consecutive dividend increases — ultimate income stability", tags:["Income","Defensive"] },
  { id:109, name:"Clean Energy", icon:"seedling", emoji:"🌱", scenario:"bull", strategy:"Thematic", color:"sage", stocks:["ENPH","SEDG","FSLR","RUN","PLUG"], assets:{equity:5}, composition:["Long solar, wind & hydrogen pure plays"], price:380, monthlyReturn:-2.3, risk:"High", popularity:4.5, buyers:8200, desc:"Solar, wind & hydrogen plays — high risk, high conviction green transition", tags:["ESG","Thematic"] },
  { id:110, name:"AI & Robotics", icon:"robot", emoji:"🤖", scenario:"tech_boom", strategy:"Momentum", color:"plum", stocks:["NVDA","AMD","PLTR","PATH","ISRG"], assets:{equity:5,option:1}, composition:["Long AI leaders + NVDA call spreads"], price:1100, monthlyReturn:5.7, risk:"High", popularity:4.9, buyers:13600, desc:"AI & automation leaders — riding the capex super-cycle", tags:["AI","Momentum","Options"] },
  { id:111, name:"Healthcare Fortress", icon:"pill", emoji:"💊", scenario:"recession", strategy:"Defensive", color:"coral", stocks:["UNH","LLY","ABBV","MRK","TMO"], assets:{equity:5}, composition:["Long pharma, biotech & managed care"], price:520, monthlyReturn:0.9, risk:"Low", popularity:4.8, buyers:10200, desc:"Pharma, biotech & services — defensive growth through all cycles", tags:["Healthcare","Defensive"] },
];

export const recentTrades = [
  { id:1, basket:"Inflation Hedge", icon:"shield", action:"Rebalance", date:"Feb 5", status:"Completed", amount:"+$420" },
  { id:2, basket:"Geopolitical Shield", icon:"globe", action:"Buy", date:"Feb 4", status:"Completed", amount:"+$1,200" },
  { id:3, basket:"Inflation Hedge", icon:"shield", action:"Add Gold", date:"Feb 3", status:"Completed", amount:"+$380" },
  { id:4, basket:"Geopolitical Shield", icon:"globe", action:"Dividend", date:"Feb 2", status:"Received", amount:"+$86" },
];

export const macroIndicators = [
  { id:"gdp", name:"GDP Growth", value:2.4, prev:2.1, unit:"%", trend:"up", signal:"bullish", weight:0.15,
    history:[1.6,1.9,2.0,1.8,2.1,2.0,1.9,2.2,2.3,2.0,2.1,2.2,2.5,2.3,2.1,2.0,2.2,2.3,2.1,2.4] },
  { id:"cpi", name:"CPI (YoY)", value:3.4, prev:3.1, unit:"%", trend:"up", signal:"bearish", weight:0.2,
    history:[6.5,6.4,6.0,5.0,4.9,4.0,3.7,3.2,3.1,3.2,3.4,3.1,2.9,3.0,3.1,3.2,3.0,3.1,3.2,3.4] },
  { id:"fedrate", name:"Fed Funds Rate", value:5.25, prev:5.25, unit:"%", trend:"flat", signal:"neutral", weight:0.2,
    history:[4.25,4.50,4.75,5.00,5.00,5.25,5.25,5.50,5.50,5.50,5.50,5.50,5.50,5.50,5.25,5.25,5.25,5.25,5.25,5.25] },
  { id:"unemployment", name:"Unemployment", value:3.8, prev:3.7, unit:"%", trend:"up", signal:"bearish", weight:0.1,
    history:[3.4,3.4,3.5,3.4,3.6,3.6,3.5,3.8,3.8,3.7,3.9,3.7,3.6,3.7,3.8,3.7,3.6,3.7,3.7,3.8] },
  { id:"pmi", name:"ISM PMI", value:52.1, prev:50.8, unit:"", trend:"up", signal:"bullish", weight:0.1,
    history:[47.4,46.3,46.9,47.1,46.4,47.6,48.7,49.0,47.8,49.0,50.3,49.2,50.0,50.3,49.1,50.6,50.8,51.4,51.2,52.1] },
  { id:"yield10y", name:"10Y Yield", value:4.52, prev:4.38, unit:"%", trend:"up", signal:"bearish", weight:0.1,
    history:[3.40,3.52,3.58,3.45,3.70,3.80,3.95,4.05,4.28,4.57,4.88,4.73,4.62,4.25,4.10,3.95,4.15,4.25,4.38,4.52] },
  { id:"vix", name:"VIX", value:18.4, prev:16.2, unit:"", trend:"up", signal:"bearish", weight:0.1,
    history:[21.7,19.4,18.5,17.2,13.9,13.6,14.2,13.5,14.9,17.5,21.3,18.1,14.6,12.8,13.1,14.2,15.6,14.1,16.2,18.4] },
  { id:"dxy", name:"Dollar Index", value:104.2, prev:103.8, unit:"", trend:"up", signal:"neutral", weight:0.05,
    history:[102.0,101.8,102.1,101.5,100.6,100.1,101.3,102.5,103.5,105.7,106.8,106.1,104.8,103.2,102.5,101.9,103.1,103.4,103.8,104.2] },
];

export const regimes = {
  goldilocks: { name:"Goldilocks", icon:"sparkle", color:"#C48830", bg:"#FFF8EE", desc:"Growth steady, inflation contained — ideal for risk assets", playbook:"Overweight equities, lean into growth & tech. Reduce cash and defensive hedges." },
  reflation: { name:"Reflation", icon:"fire", color:"#FFA726", bg:"#FFF3E0", desc:"Growth accelerating with rising prices — commodity cycle", playbook:"Overweight energy, materials, and TIPS. Reduce duration. Consider commodity Hatches." },
  stagflation: { name:"Stagflation", icon:"warning", color:"#EF5350", bg:"#FFEBEE", desc:"Slowing growth + persistent inflation — worst case", playbook:"Raise cash, overweight gold & commodities, reduce growth exposure. Add put protection." },
  riskoff: { name:"Risk-Off", icon:"shield", color:"#42A5F5", bg:"#E3F2FD", desc:"Flight to safety — recession signals building", playbook:"Rotate to treasuries, defensives, and dividend stocks. Cut high-beta positions." },
};

export function detectRegime(indicators) {
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

export const currentRegime = detectRegime(macroIndicators);

export const portfolioRisk = {
  sharpe: 1.08, beta: 1.12, maxDrawdown: -15.8, var95: -3420, var99: -5180,
  sectorConcentration: 48, topHolding: { ticker: "NVDA", pct: 14.2 },
  correlation: 0.72, volatility: 18.4, calmar: 0.86,
};

export const realizedTrades = [
  { ticker: "TSLA", name: "Tesla", basket: "Inflation Hedge", icon: "shield", buyPrice: 192.40, sellPrice: 248.60, shares: 8, date: "Jan 28", pl: 449.60 },
  { ticker: "META", name: "Meta", basket: "Inflation Hedge", icon: "shield", buyPrice: 348.20, sellPrice: 412.80, shares: 5, date: "Jan 22", pl: 323.00 },
  { ticker: "GOOG", name: "Alphabet", basket: "Geopolitical Shield", icon: "globe", buyPrice: 142.60, sellPrice: 156.20, shares: 12, date: "Jan 15", pl: 163.20 },
  { ticker: "BA", name: "Boeing", basket: "Geopolitical Shield", icon: "globe", buyPrice: 218.40, sellPrice: 198.60, shares: 6, date: "Jan 10", pl: -118.80 },
  { ticker: "DIS", name: "Disney", basket: "Inflation Hedge", icon: "shield", buyPrice: 98.40, sellPrice: 112.80, shares: 15, date: "Dec 18", pl: 216.00 },
  { ticker: "PYPL", name: "PayPal", basket: "Inflation Hedge", icon: "shield", buyPrice: 68.20, sellPrice: 62.40, shares: 20, date: "Dec 5", pl: -116.00 },
  { ticker: "SQ", name: "Block", basket: "Geopolitical Shield", icon: "globe", buyPrice: 72.80, sellPrice: 84.20, shares: 10, date: "Nov 28", pl: 114.00 },
];

export const basketCorrelations = [
  [1.00, 0.38],
  [0.38, 1.00],
];

export const factorExposures = [
  { factor:"Growth", exposure:0.62, benchmark:0.35 },
  { factor:"Value", exposure:0.18, benchmark:0.30 },
  { factor:"Momentum", exposure:0.71, benchmark:0.25 },
  { factor:"Quality", exposure:0.45, benchmark:0.40 },
  { factor:"Low Vol", exposure:0.22, benchmark:0.45 },
  { factor:"Size (Sm Cap)", exposure:0.08, benchmark:0.25 },
];

export const hedgeRecommendations = [
  { id:1, priority:"high", action:"BUY", instrument:"SPY 540P 03/21", desc:"Portfolio downside protection — CPI hot, 10Y rising", rationale:"With inflation above expectations and yields breaking out, tail risk is elevated. 5% OTM puts hedge ~$3,200 of downside.", cost:"$840", impact:"Caps max loss at -8%", regime:"reflation", icon:"shield", expiresIn: 4, expiresUnit: "hrs", totalDuration: 24 },
  { id:2, priority:"high", action:"ADD", instrument:"GLD / Gold Futures", desc:"Inflation + geopolitical hedge", rationale:"Gold historically outperforms when real rates plateau and geopolitical risks rise. Current regime favors 5-8% allocation.", cost:"$1,500", impact:"+2.1% if stagflation", regime:"stagflation", icon:"gold-medal", expiresIn: 18, expiresUnit: "hrs", totalDuration: 48 },
  { id:3, priority:"medium", action:"REDUCE", instrument:"Clean Energy", desc:"Cut losing position — regime unfavorable", rationale:"Rising rates crush long-duration growth. Clean Energy Hatch has -28% drawdown and macro headwinds persist.", cost:"Frees $4,480", impact:"Reduces portfolio vol by 3.2%", regime:"reflation", icon:"scissors", expiresIn: 2, expiresUnit: "days", totalDuration: 72 },
  { id:4, priority:"medium", action:"ROTATE", instrument:"Dividend Kings \u2192 TIPS ETF", desc:"Shift income sleeve to inflation-protected", rationale:"With CPI at 3.4%, nominal dividend yields lag real inflation. TIPS provide inflation-adjusted income.", cost:"Neutral swap", impact:"+1.8% real yield", regime:"reflation", icon:"rotate", expiresIn: 3, expiresUnit: "days", totalDuration: 120 },
  { id:5, priority:"low", action:"BUY", instrument:"VIX Mar 22C", desc:"Volatility spike insurance", rationale:"VIX at 18 is cheap relative to macro uncertainty. Buying calls provides convex payoff if sell-off materializes.", cost:"$320", impact:"10x payoff if VIX > 30", regime:"any", icon:"bolt", expiresIn: 5, expiresUnit: "days", totalDuration: 168 },
];

export const tradeSignals = [
  { id:1, time:"11:42 AM", type:"macro", signal:"BUY", ticker:"TLT", name:"20+ Year Treasury ETF", reason:"Yield curve inversion deepening — flight to duration", strength:82, basket:"New: Rate Hedge", status:"pending", icon:"bank" },
  { id:2, time:"10:15 AM", type:"earnings", signal:"HOLD", ticker:"AMZN", name:"Amazon", reason:"Q4 earnings today AMC — wait for results before acting", strength:65, basket:"Tech Giants", status:"watching", icon:"hourglass" },
  { id:3, time:"9:30 AM", type:"rebalance", signal:"SELL", ticker:"PLUG", name:"Plug Power", reason:"Below 200-DMA, negative momentum, basket drag", strength:91, basket:"Clean Energy", status:"pending", icon:"arrow-down-fill" },
  { id:4, time:"9:00 AM", type:"macro", signal:"BUY", ticker:"XOM", name:"Exxon Mobil", reason:"CPI beat \u2192 energy outperforms in inflation regime", strength:76, basket:"New: Inflation", status:"pending", icon:"oil-barrel" },
  { id:5, time:"Yesterday", type:"rebalance", signal:"TRIM", ticker:"NVDA", name:"NVIDIA", reason:"Position = 14.2% of portfolio — concentration risk", strength:70, basket:"Tech Giants + AI", status:"review", icon:"balance" },
];

export const stressScenarios = [
  { id:"rate_hike", name:"Surprise Rate Hike (+50bp)", icon:"chart-up", impacts: { 1:-2.8, 2:-1.4 }, portfolioPL:-2.2 },
  { id:"recession", name:"Recession (GDP -2%)", icon:"rain", impacts: { 1:-6.5, 2:-3.8 }, portfolioPL:-5.3 },
  { id:"bull_run", name:"Bull Rally (+15% SPX)", icon:"rocket", impacts: { 1:8.4, 2:4.2 }, portfolioPL:6.5 },
  { id:"inflation_spike", name:"CPI Spikes to 5%", icon:"fire", impacts: { 1:4.2, 2:1.8 }, portfolioPL:3.1 },
  { id:"tech_crash", name:"Tech Sector -25%", icon:"explosion", impacts: { 1:-3.2, 2:1.4 }, portfolioPL:-1.1 },
  { id:"china_crisis", name:"China Credit Crisis", icon:"globe", impacts: { 1:-4.1, 2:5.6 }, portfolioPL:0.4 },
];

export const optimalAllocation = [
  { basket:"Inflation Hedge", current:55, optimal:50, delta:-5 },
  { basket:"Geopolitical Shield", current:45, optimal:35, delta:-10 },
  { basket:"Cash / T-Bills", current:0, optimal:15, delta:15 },
];

export const basketRiskMetrics = {
  1: { sharpe: 1.12, beta: 1.15, alpha: 2.8, volatility: 19.6, maxDD: -16.2, sortino: 1.42, treynor: 6.8, infoRatio: 0.58, trackError: 8.4, upCapture: 112, downCapture: 108 },
  2: { sharpe: 0.74, beta: 0.62, alpha: 0.8, volatility: 11.2, maxDD: -7.8, sortino: 0.88, treynor: 4.8, infoRatio: 0.28, trackError: 5.6, upCapture: 68, downCapture: 54 },
  3: { sharpe: -0.18, beta: 1.38, alpha: -4.2, volatility: 28.6, maxDD: -26.8, sortino: -0.14, treynor: -2.4, infoRatio: -0.32, trackError: 12.6, upCapture: 124, downCapture: 138 },
  4: { sharpe: 1.24, beta: 1.34, alpha: 5.4, volatility: 26.2, maxDD: -21.4, sortino: 1.56, treynor: 7.2, infoRatio: 0.68, trackError: 12.8, upCapture: 128, downCapture: 118 },
  5: { sharpe: 0.82, beta: 0.68, alpha: 1.6, volatility: 13.2, maxDD: -9.4, sortino: 1.04, treynor: 5.4, infoRatio: 0.36, trackError: 6.2, upCapture: 76, downCapture: 62 },
};

export const explorerRiskMetrics = {
  101: { sharpe: 0.98, beta: 0.92, volatility: 17.8, maxDD: -14.6, sortino: 1.18 },
  102: { sharpe: 0.78, beta: 0.56, volatility: 12.4, maxDD: -9.2, sortino: 0.92 },
  103: { sharpe: 0.62, beta: 0.42, volatility: 9.4, maxDD: -6.8, sortino: 0.74 },
  104: { sharpe: 1.18, beta: 1.42, volatility: 27.8, maxDD: -24.2, sortino: 1.46 },
  105: { sharpe: 0.72, beta: 0.48, volatility: 13.8, maxDD: -11.6, sortino: 0.84 },
  106: { sharpe: 0.86, beta: 1.72, volatility: 36.4, maxDD: -32.8, sortino: 0.98 },
  107: { sharpe: 1.08, beta: 1.12, volatility: 20.6, maxDD: -18.4, sortino: 1.28 },
  108: { sharpe: 0.72, beta: 0.48, volatility: 10.8, maxDD: -7.4, sortino: 0.84 },
  109: { sharpe: 0.32, beta: 1.48, volatility: 32.4, maxDD: -28.6, sortino: 0.38 },
  110: { sharpe: 1.22, beta: 1.38, volatility: 28.4, maxDD: -22.6, sortino: 1.48 },
  111: { sharpe: 0.78, beta: 0.56, volatility: 13.6, maxDD: -10.2, sortino: 0.92 },
};

// Helper: collect all equity/ETF/bond tickers that Yahoo Finance can quote
export function getAllEquityTickers() {
  const tickers = new Set();
  Object.values(basketStocks).flat().forEach(s => {
    if (s.asset === 'equity' || s.asset === 'bond') tickers.add(s.ticker);
  });
  allInstruments.filter(i => i.type === 'equity' || i.type === 'bond').forEach(i => tickers.add(i.ticker));
  return [...tickers];
}
