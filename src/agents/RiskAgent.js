// Risk Agent
// Portfolio risk analysis + hedge recommendations using hybrid rule-based + AI

import { ClaudeService } from '../services/claudeService';
import { AgentMemory } from '../services/agentMemory';

export class RiskAgent {
  /**
   * Analyze portfolio risk and generate hedge recommendations
   * @param {Object} portfolio - Portfolio snapshot from portfolioService
   * @returns {Promise<Object>} - Risk metrics and hedge recommendations
   */
  static async analyze(portfolio) {
    // Generate cache key
    const cacheKey = AgentMemory.generateKey('risk', {
      value: portfolio.totalValue,
      holdings: portfolio.holdingsCount,
      regime: portfolio.macro.regime.name
    });

    // Check cache (30 min TTL)
    const cached = AgentMemory.getCached(cacheKey, 30 * 60 * 1000);
    if (cached) {
      console.log('[RiskAgent] Returning cached risk analysis');
      return cached;
    }

    console.log('[RiskAgent] Generating fresh risk analysis...');

    // Always calculate metrics via rules (fast, free)
    const metrics = this.calculateRiskMetrics(portfolio);
    const risks = this.identifyRisks(portfolio, metrics);

    // Use AI for hedge strategy design
    console.log('[RiskAgent] Using AI for hedge strategy design...');
    const hedges = await this.generateHedgeStrategy(portfolio, metrics, risks);

    const result = {
      metrics,
      risks,
      hedges: hedges || [],
      timestamp: new Date().toISOString()
    };

    // Cache results
    AgentMemory.set(cacheKey, result);

    return result;
  }

  /**
   * Calculate portfolio risk metrics (rule-based)
   * @param {Object} portfolio - Portfolio snapshot
   * @returns {Object} - Risk metrics
   */
  static calculateRiskMetrics(portfolio) {
    // Calculate portfolio beta (weighted average)
    let totalBeta = 0;
    let totalWeight = 0;

    portfolio.holdings.forEach(holding => {
      if (holding.asset === 'equity') {
        // Simplified beta estimation based on asset type
        const estimatedBeta = this.estimateBeta(holding.ticker);
        const weight = holding.value / portfolio.totalValue;
        totalBeta += estimatedBeta * weight;
        totalWeight += weight;
      }
    });

    const portfolioBeta = totalWeight > 0 ? totalBeta / totalWeight : 1.0;

    // Calculate volatility (simplified)
    const volatility = this.estimateVolatility(portfolio);

    // VaR calculation (parametric method)
    const var95 = -1.645 * volatility * portfolio.totalValue;
    const var99 = -2.326 * volatility * portfolio.totalValue;

    // Sharpe ratio (using existing portfolio data)
    const sharpe = portfolio.risk.sharpe || 1.42;

    return {
      beta: parseFloat(portfolioBeta.toFixed(2)),
      volatility: parseFloat((volatility * 100).toFixed(1)),
      var95: Math.round(var95),
      var99: Math.round(var99),
      sharpe,
      maxDrawdown: portfolio.risk.maxDrawdown || -12.4,
      portfolioValue: portfolio.totalValue
    };
  }

