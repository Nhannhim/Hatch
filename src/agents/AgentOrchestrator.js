// Agent Orchestrator
// Coordinates multiple agents, handles triggers, manages parallel execution

import { SignalGeneratorAgent } from './SignalGeneratorAgent';
import { RiskAgent } from './RiskAgent';
import { MacroAgent } from './MacroAgent';
import { PortfolioService } from '../services/portfolioService';

export class AgentOrchestrator {
  /**
   * Run agents based on trigger type
   * @param {Object} options
   * @param {Object} options.portfolio - Portfolio snapshot (optional, will fetch if not provided)
   * @param {string} options.triggerType - Type of trigger ('page_load', 'portfolio_change', 'scheduled_6h', 'manual')
   * @returns {Promise<Object>} - Aggregated agent results
   */
  static async run({ portfolio, triggerType = 'manual' }) {
    console.log(`[AgentOrchestrator] Running agents for trigger: ${triggerType}`);

    // Get portfolio snapshot if not provided
    if (!portfolio) {
      portfolio = PortfolioService.getSnapshot();
    }

    // Determine which agents to run based on trigger type
    const config = this.getExecutionConfig(triggerType);

    console.log(`[AgentOrchestrator] Execution config:`, config);

    // Track start time
    const startTime = Date.now();

    // Run agents in parallel using Promise.all
    const agentPromises = [];

    if (config.runSignals) {
      agentPromises.push(
        SignalGeneratorAgent.analyze(portfolio)
          .then(result => ({ agent: 'signals', data: result }))
          .catch(error => {
            console.error('[AgentOrchestrator] SignalGeneratorAgent failed:', error);
            return { agent: 'signals', data: null, error: error.message };
          })
      );
    }

    if (config.runRisk) {
      agentPromises.push(
        RiskAgent.analyze(portfolio)
          .then(result => ({ agent: 'risk', data: result }))
          .catch(error => {
            console.error('[AgentOrchestrator] RiskAgent failed:', error);
            return { agent: 'risk', data: null, error: error.message };
          })
      );
    }

    if (config.runMacro) {
      agentPromises.push(
        MacroAgent.analyze(portfolio.macro)
          .then(result => ({ agent: 'macro', data: result }))
          .catch(error => {
            console.error('[AgentOrchestrator] MacroAgent failed:', error);
            return { agent: 'macro', data: null, error: error.message };
          })
      );
    }

    // Wait for all agents to complete
    const agentResults = await Promise.all(agentPromises);

    // Calculate execution time
    const executionTime = Date.now() - startTime;

    console.log(`[AgentOrchestrator] All agents completed in ${executionTime}ms`);

    // Aggregate results
    const aggregated = this.aggregateResults(agentResults, triggerType);

    aggregated.executionTime = executionTime;

    return aggregated;
  }

  /**
   * Get execution configuration for trigger type
   * @param {string} triggerType
   * @returns {Object} - Config specifying which agents to run
   */
  static getExecutionConfig(triggerType) {
    const configs = {
      // Cheap initial load - only macro regime detection
      'page_load': {
        runSignals: false,
        runRisk: false,
        runMacro: true
      },

      // Full analysis on portfolio changes
      'portfolio_change': {
        runSignals: true,
        runRisk: true,
        runMacro: false  // Macro doesn't change with portfolio
      },

      // Scheduled refresh - signals + macro outlook
      'scheduled_6h': {
        runSignals: true,
        runRisk: false,  // Risk is relatively stable
        runMacro: true
      },

      // Manual refresh - everything
      'manual': {
        runSignals: true,
        runRisk: true,
        runMacro: true
      }
    };

    return configs[triggerType] || configs.manual;
  }

  /**
   * Aggregate results from multiple agents
   * @param {Array} agentResults - Results from agents
   * @param {string} triggerType - Trigger type
   * @returns {Object} - Aggregated results
   */
  static aggregateResults(agentResults, triggerType) {
    const result = {
      signals: null,
      hedges: null,
      regime: null,
      errors: [],
      triggerType,
      timestamp: new Date().toISOString()
    };

    agentResults.forEach(({ agent, data, error }) => {
      if (error) {
        result.errors.push({ agent, error });
        return;
      }

      switch (agent) {
        case 'signals':
          result.signals = data;
          break;

        case 'risk':
          result.hedges = data?.hedges || [];
          result.riskMetrics = data?.metrics || null;
          result.risks = data?.risks || [];
          break;

        case 'macro':
          result.regime = data?.regime || null;
          result.macroOutlook = data?.outlook || null;
          result.macroPlaybook = data?.playbook || [];
          break;
      }
    });

    return result;
  }

  /**
   * Check if agents should run based on conditions
   * @param {string} triggerType
   * @param {Object} options - Additional options (e.g., portfolioChange)
   * @returns {boolean} - True if agents should run
   */
  static shouldRun(triggerType, options = {}) {
    switch (triggerType) {
      case 'page_load':
        return true; // Always run on page load

      case 'portfolio_change':
        // Only run if change is >3%
        return options.portfolioChange && options.portfolioChange > 3;

      case 'scheduled_6h':
        // Check if last run was >5.5 hours ago
        const lastRun = options.lastScheduledRun;
        if (!lastRun) return true;
        const hoursSinceLastRun = (Date.now() - lastRun) / (1000 * 60 * 60);
        return hoursSinceLastRun >= 5.5;

      case 'manual':
        return true; // Always run on manual trigger

      default:
        return false;
    }
  }
}
