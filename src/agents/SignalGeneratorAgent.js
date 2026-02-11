// Signal Generator Agent
// Generates trade signals (BUY/SELL/HOLD/TRIM) using hybrid rule-based + AI approach

import { ClaudeService } from '../services/claudeService';
import { AgentMemory } from '../services/agentMemory';

export class SignalGeneratorAgent {
  /**
   * Analyze portfolio and generate trade signals
   * @param {Object} portfolio - Portfolio snapshot from portfolioService
   * @returns {Promise<Array>} - Array of signal objects
   */
  static async analyze(portfolio) {
    // Generate cache key based on portfolio state
    const cacheKey = AgentMemory.generateKey('signals', {
      holdings: portfolio.holdings.map(h => `${h.ticker}:${h.current}`).join(','),
      regime: portfolio.macro.regime.name
    });

    // Check cache first (30 min TTL)
    const cached = AgentMemory.getCached(cacheKey, 30 * 60 * 1000);
    if (cached) {
      console.log('[SignalGeneratorAgent] Returning cached signals');
      return cached;
    }

    console.log('[SignalGeneratorAgent] Generating fresh signals...');

    // Always run rule-based checks (fast, free)
    const ruleBasedSignals = this.generateRuleBasedSignals(portfolio);

    // Decide if we need AI enhancement
    const needsAI = this.shouldUseAI(portfolio, ruleBasedSignals);

    let finalSignals = ruleBasedSignals;

    if (needsAI) {
      console.log('[SignalGeneratorAgent] Using AI for complex analysis...');
      const aiSignals = await this.generateAISignals(portfolio, ruleBasedSignals);
      if (aiSignals && aiSignals.length > 0) {
        // Merge AI signals with rule-based (AI takes priority)
        finalSignals = this.mergeSignals(ruleBasedSignals, aiSignals);
      }
    }

    // Cache results
    AgentMemory.set(cacheKey, finalSignals);

    return finalSignals;
  }

