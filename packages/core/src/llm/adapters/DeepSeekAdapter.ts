import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';
import { LLMProviderAdapter, LLMRequest, LLMResponse, ModelMetadata } from '../types';
import { withRetry, withTimeout } from '../RetryHelper';

export class DeepSeekAdapter implements LLMProviderAdapter {
  id = 'deepseek';
  type = 'deepseek';
  name = 'DeepSeek';

  private client: ReturnType<typeof createOpenAI> | null = null;

  init(config: Record<string, any>, credential?: string): void {
    if (credential) {
      this.client = createOpenAI({
        apiKey: credential,
        baseURL: 'https://api.deepseek.com/v1',
      });
    }
  }

  async getModels(): Promise<ModelMetadata[]> {
    return [
      { id: 'deepseek-chat',     displayName: 'DeepSeek Chat',     providerId: this.id, contextWindow: 64000,  capabilities: { supportsStreaming: true, supportsTools: true,  supportsVision: false, supportsReasoning: false, supportsStructuredOutput: false }, availability: 'available' },
      { id: 'deepseek-reasoner', displayName: 'DeepSeek Reasoner', providerId: this.id, contextWindow: 64000,  capabilities: { supportsStreaming: true, supportsTools: false, supportsVision: false, supportsReasoning: true,  supportsStructuredOutput: false }, availability: 'available' },
    ];
  }

  async testConnection(): Promise<{ success: boolean; message?: string }> {
    try {
      if (!this.client) throw new Error('Client not initialized');
      const model = this.client('deepseek-chat');
      await generateText({ model, messages: [{ role: 'user', content: 'hi' }], maxTokens: 1 } as any);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    if (!this.client) throw new Error('DeepSeek client not initialized');
    const start = Date.now();
    const model = this.client(request.modelId);
    const response = await withTimeout(withRetry(() => generateText({
      model,
      messages: request.messages as any,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      abortSignal: request.abortSignal,
    } as any)));
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
    if (!this.client) throw new Error('DeepSeek client not initialized');
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
