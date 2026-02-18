// Cost Monitor Service
// Tracks API usage and enforces budget caps

export class CostMonitor {
  static DAILY_BUDGET = 0.50; // $0.50/day = $15/month (buffer above $10 target)
  static AVG_COST_PER_CALL = 0.01; // Average cost per agent run

  /**
   * Check if execution is allowed within budget
   * @returns {boolean} - True if can execute
   */
  static canExecute() {
    const usage = this.getTodayUsage();
    const estimatedCost = usage.calls * this.AVG_COST_PER_CALL;

    if (estimatedCost >= this.DAILY_BUDGET) {
      console.warn('[CostMonitor] Daily budget exceeded, using cached data only');
      console.warn(`[CostMonitor] Today: ${usage.calls} calls, $${estimatedCost.toFixed(2)} spent`);
      return false;
    }

    // Warn at 80% of budget
    if (estimatedCost >= this.DAILY_BUDGET * 0.8) {
      console.warn(`[CostMonitor] Approaching budget limit: $${estimatedCost.toFixed(2)} / $${this.DAILY_BUDGET}`);
    }

    return true;
  }

  /**
   * Record an API call
   * @param {number} cost - Actual cost (optional)
   */
  static recordCall(cost = this.AVG_COST_PER_CALL) {
    const usage = this.getTodayUsage();
    usage.calls++;
    usage.cost += cost;

    localStorage.setItem('agent_usage', JSON.stringify(usage));

    console.log(`[CostMonitor] Recorded call #${usage.calls} ($${usage.cost.toFixed(3)} total today)`);

    // Check if approaching limit
    if (usage.cost >= this.DAILY_BUDGET * 0.9) {
      console.warn(`[CostMonitor] ⚠️ WARNING: Approaching daily budget! $${usage.cost.toFixed(2)} / $${this.DAILY_BUDGET}`);
    }
  }

  /**
   * Get today's usage statistics
   * @returns {Object} - Usage object with date, calls, cost
   */
  static getTodayUsage() {
    try {
      const stored = localStorage.getItem('agent_usage');
      const usage = stored ? JSON.parse(stored) : { date: null, calls: 0, cost: 0 };

      const today = new Date().toDateString();

      // Reset if new day
      if (usage.date !== today) {
        const newUsage = { date: today, calls: 0, cost: 0 };
        localStorage.setItem('agent_usage', JSON.stringify(newUsage));
        return newUsage;
      }

      return usage;
    } catch (error) {
      console.error('[CostMonitor] Failed to get usage:', error);
      return { date: new Date().toDateString(), calls: 0, cost: 0 };
    }
  }

  /**
   * Get usage statistics
   * @returns {Object} - Detailed usage stats
   */
  static getStats() {
    const usage = this.getTodayUsage();

    return {
      date: usage.date,
      calls: usage.calls,
      cost: usage.cost,
      budget: this.DAILY_BUDGET,
      remaining: Math.max(0, this.DAILY_BUDGET - usage.cost),
      percentUsed: Math.round((usage.cost / this.DAILY_BUDGET) * 100),
      canExecute: this.canExecute()
    };
  }

  /**
   * Reset today's usage (for testing)
   */
  static reset() {
    const today = new Date().toDateString();
    const newUsage = { date: today, calls: 0, cost: 0 };
    localStorage.setItem('agent_usage', JSON.stringify(newUsage));
    console.log('[CostMonitor] Usage reset');
  }

  /**
   * Get monthly projection based on current usage
   * @returns {Object} - Monthly projection
   */
  static getMonthlyProjection() {
    const usage = this.getTodayUsage();

    // Simple projection: today's cost * 30 days
    const projectedMonthlyCost = usage.cost * 30;

    return {
      todayCost: usage.cost,
      projectedMonthlyCost,
      withinBudget: projectedMonthlyCost <= 10, // $10/month target
      budgetTarget: 10
    };
  }
}
