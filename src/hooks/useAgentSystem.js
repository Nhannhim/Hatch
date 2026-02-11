// useAgentSystem Hook
// React integration hook - manages agent state and triggers

import { useState, useEffect, useCallback, useRef } from 'react';
import { AgentOrchestrator } from '../agents/AgentOrchestrator';
import { PortfolioService } from '../services/portfolioService';
import { tradeSignals, hedgeRecommendations, currentRegime } from '../data/mockData';

export function useAgentSystem() {
  // Agent state
  const [agentState, setAgentState] = useState({
    signals: tradeSignals,           // Static fallback
    hedges: hedgeRecommendations,    // Static fallback
    regime: currentRegime,            // Static fallback
    lastUpdate: null,
    isRunning: false,
    error: null
  });

  // Agent history (last 20 runs)
  const [agentHistory, setAgentHistory] = useState([]);

  // Track previous portfolio value for change detection
  const previousValueRef = useRef(null);

  // Track last scheduled run time
  const lastScheduledRunRef = useRef(null);

  // Track if page load trigger has fired
  const pageLoadFiredRef = useRef(false);

  /**
   * Run agents with specified trigger type
   * @param {string} triggerType - Type of trigger
   * @returns {Promise} - Agent results
   */
  const runAgents = useCallback(async (triggerType = 'manual') => {
    setAgentState(prev => ({ ...prev, isRunning: true, error: null }));

    console.log(`[useAgentSystem] Running agents: ${triggerType}`);

    try {
      const portfolio = PortfolioService.getSnapshot();
      const results = await AgentOrchestrator.run({ portfolio, triggerType });

      // Update state with results (use fallbacks if agent failed)
      setAgentState({
        signals: results.signals || tradeSignals,
        hedges: results.hedges || hedgeRecommendations,
        regime: results.regime || currentRegime,
        riskMetrics: results.riskMetrics,
        risks: results.risks,
        macroOutlook: results.macroOutlook,
        macroPlaybook: results.macroPlaybook,
        lastUpdate: new Date(),
        isRunning: false,
        error: results.errors.length > 0 ? `Some agents failed: ${results.errors.map(e => e.agent).join(', ')}` : null,
        executionTime: results.executionTime
      });

      // Add to history
      setAgentHistory(prev => {
        const newHistory = [
          {
            timestamp: new Date(),
            triggerType,
            results,
            executionTime: results.executionTime
          },
          ...prev
        ].slice(0, 20); // Keep last 20
        return newHistory;
      });

      // Update last scheduled run time if this was a scheduled trigger
      if (triggerType === 'scheduled_6h') {
        lastScheduledRunRef.current = Date.now();
      }

      return results;
    } catch (error) {
      console.error('[useAgentSystem] Agent execution failed:', error);

      setAgentState(prev => ({
        ...prev,
        isRunning: false,
        error: error.message || 'Agent execution failed'
      }));

      throw error;
    }
  }, []);

  /**
   * Calculate portfolio change percentage
   * @returns {number} - Change percentage
   */
  const getPortfolioChange = useCallback(() => {
    const currentValue = PortfolioService.getTotalValue();

    if (previousValueRef.current === null) {
      previousValueRef.current = currentValue;
      return 0;
    }

    const change = PortfolioService.calculateChange(previousValueRef.current, currentValue);
    previousValueRef.current = currentValue;

    return change;
  }, []);

  // ========== AUTOMATIC TRIGGERS ==========

  // Trigger 1: Page load (runs once on mount)
  useEffect(() => {
    if (!pageLoadFiredRef.current) {
      console.log('[useAgentSystem] Page load trigger');
      runAgents('page_load');
      pageLoadFiredRef.current = true;
    }
  }, [runAgents]);

  // Trigger 2: Portfolio change detection (debounced)
  useEffect(() => {
    // Set up interval to check portfolio changes every 30 seconds
    const interval = setInterval(() => {
      const change = getPortfolioChange();

      if (change > 3) {
        console.log(`[useAgentSystem] Portfolio changed by ${change.toFixed(1)}% - triggering agents`);
        runAgents('portfolio_change');
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [runAgents, getPortfolioChange]);

  // Trigger 3: Scheduled refresh every 6 hours
  useEffect(() => {
    const interval = setInterval(() => {
      // Check if we should run (hasn't run in last 5.5 hours)
      const shouldRun = AgentOrchestrator.shouldRun('scheduled_6h', {
        lastScheduledRun: lastScheduledRunRef.current
      });

      if (shouldRun) {
        console.log('[useAgentSystem] Scheduled 6h trigger');
        runAgents('scheduled_6h');
      }
    }, 6 * 60 * 60 * 1000); // Every 6 hours

    return () => clearInterval(interval);
  }, [runAgents]);

  // Return hook API
  return {
    // Current agent state
    agentState,

    // Functions
    runAgents,

    // History
    agentHistory,

    // Status flags
    isRunning: agentState.isRunning,
    hasAIData: agentState.lastUpdate !== null,
    hasError: agentState.error !== null,

    // Helpers
    getLastUpdate: () => agentState.lastUpdate,
    getExecutionTime: () => agentState.executionTime,
    clearError: () => setAgentState(prev => ({ ...prev, error: null }))
  };
}
