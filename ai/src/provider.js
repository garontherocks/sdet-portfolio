import { createMockProvider } from './providers/mock.js';
import { createOpenAIProvider } from './providers/openai.js';

export async function getProvider(name = process.env.AI_PROVIDER || 'mock') {
  if (name === 'mock') return createMockProvider();
  if (name === 'openai') return createOpenAIProvider();
  throw new Error(`Unsupported AI provider: ${name}`);
}
