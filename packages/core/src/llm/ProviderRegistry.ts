import { LLMProviderAdapter, LLMRequest, LLMResponse, ProviderMetadata } from './types';
import { CredentialService } from './CredentialService';
import { OpenAIAdapter } from './adapters/OpenAIAdapter';
import { CustomOpenAIAdapter } from './adapters/CustomOpenAIAdapter';
import { AnthropicAdapter } from './adapters/AnthropicAdapter';
import { GoogleAdapter } from './adapters/GoogleAdapter';
import { GroqAdapter } from './adapters/GroqAdapter';
import { DeepSeekAdapter } from './adapters/DeepSeekAdapter';
import { OllamaAdapter } from './adapters/OllamaAdapter';
import { OpenRouterAdapter } from './adapters/OpenRouterAdapter';

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private adapters: Map<string, LLMProviderAdapter> = new Map();
  private metadatas: Map<string, ProviderMetadata> = new Map();

  private constructor() {}

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  public async registerProvider(metadata: ProviderMetadata, credentialEncrypted?: string): Promise<void> {
    this.metadatas.set(metadata.id, metadata);

    let adapter: LLMProviderAdapter;

    switch (metadata.type) {
      case 'openai':          adapter = new OpenAIAdapter();          break;
      case 'anthropic':       adapter = new AnthropicAdapter();       break;
      case 'google':          adapter = new GoogleAdapter();          break;
      case 'groq':            adapter = new GroqAdapter();            break;
      case 'deepseek':        adapter = new DeepSeekAdapter();        break;
      case 'ollama':          adapter = new OllamaAdapter();          break;
      case 'openrouter':      adapter = new OpenRouterAdapter();      if (!metadata.baseUrl) metadata.baseUrl = 'https://openrouter.ai/api/v1'; break;
      case 'xai':             adapter = new CustomOpenAIAdapter();    if (!metadata.baseUrl) metadata.baseUrl = 'https://api.x.ai/v1'; break;
      case 'mistral':         adapter = new CustomOpenAIAdapter();    if (!metadata.baseUrl) metadata.baseUrl = 'https://api.mistral.ai/v1'; break;
      case 'together':        adapter = new CustomOpenAIAdapter();    if (!metadata.baseUrl) metadata.baseUrl = 'https://api.together.xyz/v1'; break;
      case 'cohere':          adapter = new CustomOpenAIAdapter();    if (!metadata.baseUrl) metadata.baseUrl = 'https://api.cohere.ai/v1'; break;
      case 'perplexity':      adapter = new CustomOpenAIAdapter();    if (!metadata.baseUrl) metadata.baseUrl = 'https://api.perplexity.ai'; break;
      case 'lmstudio':        adapter = new CustomOpenAIAdapter();    if (!metadata.baseUrl) metadata.baseUrl = 'http://localhost:1234/v1'; break;
      case 'local':           adapter = new CustomOpenAIAdapter();    if (!metadata.baseUrl) metadata.baseUrl = 'http://localhost:8080/v1'; break;
      case 'openai-compatible':
      case 'custom':
      default:
        // Fall back to custom OpenAI-compatible for unknown types
        adapter = new CustomOpenAIAdapter();
    }

    let rawCredential: string | undefined;
    if (credentialEncrypted) {
      rawCredential = await CredentialService.getInstance().decrypt(credentialEncrypted);
    }

    adapter.init(metadata, rawCredential);
    this.adapters.set(metadata.id, adapter);
  }

  public getProvider(id: string): LLMProviderAdapter {
    const adapter = this.adapters.get(id);
    if (!adapter) throw new Error(`Provider ${id} not found or not initialized`);
    const meta = this.metadatas.get(id);
    if (meta && !meta.enabled) throw new Error(`Provider ${id} is disabled`);
    return adapter;
  }

  public getProviders(): ProviderMetadata[] {
    return Array.from(this.metadatas.values());
  }

  public getEnabledProviders(): ProviderMetadata[] {
    return Array.from(this.metadatas.values())
      .filter(m => m.enabled !== false)
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));
  }

  public removeProvider(id: string): void {
    this.adapters.delete(id);
    this.metadatas.delete(id);
  }

  public hasProvider(id: string): boolean {
    return this.adapters.has(id);
  }

  public async testConnection(id: string): Promise<{ success: boolean; latencyMs?: number; message?: string }> {
    const start = Date.now();
    const adapter = this.getProvider(id);
    const result = await adapter.testConnection();
    return { ...result, latencyMs: Date.now() - start };
  }

  /** Try the primary provider; on failure, fall back to the next available provider ordered by priority */
  public async chatWithFallback(request: LLMRequest): Promise<LLMResponse> {
    const enabled = this.getEnabledProviders();
    const primary = request.providerId ? enabled.find(p => p.id === request.providerId) : enabled[0];
    const ordered = primary
      ? [primary, ...enabled.filter(p => p.id !== primary.id)]
      : enabled;

    let lastError: Error = new Error('No providers available');
    for (const meta of ordered) {
      try {
        const adapter = this.adapters.get(meta.id);
        if (!adapter) continue;
        console.log(`[ProviderRegistry] Trying provider: ${meta.id}`);
        return await adapter.chat({ ...request, providerId: meta.id });
      } catch (err: any) {
        lastError = err;
        console.warn(`[ProviderRegistry] Provider ${meta.id} failed, trying fallback. Error: ${err.message}`);
      }
    }
    throw lastError;
  }

  /** Detect model capabilities based on known model IDs and heuristics */
  public getModelCapabilities(modelId: string): {
    supportsVision: boolean;
    supportsTools: boolean;
    supportsStreaming: boolean;
    supportsReasoning: boolean;
    contextWindow: number;
  } {
    const id = modelId.toLowerCase();
    return {
      supportsVision:    id.includes('vision') || id.includes('gpt-4o') || id.includes('claude-3') || id.includes('gemini'),
      supportsTools:     !id.includes('o1-') && !id.includes('deepseek-reason') && !id.includes('gemma'),
      supportsStreaming:  !id.includes('o1-preview') && !id.includes('o1-mini'),
      supportsReasoning: id.includes('o1') || id.includes('reasoner') || id.includes('r1'),
      contextWindow:     id.includes('gemini-1.5-pro') ? 1_000_000 :
                         id.includes('claude') ? 200_000 :
                         id.includes('gpt-4') || id.includes('llama-3') ? 128_000 : 32_768,
    };
  }
}
