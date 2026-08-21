import { getDb, automations } from '../db';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';
import { CronExpressionParser } from 'cron-parser';

export class AutomationManager {
  private static instance: AutomationManager;
  private interval: NodeJS.Timeout | null = null;
  private running = false;
  private onTriggerIntent?: (intent: string) => void;

  private constructor() {}

  public static getInstance(): AutomationManager {
    if (!AutomationManager.instance) {
      AutomationManager.instance = new AutomationManager();
    }
    return AutomationManager.instance;
  }

  public setIntentHandler(handler: (intent: string) => void) {
    this.onTriggerIntent = handler;
  }

  public start() {
    if (this.running) return;
    this.running = true;
    
    // Evaluate every 60 seconds
    this.interval = setInterval(() => {
      this.evaluateSchedules();
    }, 60000);
    
    // Run an initial evaluation
    this.evaluateSchedules();
  }

  public stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.running = false;
  }

  private async evaluateSchedules() {
    const db = getDb();
    const activeAutomations = await db.select().from(automations)
      .where(and(eq(automations.status, 'active'), eq(automations.triggerType, 'cron')));
      
    const now = Date.now();

    for (const rule of activeAutomations) {
      try {
        const expression = rule.triggerConfig;
        const interval = CronExpressionParser.parse(expression);
        const nextDate = interval.prev().getTime(); // The *most recent* scheduled time in the past
        
        // If it was supposed to run in the last 60 seconds, and we haven't run it yet...
        const lastRun = rule.lastRunAt || 0;
        
        if (nextDate > lastRun && (now - nextDate) < 120000) {
          // Trigger the automation
          console.log(`[AutomationManager] Triggering rule: ${rule.name}`);
          
          await db.update(automations).set({ lastRunAt: now }).where(eq(automations.id, rule.id));
          
          if (this.onTriggerIntent) {
            this.onTriggerIntent(`[Automation: ${rule.name}] ${rule.targetIntent}`);
          }
        }
      } catch (e: any) {
        console.error(`[AutomationManager] Failed to evaluate cron for ${rule.id}:`, e.message);
      }
    }
  }

  // --- CRUD API ---

  public async listAutomations() {
    return await getDb().select().from(automations);
  }

  public async createAutomation(data: { name: string, description: string, triggerType: string, triggerConfig: string, targetIntent: string }) {
    const db = getDb();
    const now = Date.now();
    const id = crypto.randomUUID();
    
    // Validate cron if applicable
    if (data.triggerType === 'cron') {
      CronExpressionParser.parse(data.triggerConfig);
    }
    
    await db.insert(automations).values({
      id,
      name: data.name,
      description: data.description,
      triggerType: data.triggerType,
      triggerConfig: data.triggerConfig,
      targetIntent: data.targetIntent,
      status: 'active',
      createdAt: now,
      updatedAt: now
    });
    return id;
  }

  public async toggleAutomation(id: string, active: boolean) {
    const db = getDb();
    await db.update(automations)
      .set({ status: active ? 'active' : 'paused', updatedAt: Date.now() })
      .where(eq(automations.id, id));
  }

  public async deleteAutomation(id: string) {
    const db = getDb();
    await db.delete(automations).where(eq(automations.id, id));
  }
}
