// Portfolio Service
// Data adapter that provides clean portfolio snapshots to agents

import {
  myBaskets,
  basketStocks,
  macroIndicators,
  currentRegime,
  portfolioRisk,
  terminalFeed,
  macroAlerts,
  calendarEvents
} from '../data/mockData';

// Module-level live news injection (set from useNewsStream hook)
let _liveNews = null;

export class PortfolioService {
  static setLiveNews(news) {
    _liveNews = news;
  }

  /**
   * Get complete portfolio snapshot for agent analysis
   * @returns {Object} - Portfolio snapshot with all relevant data
   */
  static getSnapshot() {
    const totalValue = myBaskets.reduce((sum, basket) => sum + basket.value, 0);
    const totalCost = myBaskets.reduce((sum, basket) => sum + basket.costBasis, 0);
    const totalPL = totalValue - totalCost;
    const totalPLPercent = ((totalPL / totalCost) * 100).toFixed(2);

    // Get all holdings across all baskets
    const allHoldings = [];
    myBaskets.forEach(basket => {
      const stocks = basketStocks[basket.id] || [];
      stocks.forEach(stock => {
        const stockValue = stock.shares * stock.current;
        const stockCost = stock.shares * stock.avgCost;
        allHoldings.push({
          ...stock,
          basket: basket.name,
          basketId: basket.id,
          value: stockValue,
          costBasis: stockCost,
          pl: stockValue - stockCost,
          percentOfPortfolio: ((stockValue / totalValue) * 100).toFixed(2)
        });
      });
    });

    // Calculate concentration risks
    const concentrationRisks = allHoldings
      .filter(h => (h.value / totalValue) > 0.10) // >10% is concentrated
      .map(h => ({
        ticker: h.ticker,
        name: h.name,
        concentration: parseFloat(h.percentOfPortfolio),
        value: h.value
      }))
      .sort((a, b) => b.concentration - a.concentration);

    // Group by asset type
    const assetAllocation = {};
    allHoldings.forEach(h => {
      if (!assetAllocation[h.asset]) {
        assetAllocation[h.asset] = {
          count: 0,
          value: 0,
          percent: 0
        };
      }
      assetAllocation[h.asset].count++;
      assetAllocation[h.asset].value += h.value;
    });

    // Calculate percentages
    Object.keys(assetAllocation).forEach(asset => {
      assetAllocation[asset].percent = ((assetAllocation[asset].value / totalValue) * 100).toFixed(2);
    });

    return {
      // Portfolio summary
      totalValue,
      totalCost,
      totalPL,
      totalPLPercent: parseFloat(totalPLPercent),
      basketCount: myBaskets.length,
      holdingsCount: allHoldings.length,

      // Baskets
      baskets: myBaskets.map(basket => ({
        id: basket.id,
        name: basket.name,
        emoji: basket.emoji,
        value: basket.value,
        allocation: basket.allocation,
        change: basket.change,
        dayPL: basket.dayPL,
        totalPL: basket.totalPL,
        stocks: basketStocks[basket.id] || []
      })),

      // All holdings (flattened)
      holdings: allHoldings,

      // Risk metrics
      risk: {
        ...portfolioRisk,
        concentrationRisks
      },

      // Asset allocation
      assetAllocation,

      // Macro environment
      macro: {
        regime: currentRegime,
        indicators: macroIndicators,
        alerts: macroAlerts,
        recentNews: (_liveNews && _liveNews.length > 0 ? _liveNews : terminalFeed).slice(0, 5),
        upcomingEvents: this.getUpcomingEvents(3) // Next 3 days
      },

      // Timestamp
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get simplified portfolio context (for system prompts)
   * @returns {string} - Text summary of portfolio
   */
  static getContextString() {
    const snapshot = this.getSnapshot();

    let context = `PORTFOLIO SNAPSHOT:\n`;
    context += `Total Value: $${snapshot.totalValue.toLocaleString()}\n`;
    context += `Total P&L: $${snapshot.totalPL.toLocaleString()} (${snapshot.totalPLPercent}%)\n`;
    context += `Baskets: ${snapshot.basketCount} | Holdings: ${snapshot.holdingsCount}\n\n`;

    context += `BASKETS:\n`;
    snapshot.baskets.forEach(basket => {
      context += `- ${basket.emoji} ${basket.name}: $${basket.value.toLocaleString()} (${basket.allocation}%) | P&L: $${basket.totalPL}\n`;
    });

    context += `\nTOP HOLDINGS:\n`;
    snapshot.holdings
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .forEach(h => {
        context += `- ${h.ticker} (${h.name}): $${h.value.toLocaleString()} (${h.percentOfPortfolio}% of portfolio)\n`;
      });

    if (snapshot.risk.concentrationRisks.length > 0) {
      context += `\nCONCENTRATION RISKS:\n`;
      snapshot.risk.concentrationRisks.forEach(risk => {
        context += `- ${risk.ticker}: ${risk.concentration}% of portfolio\n`;
      });
    }

    context += `\nRISK METRICS:\n`;
    context += `- Sharpe Ratio: ${snapshot.risk.sharpe}\n`;
    context += `- Beta: ${snapshot.risk.beta}\n`;
    context += `- Max Drawdown: ${snapshot.risk.maxDrawdown}%\n`;
    context += `- VaR (95%): $${Math.abs(snapshot.risk.var95).toLocaleString()}\n`;

    context += `\nMACRO REGIME:\n`;
    context += `- ${snapshot.macro.regime.emoji} ${snapshot.macro.regime.name} (${snapshot.macro.regime.confidence}% confidence)\n`;
    context += `- ${snapshot.macro.regime.desc}\n`;

    context += `\nKEY INDICATORS:\n`;
    snapshot.macro.indicators.slice(0, 5).forEach(ind => {
      context += `- ${ind.name}: ${ind.value}${ind.unit} (${ind.signal})\n`;
    });

    return context;
  }

  /**
   * Get upcoming calendar events
   * @param {number} daysAhead - Number of days to look ahead
   * @returns {Array} - Upcoming events
   */
  static getUpcomingEvents(daysAhead = 7) {
    const today = new Date('2026-02-10'); // Using app's current date
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return calendarEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= futureDate;
    });
  }

  /**
   * Calculate portfolio change percentage
   * Used for triggering agents when portfolio changes significantly
   * @param {number} previousValue - Previous portfolio value
   * @param {number} currentValue - Current portfolio value
   * @returns {number} - Change percentage (absolute value)
   */
  static calculateChange(previousValue, currentValue) {
    if (!previousValue || previousValue === 0) return 0;
    return Math.abs(((currentValue - previousValue) / previousValue) * 100);
  }

  /**
   * Get portfolio value
   * @returns {number} - Total portfolio value
   */
  static getTotalValue() {
    return myBaskets.reduce((sum, basket) => sum + basket.value, 0);
  }

  /**
   * Get asset type breakdown
   * @returns {Object} - Asset allocation by type
   */
  static getAssetBreakdown() {
    const snapshot = this.getSnapshot();
    return snapshot.assetAllocation;
  }
}
