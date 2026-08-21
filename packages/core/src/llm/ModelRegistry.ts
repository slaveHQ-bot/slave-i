import { ModelMetadata } from './types';
import { ProviderRegistry } from './ProviderRegistry';

export class ModelRegistry {
  private static instance: ModelRegistry;
  private models: Map<string, ModelMetadata> = new Map();

  private constructor() {}

  public static getInstance(): ModelRegistry {
    if (!ModelRegistry.instance) {
      ModelRegistry.instance = new ModelRegistry();
    }
    return ModelRegistry.instance;
  }

  public async refreshModels(providerId: string): Promise<void> {
    const provider = ProviderRegistry.getInstance().getProvider(providerId);
    try {
      const models = await provider.getModels();
      for (const model of models) {
        // composite key: providerId:modelId
        this.models.set(`${providerId}:${model.id}`, model);
      }
    } catch (error) {
      console.warn(`Failed to refresh models for provider ${providerId}`, error);
    }
  }

  public async refreshAll(): Promise<void> {
    const providers = ProviderRegistry.getInstance().getProviders();
    for (const p of providers) {
      if (p.enabled) {
        await this.refreshModels(p.id);
      }
    }
  }

  public getModels(): ModelMetadata[] {
    const enabledProviderIds = new Set(
      ProviderRegistry.getInstance()
        .getProviders()
        .filter(p => p.enabled)
        .map(p => p.id)
    );
    return Array.from(this.models.values()).filter(m => enabledProviderIds.has(m.providerId));
  }

  public getModelsByProvider(providerId: string): ModelMetadata[] {
    return this.getModels().filter(m => m.providerId === providerId);
  }

  public getModel(providerId: string, modelId: string): ModelMetadata | undefined {
    return this.models.get(`${providerId}:${modelId}`);
  }
}
