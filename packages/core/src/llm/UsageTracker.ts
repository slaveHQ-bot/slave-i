import { calculateCost } from './ModelPricing';

export interface UsageRecord {
  taskId: string;
  model: string;
  providerId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  latencyMs: number;
  timestamp: number;
}

/**
 * In-memory usage tracker that accumulates per-session stats.
 * Persisted summaries should be stored in the DB via IPC.
 */
export class UsageTracker {
  private static instance: UsageTracker;
  private records: UsageRecord[] = [];

  public static getInstance(): UsageTracker {
    if (!UsageTracker.instance) {
      UsageTracker.instance = new UsageTracker();
    }
    return UsageTracker.instance;
  }

  record(entry: Omit<UsageRecord, 'estimatedCostUsd' | 'timestamp'>): void {
    const estimatedCostUsd = calculateCost(entry.model, entry.promptTokens, entry.completionTokens);
    this.records.push({
      ...entry,
      estimatedCostUsd,
      timestamp: Date.now(),
    });
    // Keep last 1000 records in memory
    if (this.records.length > 1000) this.records.shift();
  }

  getSessionStats() {
    const totalTokens = this.records.reduce((s, r) => s + r.totalTokens, 0);
    const totalCostUsd = this.records.reduce((s, r) => s + r.estimatedCostUsd, 0);
    const byModel: Record<string, { tokens: number; cost: number; requests: number }> = {};
    for (const r of this.records) {
      if (!byModel[r.model]) byModel[r.model] = { tokens: 0, cost: 0, requests: 0 };
      byModel[r.model].tokens += r.totalTokens;
      byModel[r.model].cost   += r.estimatedCostUsd;
      byModel[r.model].requests++;
    }
    return { totalTokens, totalCostUsd, byModel, requestCount: this.records.length };
  }

  getRecentRecords(limit = 50): UsageRecord[] {
    return this.records.slice(-limit).reverse();
  }

  clear(): void {
    this.records = [];
  }
}
