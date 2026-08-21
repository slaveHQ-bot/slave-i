import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';
import { LLMProviderAdapter, LLMRequest, LLMResponse, ModelMetadata } from '../types';

export class CustomOpenAIAdapter implements LLMProviderAdapter {
  id = 'custom';
  type = 'openai-compatible';
  name = 'Custom OpenAI Compatible';
  
  private client: ReturnType<typeof createOpenAI> | null = null;
  private config: Record<string, any> = {};

  init(config: Record<string, any>, credential?: string): void {
    this.config = config;
    this.id = config.id || this.id;
    this.name = config.name || this.name;
    
    if (config.baseUrl) {
      this.client = createOpenAI({
        apiKey: credential || 'custom-no-key',
        baseURL: config.baseUrl,
      });
    }
  }

  async getModels(): Promise<ModelMetadata[]> {
    if (!this.client) throw new Error('Client not initialized');
    
    try {
      // Assuming standard OpenAI /v1/models endpoint is supported by the custom server
      const response = await fetch(`${this.config.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${(this.client as any).apiKey || 'custom-no-key'}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.data && Array.isArray(data.data)) {
          return data.data.map((m: any) => ({
            id: m.id,
            displayName: m.id,
            providerId: this.id,
            capabilities: {
              supportsStreaming: true,
              supportsTools: false, // Assume false by default for unknown models
              supportsVision: false,
              supportsReasoning: false,
              supportsStructuredOutput: false,
            },
            availability: 'available',
          }));
        }
      }
    } catch (e) {
      console.warn(`Failed to fetch models from custom provider ${this.id}`, e);
    }

    // Fallback if /models endpoint fails
    const defaultModel = this.config.defaultModel || 'default-model';
    return [{
      id: defaultModel,
      displayName: defaultModel,
      providerId: this.id,
      capabilities: {
        supportsStreaming: true,
        supportsTools: false,
        supportsVision: false,
        supportsReasoning: false,
        supportsStructuredOutput: false,
      },
      availability: 'available',
    }];
  }

  async testConnection(): Promise<{ success: boolean; message?: string }> {
    try {
      if (!this.client) throw new Error('Client not initialized');
      const models = await this.getModels();
      if (models.length > 0) return { success: true };
      return { success: false, message: 'No models found' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  private mapMessages(messages: LLMRequest['messages']): any[] {
    return messages.map(m => ({
      role: m.role,
      content: m.content,
      name: m.name
    }));
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    if (!this.client) throw new Error('Client not initialized');
    const start = Date.now();
    const model = this.client(request.modelId);
    
    const response = await generateText({
      model,
      messages: this.mapMessages(request.messages),
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      tools: request.tools,
      abortSignal: request.abortSignal,
    } as any);
    
    return {
      content: response.text,
      model: request.modelId,
      provider: this.id,
      usage: response.usage ? {
        promptTokens: (response.usage as any).promptTokens || 0,
        completionTokens: (response.usage as any).completionTokens || 0,
        totalTokens: (response.usage as any).totalTokens || 0,
      } : undefined,
      finishReason: response.finishReason,
      latencyMs: Date.now() - start
    };
  }

  async streamChat(request: LLMRequest, onChunk: (chunk: string) => void): Promise<LLMResponse> {
    if (!this.client) throw new Error('Client not initialized');
    const start = Date.now();
    const model = this.client(request.modelId);
    
    const { textStream, usage, text } = await streamText({
      model,
      messages: this.mapMessages(request.messages),
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      tools: request.tools,
      abortSignal: request.abortSignal,
    } as any);
    
    for await (const chunk of textStream) {
      onChunk(chunk);
    }
    
    const finalUsage = await usage;
    
    return {
      content: await text,
      model: request.modelId,
      provider: this.id,
      usage: finalUsage ? {
        promptTokens: (finalUsage as any).promptTokens || 0,
        completionTokens: (finalUsage as any).completionTokens || 0,
        totalTokens: (finalUsage as any).totalTokens || 0,
      } : undefined,
      latencyMs: Date.now() - start
    };
  }
}
