/**
 * Model pricing per million tokens (input / output).
 * Prices in USD.
 */
export interface ModelPrice {
  inputPerMillion: number;
  outputPerMillion: number;
  displayName?: string;
}

export const MODEL_PRICING: Record<string, ModelPrice> = {
  // OpenAI
  'gpt-4o':                          { inputPerMillion: 5.00,    outputPerMillion: 15.00,   displayName: 'GPT-4o' },
  'gpt-4o-mini':                     { inputPerMillion: 0.15,    outputPerMillion: 0.60,    displayName: 'GPT-4o Mini' },
  'gpt-4-turbo':                     { inputPerMillion: 10.00,   outputPerMillion: 30.00,   displayName: 'GPT-4 Turbo' },
  'gpt-4':                           { inputPerMillion: 30.00,   outputPerMillion: 60.00,   displayName: 'GPT-4' },
  'gpt-3.5-turbo':                   { inputPerMillion: 0.50,    outputPerMillion: 1.50,    displayName: 'GPT-3.5 Turbo' },
  'o1-preview':                      { inputPerMillion: 15.00,   outputPerMillion: 60.00,   displayName: 'o1 Preview' },
  'o1-mini':                         { inputPerMillion: 3.00,    outputPerMillion: 12.00,   displayName: 'o1 Mini' },
  // Anthropic
  'claude-3-5-sonnet-20241022':      { inputPerMillion: 3.00,    outputPerMillion: 15.00,   displayName: 'Claude 3.5 Sonnet' },
  'claude-3-5-haiku-20241022':       { inputPerMillion: 0.80,    outputPerMillion: 4.00,    displayName: 'Claude 3.5 Haiku' },
  'claude-3-opus-20240229':          { inputPerMillion: 15.00,   outputPerMillion: 75.00,   displayName: 'Claude 3 Opus' },
  'claude-3-sonnet-20240229':        { inputPerMillion: 3.00,    outputPerMillion: 15.00,   displayName: 'Claude 3 Sonnet' },
  'claude-3-haiku-20240307':         { inputPerMillion: 0.25,    outputPerMillion: 1.25,    displayName: 'Claude 3 Haiku' },
  // Google
  'gemini-2.0-flash':                { inputPerMillion: 0.075,   outputPerMillion: 0.30,    displayName: 'Gemini 2.0 Flash' },
  'gemini-1.5-pro':                  { inputPerMillion: 1.25,    outputPerMillion: 5.00,    displayName: 'Gemini 1.5 Pro' },
  'gemini-1.5-flash':                { inputPerMillion: 0.075,   outputPerMillion: 0.30,    displayName: 'Gemini 1.5 Flash' },
  'gemini-1.5-flash-8b':             { inputPerMillion: 0.0375,  outputPerMillion: 0.15,    displayName: 'Gemini 1.5 Flash 8B' },
  // Groq
  'llama-3.3-70b-versatile':         { inputPerMillion: 0.59,    outputPerMillion: 0.79,    displayName: 'Llama 3.3 70B' },
  'llama-3.1-8b-instant':            { inputPerMillion: 0.05,    outputPerMillion: 0.08,    displayName: 'Llama 3.1 8B' },
  'mixtral-8x7b-32768':              { inputPerMillion: 0.24,    outputPerMillion: 0.24,    displayName: 'Mixtral 8x7B' },
  // DeepSeek
  'deepseek-chat':                   { inputPerMillion: 0.27,    outputPerMillion: 1.10,    displayName: 'DeepSeek Chat' },
  'deepseek-reasoner':               { inputPerMillion: 0.55,    outputPerMillion: 2.19,    displayName: 'DeepSeek Reasoner' },
  // Mistral
  'mistral-large-latest':            { inputPerMillion: 2.00,    outputPerMillion: 6.00,    displayName: 'Mistral Large' },
  'mistral-small-latest':            { inputPerMillion: 0.20,    outputPerMillion: 0.60,    displayName: 'Mistral Small' },
  'open-mixtral-8x22b':              { inputPerMillion: 2.00,    outputPerMillion: 6.00,    displayName: 'Mixtral 8x22B' },
};

/**
 * Calculate estimated cost for a request.
 * Returns cost in USD.
 */
export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model] ?? { inputPerMillion: 1.00, outputPerMillion: 3.00 };
  return (inputTokens * pricing.inputPerMillion + outputTokens * pricing.outputPerMillion) / 1_000_000;
}

/**
 * Format a cost value as a human-readable string.
 */
export function formatCost(usd: number): string {
  if (usd < 0.0001) return '< $0.0001';
  if (usd < 0.01)   return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(4)}`;
}
