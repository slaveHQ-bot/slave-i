import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';
import { LLMProviderAdapter, LLMRequest, LLMResponse, ModelMetadata } from '../types';

export class GoogleAdapter implements LLMProviderAdapter {
  id = 'google';
  type = 'google';
  name = 'Google Gemini';
  
  private client: ReturnType<typeof createGoogleGenerativeAI> | null = null;
  private config: Record<string, any> = {};

  init(config: Record<string, any>, credential?: string): void {
    this.config = config;
    if (credential) {
      this.client = createGoogleGenerativeAI({
        apiKey: credential,
      });
    }
  }

  async getModels(): Promise<ModelMetadata[]> {
    if (!this.client) throw new Error('Google client not initialized');
    return [
      {
        id: 'gemini-2.5-pro',
        displayName: 'Gemini 2.5 Pro',
        providerId: this.id,
        contextWindow: 2000000,
        capabilities: {
          supportsStreaming: true,
          supportsTools: true,
          supportsVision: true,
          supportsReasoning: false,
          supportsStructuredOutput: true,
        },
        availability: 'available',
      },
      {
        id: 'gemini-2.5-flash',
        displayName: 'Gemini 2.5 Flash',
        providerId: this.id,
        contextWindow: 1000000,
        capabilities: {
          supportsStreaming: true,
          supportsTools: true,
          supportsVision: true,
          supportsReasoning: false,
          supportsStructuredOutput: true,
        },
        availability: 'available',
      },
      {
        id: 'gemini-2.0-flash',
        displayName: 'Gemini 2.0 Flash',
        providerId: this.id,
        contextWindow: 1000000,
        capabilities: {
          supportsStreaming: true,
          supportsTools: true,
          supportsVision: true,
          supportsReasoning: false,
          supportsStructuredOutput: true,
        },
        availability: 'available',
      },
      {
        id: 'gemini-2.0-pro-exp-02-05',
        displayName: 'Gemini 2.0 Pro Experimental',
        providerId: this.id,
        contextWindow: 2000000,
        capabilities: {
          supportsStreaming: true,
          supportsTools: true,
          supportsVision: true,
          supportsReasoning: false,
          supportsStructuredOutput: true,
        },
        availability: 'available',
      }
    ];
  }

  async testConnection(): Promise<{ success: boolean; message?: string }> {
    try {
      if (!this.client) throw new Error('Client not initialized');
      const model = this.client('gemini-2.5-flash');
      await generateText({
        model,
        messages: [{ role: 'user', content: 'test' }],
        maxTokens: 1,
      } as any);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  private mapMessages(messages: LLMRequest['messages']): any[] {
    return messages.map(m => {
      let content = m.content;
      if (Array.isArray(content)) {
        content = content.map(part => {
          if (part.type === 'image' && typeof part.image === 'string' && part.image.startsWith('data:')) {
            return { ...part, image: new URL(part.image) };
          }
          return part;
        });
      }
      return {
        role: m.role,
        content: content,
        name: m.name
      };
    });
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    if (!this.client) throw new Error('Google client not initialized');
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
    if (!this.client) throw new Error('Google client not initialized');
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
