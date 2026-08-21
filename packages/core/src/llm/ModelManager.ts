import { getDb, llmModels } from '../db';
import { ProviderRegistry } from './ProviderRegistry';
import { eq } from 'drizzle-orm';
import { ModelMetadata } from './types';

export class ModelManager {
  private static instance: ModelManager;

  private constructor() {}

  public static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  /**
   * Refreshes the models for a given provider by calling the provider's API.
   * Upserts the results into the local database cache.
   */
  public async refreshModelsForProvider(providerId: string): Promise<void> {
    const adapter = ProviderRegistry.getInstance().getProvider(providerId);
    if (!adapter) throw new Error(`Provider ${providerId} not found`);

    const models = await adapter.getModels();
    const db = getDb();

    // Run in a transaction to safely delete and insert
    await db.transaction(async (tx) => {
      // First, remove existing models for this provider
      await tx.delete(llmModels).where(eq(llmModels.providerId, providerId));

      // Insert new models
      for (const m of models) {
        await tx.insert(llmModels).values({
          id: m.id,
          providerId: m.providerId,
          displayName: m.displayName,
          capabilities: JSON.stringify(m.capabilities),
          availability: m.availability,
          metadata: JSON.stringify({
            contextWindow: m.contextWindow,
            inputPricing: m.inputPricing,
            outputPricing: m.outputPricing
          })
        });
      }
    });

    console.log(`[ModelManager] Refreshed ${models.length} models for provider ${providerId}`);
  }

  /**
   * Returns a list of all models available in the local cache.
   */
  public async getModelsFromDb(): Promise<ModelMetadata[]> {
    const db = getDb();
    const rows = await db.select().from(llmModels);
    
    return rows.map(r => {
      let caps = {
        supportsStreaming: false,
        supportsTools: false,
        supportsVision: false,
        supportsReasoning: false,
        supportsStructuredOutput: false
      };
      let meta: any = {};
      try { caps = JSON.parse(r.capabilities); } catch (e) {}
      try { meta = r.metadata ? JSON.parse(r.metadata) : {}; } catch (e) {}

      return {
        id: r.id,
        providerId: r.providerId,
        displayName: r.displayName,
        availability: r.availability as any,
        capabilities: caps,
        contextWindow: meta.contextWindow,
        inputPricing: meta.inputPricing,
        outputPricing: meta.outputPricing,
      };
    });
  }

  /**
   * Get models for a specific provider from the DB cache.
   */
  public async getModelsForProvider(providerId: string): Promise<ModelMetadata[]> {
    const models = await this.getModelsFromDb();
    return models.filter(m => m.providerId === providerId);
  }
}
