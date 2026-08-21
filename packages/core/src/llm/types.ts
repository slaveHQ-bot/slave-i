export type MessageContent = string | Array<{ type: 'text', text: string } | { type: 'image', image: string | Uint8Array | URL }>;

export interface LLMRequest {
  providerId?: string;
  modelId: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: MessageContent;
    name?: string;
  }>;
  tools?: Record<string, any>;
  responseFormat?: 'text' | 'json_object';
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
  metadata?: Record<string, any>;
  abortSignal?: AbortSignal;
}

export interface LLMResponse {
  content: string | null;
  toolCalls?: any[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
  model: string;
  provider: string;
  latencyMs?: number;
  metadata?: Record<string, any>;
}

export interface ModelMetadata {
  id: string;
  displayName: string;
  providerId: string;
  contextWindow?: number;
  inputPricing?: number;
  outputPricing?: number;
  capabilities: {
    supportsStreaming: boolean;
    supportsTools: boolean;
    supportsVision: boolean;
    supportsReasoning: boolean;
    supportsStructuredOutput: boolean;
  };
  availability: 'available' | 'unavailable' | 'unknown';
}

export interface ProviderMetadata {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  priority?: number;
  baseUrl?: string;
}

export interface LLMProviderAdapter {
  id: string;
  type: string;
  name: string;
  
  init(config: Record<string, any>, credential?: string): void;
  getModels(): Promise<ModelMetadata[]>;
  chat(request: LLMRequest): Promise<LLMResponse>;
  streamChat(request: LLMRequest, onChunk: (chunk: string) => void): Promise<LLMResponse>;
  testConnection(): Promise<{ success: boolean; message?: string }>;
}
