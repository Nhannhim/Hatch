// Macro Agent
// Enhanced macro regime detection + forward outlook using hybrid rule-based + AI

import { ClaudeService } from '../services/claudeService';
import { AgentMemory } from '../services/agentMemory';
import { detectRegime } from '../data/mockData';

export class MacroAgent {
  /**
   * Analyze macro environment and generate outlook
   * @param {Object} macroData - Macro indicators and regime data
   * @returns {Promise<Object>} - Regime analysis and outlook
   */
  static async analyze(macroData) {
    // Generate cache key
    const cacheKey = AgentMemory.generateKey('macro', {
      indicators: macroData.indicators.map(i => `${i.id}:${i.value}`).join(',')
    });

    // Check cache (60 min TTL - macro changes slowly)
    const cached = AgentMemory.getCached(cacheKey, 60 * 60 * 1000);
    if (cached) {
      console.log('[MacroAgent] Returning cached macro analysis');
      return cached;
    }

    console.log('[MacroAgent] Generating fresh macro analysis...');

    // Always run rule-based regime detection (fast, free)
    const regime = this.detectEnhancedRegime(macroData.indicators);

    // Use AI for forward-looking outlook (runs every 6 hours based on trigger)
    console.log('[MacroAgent] Using AI for forward outlook...');
    const outlook = await this.generateOutlook(macroData, regime);

    const result = {
      regime,
      outlook: outlook?.outlook || regime.playbook,
      playbook: outlook?.playbook || [],
      confidence: regime.confidence,
      timestamp: new Date().toISOString()
    };

    // Cache results
    AgentMemory.set(cacheKey, result);

    return result;
  }

  /**
   * Enhanced regime detection (extends existing detectRegime function)
   * @param {Array} indicators - Macro indicators
   * @returns {Object} - Regime object with enhanced data
   */
  static detectEnhancedRegime(indicators) {
    // Start with existing rule-based detection
    const baseRegime = detectRegime(indicators);

    // Add additional factors for more nuanced detection
    const gdp = indicators.find(i => i.id === 'gdp');
    const cpi = indicators.find(i => i.id === 'cpi');
    const pmi = indicators.find(i => i.id === 'pmi');
    const vix = indicators.find(i => i.id === 'vix');
    const yield10y = indicators.find(i => i.id === 'yield10y');
    const unemployment = indicators.find(i => i.id === 'unemployment');

    // Calculate composite scores
    const growthScore = (
      (gdp.value > 2 ? 2 : 0) +
      (pmi.value > 50 ? 2 : 0) +
      (unemployment.value < 4 ? 1 : 0)
    );

    const inflationScore = (
      (cpi.value > 3 ? 2 : 0) +
      (cpi.value > 4 ? 1 : 0) +
      (yield10y.value > 4.5 ? 1 : 0)
    );

    const riskScore = (
      (vix.value > 20 ? 1 : 0) +
      (vix.value > 25 ? 1 : 0) +
      (unemployment.trend === 'up' ? 1 : 0)
    );

    // Enhance confidence based on signal strength
    let enhancedConfidence = baseRegime.confidence;

    // Strong growth + low inflation = high confidence Goldilocks
    if (baseRegime.name === 'Goldilocks' && growthScore >= 4 && inflationScore <= 1) {
      enhancedConfidence = Math.min(95, baseRegime.confidence + 15);
    }

    // Rising inflation + slowing growth = high confidence Stagflation
    if (baseRegime.name === 'Stagflation' && inflationScore >= 2 && growthScore <= 2) {
      enhancedConfidence = Math.min(90, baseRegime.confidence + 10);
    }

    // High VIX + weak growth = high confidence Risk-Off
    if (baseRegime.name === 'Risk-Off' && riskScore >= 2 && growthScore <= 1) {
      enhancedConfidence = Math.min(92, baseRegime.confidence + 12);
    }

    return {
      ...baseRegime,
      confidence: enhancedConfidence,
      scores: {
        growth: growthScore,
        inflation: inflationScore,
        risk: riskScore
      },
      keyDrivers: this.identifyKeyDrivers(indicators, baseRegime)
    };
  }

  /**
   * Identify key drivers of current regime
   * @param {Array} indicators
   * @param {Object} regime
   * @returns {Array} - Key driver descriptions
   */
  static identifyKeyDrivers(indicators, regime) {
    const drivers = [];

    indicators.forEach(ind => {
      if (ind.trend === 'up' && ind.signal === 'bullish') {
        drivers.push(`${ind.name} rising (bullish signal)`);
      } else if (ind.trend === 'up' && ind.signal === 'bearish') {
        drivers.push(`${ind.name} rising (bearish signal)`);
      }
    });

    return drivers.slice(0, 3); // Top 3 drivers
  }

  /**
   * Generate forward-looking outlook using AI
   * @param {Object} macroData
   * @param {Object} regime
   * @returns {Promise<Object|null>} - Outlook and playbook
   */
  static async generateOutlook(macroData, regime) {
    const systemPrompt = `You are a Macro Analyst specializing in economic regime analysis and forward-looking forecasts.

Your job: Provide a 6-month macro outlook and actionable playbook.

Output format (JSON object only):
{
  "outlook": "2-3 sentence narrative outlook for next 6 months",
  "playbook": [
    "Actionable recommendation 1 (max 12 words)",
    "Actionable recommendation 2 (max 12 words)",
    "Actionable recommendation 3 (max 12 words)"
  ],
  "confidence": 75
}

Rules:
- Outlook should be specific and data-driven
- Playbook should have 3-5 actionable items
- Confidence 0-100 based on signal clarity
- Focus on portfolio positioning implications
- Return ONLY the JSON object`;

    const prompt = `Analyze macro environment and provide 6-month outlook:

CURRENT REGIME:
- ${regime.name} (${regime.confidence}% confidence)
- ${regime.desc}

KEY INDICATORS:
${macroData.indicators.map(ind =>
  `- ${ind.name}: ${ind.value}${ind.unit} (${ind.trend}, ${ind.signal}, prev: ${ind.prev}${ind.unit})`
).join('\n')}

REGIME SCORES:
- Growth Score: ${regime.scores.growth}/5
- Inflation Score: ${regime.scores.inflation}/4
- Risk Score: ${regime.scores.risk}/3

KEY DRIVERS:
${regime.keyDrivers.map(d => `- ${d}`).join('\n')}

RECENT ALERTS:
${macroData.alerts.slice(0, 3).map(a => `- ${a.title}: ${a.summary}`).join('\n')}

Current date: February 10, 2026

Provide 6-month outlook and portfolio playbook in JSON format.`;

    try {
      const response = await ClaudeService.call({
        messages: [{ role: 'user', content: prompt }],
        system: systemPrompt,
        max_tokens: 800,
        temperature: 0.6
      });

      const result = ClaudeService.parseJSON(response);

      if (!result || !result.outlook) {
        console.error('[MacroAgent] Failed to parse AI response');
        return null;
      }

      return result;
    } catch (error) {
      console.error('[MacroAgent] Outlook generation failed:', error);
      return null;
    }
  }
}