  /**
   * Identify portfolio risks
   * @param {Object} portfolio - Portfolio snapshot
   * @param {Object} metrics - Calculated risk metrics
   * @returns {Array} - Array of risk objects
   */
  static identifyRisks(portfolio, metrics) {
    const risks = [];

    // 1. Concentration risk
    portfolio.risk.concentrationRisks.forEach(risk => {
      if (risk.concentration > 15) {
        risks.push({
          type: 'concentration',
          severity: risk.concentration > 20 ? 'critical' : 'warning',
          ticker: risk.ticker,
          concentration: risk.concentration,
          recommendation: `Reduce ${risk.ticker} to <15% of portfolio`,
          impact: 'High single-stock risk'
        });
      }
    });

    // 2. Beta risk (market sensitivity)
    if (metrics.beta > 1.5 && portfolio.macro.indicators.find(i => i.id === 'vix')?.value > 20) {
      risks.push({
        type: 'market',
        severity: 'warning',
        beta: metrics.beta,
        vix: portfolio.macro.indicators.find(i => i.id === 'vix')?.value,
        recommendation: 'High beta + elevated VIX → consider hedges',
        impact: `Portfolio is ${((metrics.beta - 1) * 100).toFixed(0)}% more volatile than market`
      });
    }

    // 3. Correlation risk
    if (portfolio.assetAllocation.equity?.percent > 80) {
      risks.push({
        type: 'diversification',
        severity: 'warning',
        equityPercent: parseFloat(portfolio.assetAllocation.equity.percent),
        recommendation: 'Over 80% in equities — add bonds or alternatives',
        impact: 'Low diversification across asset classes'
      });
    }

    // 4. Drawdown risk
    if (metrics.maxDrawdown < -15) {
      risks.push({
        type: 'drawdown',
        severity: 'warning',
        maxDrawdown: metrics.maxDrawdown,
        recommendation: 'Deep drawdown suggests need for downside protection',
        impact: `Portfolio has experienced ${Math.abs(metrics.maxDrawdown)}% peak-to-trough decline`
      });
    }

    return risks;
  }

  /**
   * Generate hedge strategy using AI
   * @param {Object} portfolio - Portfolio snapshot
   * @param {Object} metrics - Risk metrics
   * @param {Array} risks - Identified risks
   * @returns {Promise<Array>} - Hedge recommendations
   */
  static async generateHedgeStrategy(portfolio, metrics, risks) {
    const systemPrompt = `You are a Risk Management Agent specializing in portfolio hedging strategies.

Your job: Design 3-5 specific hedges to protect the portfolio from identified risks.

Output format (JSON array only):
[
  {
    "priority": "high" | "medium" | "low",
    "action": "BUY" | "SELL" | "ADD" | "REDUCE" | "ROTATE",
    "instrument": "SPY 540P 03/21",
    "desc": "Brief description (max 10 words)",
    "rationale": "Why this hedge (max 15 words)",
    "cost": "$840",
    "impact": "Protection level (max 10 words)",
    "regime": "reflation" | "stagflation" | "riskoff" | "goldilocks" | "any"
  }
]

Rules:
- Be specific with instruments (options, futures, ETFs, inverse positions)
- Include sizing ($ amount or % of portfolio)
- Cost estimates should be realistic
- Focus on actionable, implementable hedges
- Priority: high (critical), medium (important), low (optional)
- Max 5 hedges
- Return ONLY the JSON array`;

    const prompt = `Design hedge strategies for this portfolio:

PORTFOLIO RISK METRICS:
- Value: $${portfolio.totalValue.toLocaleString()}
- Beta: ${metrics.beta} (${metrics.beta > 1 ? 'higher' : 'lower'} volatility than market)
- Volatility: ${metrics.volatility}%
- VaR (95%): $${Math.abs(metrics.var95).toLocaleString()}
- Sharpe Ratio: ${metrics.sharpe}
- Max Drawdown: ${metrics.maxDrawdown}%

IDENTIFIED RISKS:
${risks.map(r => `- ${r.type}: ${r.recommendation}`).join('\n')}

TOP HOLDINGS:
${portfolio.holdings.sort((a, b) => b.value - a.value).slice(0, 5)
  .map(h => `- ${h.ticker}: $${h.value.toLocaleString()} (${h.percentOfPortfolio}%)`).join('\n')}

MACRO REGIME:
- ${portfolio.macro.regime.name} (${portfolio.macro.regime.confidence}% confidence)
- VIX: ${portfolio.macro.indicators.find(i => i.id === 'vix')?.value}

ASSET ALLOCATION:
${Object.entries(portfolio.assetAllocation).map(([asset, data]) =>
  `- ${asset}: ${data.percent}%`).join('\n')}

Design 3-5 specific hedge strategies in JSON format. Focus on cost-effective downside protection.`;

    try {
      const response = await ClaudeService.call({
        messages: [{ role: 'user', content: prompt }],
        system: systemPrompt,
        max_tokens: 1200,
        temperature: 0.7
      });

      const hedges = ClaudeService.parseJSON(response);

      if (!hedges || !Array.isArray(hedges)) {
        console.error('[RiskAgent] Failed to parse AI response');
        return this.getFallbackHedges(portfolio, metrics, risks);
      }

      // Add metadata
      return hedges.map((hedge, idx) => ({
        id: idx + 1,
        ...hedge,
        emoji: this.getEmojiForAction(hedge.action),
        expiresIn: this.getExpiration(hedge.priority),
        expiresUnit: this.getExpirationUnit(hedge.priority),
        totalDuration: this.getTotalDuration(hedge.priority)
      }));
    } catch (error) {
      console.error('[RiskAgent] Hedge generation failed:', error);
      return this.getFallbackHedges(portfolio, metrics, risks);
    }
  }

