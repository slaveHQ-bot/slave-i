export * from './types';
export * from './CredentialService';
export * from './ProviderRegistry';
export * from './ModelRegistry';
export * from './RetryHelper';
export * from './ModelPricing';
export * from './UsageTracker';
export * from './ProviderManager';
export * from './ModelManager';

// We provide backwards compatibility stubs while transitioning.
import { ProviderRegistry } from './ProviderRegistry';
import { LLMRequest } from './types';

// For transitioning, we emulate initModelProvider by setting up the OpenAI provider.
export const initModelProvider = async (apiKey: string) => {
  const registry = ProviderRegistry.getInstance();
  await registry.registerProvider({
    id: 'openai',
    type: 'openai',
    name: 'OpenAI',
    enabled: true,
  }, apiKey); // Passing apiKey directly as plaintext here just for backward compatibility stub. 
              // In production we should pass encrypted strings using CredentialService.
};

// Emulate getModel - this is tricky because getModel returns the Vercel AI object. 
// We will export a facade or just throw since the rest of the app should be refactored to use ProviderRegistry.chat
// But since MainSlave and BaseSlave expect it, let's just return the raw ai model if possible.
export const getModel = (modelId: string = 'gpt-4o'): any => {
  // Hack to get the raw model out of OpenAIAdapter for backward compatibility during refactor.
  // We really want to migrate MainSlave.ts and BaseSlave.ts instead.
  const provider = ProviderRegistry.getInstance().getProvider('openai') as any;
  if (!provider.client) {
    throw new Error('Model provider not initialized. Call initModelProvider with a valid API key.');
  }
  return provider.client(modelId);
};
