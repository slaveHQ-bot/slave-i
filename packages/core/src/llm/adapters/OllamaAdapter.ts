import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';
import { LLMProviderAdapter, LLMRequest, LLMResponse, ModelMetadata } from '../types';
import { withRetry, withTimeout } from '../RetryHelper';

export class OllamaAdapter implements LLMProviderAdapter {
  id = 'ollama';
  type = 'ollama';
  name = 'Ollama (Local)';

  private client: ReturnType<typeof createOpenAI> | null = null;
  private config: Record<string, any> = {};

  init(config: Record<string, any>, _credential?: string): void {
    this.config = config;
    const baseURL = config.baseUrl || 'http://localhost:11434/v1';
    this.client = createOpenAI({
      apiKey: 'ollama', // Ollama doesn't require a key
      baseURL,
    });
  }

  async getModels(): Promise<ModelMetadata[]> {
    try {
      const baseURL = this.config.baseUrl || 'http://localhost:11434';
      const response = await fetch(`${baseURL}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        return (data.models || []).map((m: any) => ({
          id: m.name,
          displayName: m.name,
          providerId: this.id,
          contextWindow: 8192,
          capabilities: { supportsStreaming: true, supportsTools: false, supportsVision: false, supportsReasoning: false, supportsStructuredOutput: false },
          availability: 'available',
        }));
      }
    } catch (_e) { /* Ollama not running */ }
    return [
      { id: 'llama3.2', displayName: 'Llama 3.2', providerId: this.id, contextWindow: 128000, capabilities: { supportsStreaming: true, supportsTools: false, supportsVision: false, supportsReasoning: false, supportsStructuredOutput: false }, availability: 'unknown' },
      { id: 'mistral',  displayName: 'Mistral',   providerId: this.id, contextWindow: 32768,  capabilities: { supportsStreaming: true, supportsTools: false, supportsVision: false, supportsReasoning: false, supportsStructuredOutput: false }, availability: 'unknown' },
    ];
  }

  async testConnection(): Promise<{ success: boolean; message?: string }> {
    try {
      const baseURL = this.config.baseUrl || 'http://localhost:11434';
      const res = await fetch(`${baseURL}/api/tags`);
      if (res.ok) return { success: true };
      return { success: false, message: `Ollama returned ${res.status}` };
    } catch (e: any) {
      return { success: false, message: `Cannot connect to Ollama: ${e.message}` };
    }
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    if (!this.client) throw new Error('Ollama client not initialized');
    const start = Date.now();
    const model = this.client(request.modelId);
    const response = await withTimeout(withRetry(() => generateText({
      model,
      messages: request.messages as any,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      abortSignal: request.abortSignal,
    } as any)), 300_000); // 5-minute timeout for local models
    return {
      content: (response as any).text,
      model: request.modelId,
      provider: this.id,
      usage: (response as any).usage ? {
        promptTokens: (response as any).usage.promptTokens || 0,
        completionTokens: (response as any).usage.completionTokens || 0,
        totalTokens: (response as any).usage.totalTokens || 0,
      } : undefined,
      latencyMs: Date.now() - start,
    };
  }

  async streamChat(request: LLMRequest, onChunk: (chunk: string) => void): Promise<LLMResponse> {
    if (!this.client) throw new Error('Ollama client not initialized');
    const start = Date.now();
    const model = this.client(request.modelId);
    const { textStream, usage, text } = await streamText({
      model,
      messages: request.messages as any,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      abortSignal: request.abortSignal,
    } as any);
    for await (const chunk of textStream) { onChunk(chunk); }
    const finalUsage = await usage;
    return {
      content: await text,
      model: request.modelId,
      provider: this.id,
      usage: finalUsage ? { promptTokens: (finalUsage as any).promptTokens || 0, completionTokens: (finalUsage as any).completionTokens || 0, totalTokens: (finalUsage as any).totalTokens || 0 } : undefined,
      latencyMs: Date.now() - start,
    };
  }
}