  /**
   * Fallback hedges if AI fails
   * @param {Object} portfolio
   * @param {Object} metrics
   * @param {Array} risks
   * @returns {Array} - Basic hedge recommendations
   */
  static getFallbackHedges(portfolio, metrics, risks) {
    const hedges = [];

    // Basic put protection if high beta
    if (metrics.beta > 1.3) {
      hedges.push({
        id: 1,
        priority: 'high',
        action: 'BUY',
        instrument: 'SPY Put 5% OTM',
        desc: 'Tail risk protection',
        rationale: 'High beta portfolio needs downside hedge',
        cost: `$${Math.round(portfolio.totalValue * 0.02)}`,
        impact: 'Caps loss at -8%',
        regime: 'any',
        emoji: '🛡️',
        expiresIn: 4,
        expiresUnit: 'hrs',
        totalDuration: 24
      });
    }

    // Gold hedge for inflation regimes
    if (portfolio.macro.regime.name === 'Reflation' || portfolio.macro.regime.name === 'Stagflation') {
      hedges.push({
        id: 2,
        priority: 'high',
        action: 'ADD',
        instrument: 'GLD / Gold Futures',
        desc: 'Inflation hedge',
        rationale: 'Gold outperforms in reflationary environments',
        cost: `$${Math.round(portfolio.totalValue * 0.05)}`,
        impact: '+2-3% if inflation spikes',
        regime: 'reflation',
        emoji: '🥇',
        expiresIn: 18,
        expiresUnit: 'hrs',
        totalDuration: 48
      });
    }

    return hedges;
  }

  /**
   * Estimate beta for common tickers
   * @param {string} ticker
   * @returns {number} - Estimated beta
   */
  static estimateBeta(ticker) {
    const betaMap = {
      'NVDA': 1.8, 'AMD': 1.7, 'TSLA': 2.1, 'AAPL': 1.2, 'MSFT': 1.1,
      'GOOGL': 1.1, 'AMZN': 1.3, 'META': 1.2, 'JPM': 1.2, 'XOM': 0.9,
      'CVX': 0.9, 'GLD': 0.1, 'TLT': -0.2, 'JNJ': 0.7, 'PG': 0.6
    };
    return betaMap[ticker] || 1.0;
  }

  /**
   * Estimate portfolio volatility
   * @param {Object} portfolio
   * @returns {number} - Volatility (decimal)
   */
  static estimateVolatility(portfolio) {
    // Simplified: use asset allocation to estimate
    const equityPct = parseFloat(portfolio.assetAllocation.equity?.percent || 70) / 100;
    const bondPct = parseFloat(portfolio.assetAllocation.bond?.percent || 20) / 100;
    const optionPct = parseFloat(portfolio.assetAllocation.option?.percent || 5) / 100;

    const vol = (equityPct * 0.20) + (bondPct * 0.05) + (optionPct * 0.40);
    return vol;
  }

  static getEmojiForAction(action) {
    const map = { 'BUY': '🛡️', 'ADD': '🥇', 'REDUCE': '✂️', 'ROTATE': '🔄', 'SELL': '🔻' };
    return map[action] || '📊';
  }

  static getExpiration(priority) {
    return priority === 'high' ? 4 : (priority === 'medium' ? 2 : 5);
  }

  static getExpirationUnit(priority) {
    return priority === 'high' ? 'hrs' : (priority === 'medium' ? 'days' : 'days');
  }

  static getTotalDuration(priority) {
    return priority === 'high' ? 24 : (priority === 'medium' ? 72 : 168);
  }
}