  /**
   * Generate signals using rule-based logic (fast, deterministic)
   * @param {Object} portfolio - Portfolio snapshot
   * @returns {Array} - Array of signals
   */
  static generateRuleBasedSignals(portfolio) {
    const signals = [];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Rule 1: Concentration risk - TRIM if position >15% of portfolio
    portfolio.holdings.forEach(holding => {
      const concentration = parseFloat(holding.percentOfPortfolio);
      if (concentration > 15) {
        signals.push({
          id: signals.length + 1,
          time: timeStr,
          type: 'rebalance',
          signal: 'TRIM',
          ticker: holding.ticker,
          name: holding.name,
          reason: `Position = ${concentration.toFixed(1)}% of portfolio — concentration risk`,
          strength: Math.min(95, 70 + Math.round(concentration - 15)),
          basket: holding.basket,
          status: 'pending',
          emoji: '⚖️',
          source: 'rule'
        });
      }
    });

    // Rule 2: Large unrealized losses - SELL or HOLD
    portfolio.holdings.forEach(holding => {
      const plPercent = ((holding.current - holding.avgCost) / holding.avgCost) * 100;
      if (plPercent < -20 && holding.asset === 'equity') {
        signals.push({
          id: signals.length + 1,
          time: timeStr,
          type: 'rebalance',
          signal: 'SELL',
          ticker: holding.ticker,
          name: holding.name,
          reason: `Down ${Math.abs(plPercent).toFixed(1)}% — cut losses or reassess thesis`,
          strength: Math.min(90, 60 + Math.abs(plPercent)),
          basket: holding.basket,
          status: 'review',
          emoji: '🔻',
          source: 'rule'
        });
      }
    });

    // Rule 3: Strong performance - consider TRIM for rebalancing
    portfolio.holdings.forEach(holding => {
      const plPercent = ((holding.current - holding.avgCost) / holding.avgCost) * 100;
      if (plPercent > 80 && holding.asset === 'equity') {
        signals.push({
          id: signals.length + 1,
          time: timeStr,
          type: 'rebalance',
          signal: 'TRIM',
          ticker: holding.ticker,
          name: holding.name,
          reason: `Up ${plPercent.toFixed(1)}% — consider taking profits`,
          strength: 65,
          basket: holding.basket,
          status: 'review',
          emoji: '💰',
          source: 'rule'
        });
      }
    });

    // Rule 4: Macro regime signals
    if (portfolio.macro.regime.name === 'Reflation' || portfolio.macro.regime.name === 'Stagflation') {
      // Check if portfolio has energy exposure
      const hasEnergy = portfolio.holdings.some(h =>
        ['XOM', 'CVX', 'CL', 'USO'].includes(h.ticker)
      );

      if (!hasEnergy) {
        signals.push({
          id: signals.length + 1,
          time: timeStr,
          type: 'macro',
          signal: 'BUY',
          ticker: 'XOM',
          name: 'Exxon Mobil',
          reason: `${portfolio.macro.regime.name} regime favors energy — add inflation hedge`,
          strength: 75,
          basket: 'New: Inflation',
          status: 'pending',
          emoji: '🛢️',
          source: 'rule'
        });
      }
    }

    if (portfolio.macro.regime.name === 'Risk-Off') {
      // Suggest defensive positions
      const hasDefensive = portfolio.holdings.some(h =>
        ['TLT', 'GLD', 'VNQ'].includes(h.ticker)
      );

      if (!hasDefensive) {
        signals.push({
          id: signals.length + 1,
          time: timeStr,
          type: 'macro',
          signal: 'BUY',
          ticker: 'TLT',
          name: '20+ Year Treasury ETF',
          reason: 'Risk-Off regime — flight to duration',
          strength: 82,
          basket: 'New: Rate Hedge',
          status: 'pending',
          emoji: '🏦',
          source: 'rule'
        });
      }
    }

    // Limit to top 5 signals by strength
    return signals
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 5);
  }

  /**
   * Determine if AI analysis is needed
   * @param {Object} portfolio - Portfolio snapshot
   * @param {Array} ruleSignals - Rule-based signals
   * @returns {boolean} - True if AI should be used
   */
  static shouldUseAI(portfolio, ruleSignals) {
    // Use AI if:
    // 1. Portfolio has very few holdings (<5) - need broader suggestions
    // 2. No strong rule-based signals generated
    // 3. Portfolio changed significantly (would need external tracking)
    // 4. Complex macro environment (multiple conflicting signals)

    if (portfolio.holdingsCount < 5) {
      return true; // Small portfolio needs AI for better suggestions
    }

    if (ruleSignals.length === 0) {
      return true; // No rule-based signals, need AI insights
    }

    // Check for conflicting macro signals
    const bullishCount = portfolio.macro.indicators.filter(i => i.signal === 'bullish').length;
    const bearishCount = portfolio.macro.indicators.filter(i => i.signal === 'bearish').length;

    if (Math.abs(bullishCount - bearishCount) <= 1) {
      return true; // Mixed signals, need AI analysis
    }

    return false; // Rule-based is sufficient
  }

  /**
   * Generate signals using AI (Claude API)
   * @param {Object} portfolio - Portfolio snapshot
   * @param {Array} ruleSignals - Existing rule-based signals
   * @returns {Promise<Array>} - Array of AI-generated signals
   */
  static async generateAISignals(portfolio, ruleSignals) {
    const systemPrompt = `You are a Trade Signal Generator for a macro-driven portfolio management system.

Your job: Analyze the portfolio and generate 3-5 actionable trade signals.

Output format (JSON array only, no explanations):
[
  {
    "signal": "BUY" | "SELL" | "HOLD" | "TRIM",
    "ticker": "AAPL",
    "name": "Apple Inc.",
    "reason": "Brief reason (max 10 words)",
    "strength": 85,
    "basket": "Which basket to add/trim from",
    "type": "macro" | "earnings" | "rebalance"
  }
]

Rules:
- Signals must be specific (ticker + action + reason)
- Strength 0-100 (>80 = high conviction, 60-80 = medium, <60 = low)
- Consider current macro regime and portfolio concentration
- Max 5 signals per run
- Focus on actionable, timely opportunities
- Do NOT repeat signals already identified by rules
- Return ONLY the JSON array, no markdown or explanations`;

    const prompt = `Analyze this portfolio and generate 3-5 specific trade signals:

PORTFOLIO SUMMARY:
- Total Value: $${portfolio.totalValue.toLocaleString()}
- Holdings: ${portfolio.holdingsCount} positions across ${portfolio.basketCount} baskets
- Total P&L: ${portfolio.totalPLPercent}%

TOP HOLDINGS:
${portfolio.holdings
  .sort((a, b) => b.value - a.value)
  .slice(0, 8)
  .map(h => `- ${h.ticker} (${h.name}): $${h.value.toLocaleString()} | ${h.percentOfPortfolio}% of portfolio | ${h.change > 0 ? '+' : ''}${h.change}%`)
  .join('\n')}

MACRO REGIME:
- ${portfolio.macro.regime.emoji} ${portfolio.macro.regime.name} (${portfolio.macro.regime.confidence}% confidence)
- ${portfolio.macro.regime.desc}

KEY INDICATORS:
${portfolio.macro.indicators.slice(0, 5).map(ind => `- ${ind.name}: ${ind.value}${ind.unit} (${ind.trend}, ${ind.signal})`).join('\n')}

RECENT NEWS:
${portfolio.macro.recentNews.slice(0, 3).map(news => `- ${news.headline.substring(0, 80)}...`).join('\n')}

RULE-BASED SIGNALS ALREADY IDENTIFIED:
${ruleSignals.map(s => `- ${s.signal} ${s.ticker}: ${s.reason}`).join('\n')}

Current date: ${new Date().toLocaleDateString()}

Generate 3-5 NEW trade signals in JSON format. Focus on opportunities NOT already covered by rule-based signals.`;

    try {
      const response = await ClaudeService.call({
        messages: [{ role: 'user', content: prompt }],
        system: systemPrompt,
        max_tokens: 1500,
        temperature: 0.7
      });

      const signals = ClaudeService.parseJSON(response);

      if (!signals || !Array.isArray(signals)) {
        console.error('[SignalGeneratorAgent] Failed to parse AI response as JSON array');
        return [];
      }

      // Add metadata
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      return signals.map((sig, idx) => ({
        id: ruleSignals.length + idx + 1,
        time: timeStr,
        type: sig.type || 'macro',
        signal: sig.signal,
        ticker: sig.ticker,
        name: sig.name,
        reason: sig.reason,
        strength: sig.strength || 70,
        basket: sig.basket || 'Portfolio',
        status: 'pending',
        emoji: this.getEmojiForSignal(sig.signal),
        source: 'ai'
      }));
    } catch (error) {
      console.error('[SignalGeneratorAgent] AI signal generation failed:', error);
      return [];
    }
  }

  /**
   * Merge rule-based and AI signals, removing duplicates
   * @param {Array} ruleSignals - Rule-based signals
   * @param {Array} aiSignals - AI-generated signals
   * @returns {Array} - Merged signals
   */
  static mergeSignals(ruleSignals, aiSignals) {
    // Remove AI signals that duplicate tickers from rule signals
    const ruleTickers = new Set(ruleSignals.map(s => s.ticker));
    const uniqueAI = aiSignals.filter(s => !ruleTickers.has(s.ticker));

    // Combine and sort by strength
    const merged = [...ruleSignals, ...uniqueAI]
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 5); // Keep top 5

    // Re-number IDs
    return merged.map((sig, idx) => ({ ...sig, id: idx + 1 }));
  }

  /**
   * Get emoji for signal type
   * @param {string} signal - Signal type (BUY/SELL/HOLD/TRIM)
   * @returns {string} - Emoji
   */
  static getEmojiForSignal(signal) {
    const emojiMap = {
      'BUY': '📈',
      'SELL': '🔻',
      'HOLD': '⏳',
      'TRIM': '⚖️'
    };
    return emojiMap[signal] || '📊';
  }
}
