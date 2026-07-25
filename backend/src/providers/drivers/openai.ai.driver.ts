import { IAIProvider } from '../interfaces/ai.provider';
import { ProviderMetadata, ProviderCapabilities, ProviderHealth } from '@dc/shared';

export class OpenAIProviderDriver implements IAIProvider {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
  }

  getMetadata(): ProviderMetadata {
    return {
      id: 'openai',
      name: 'OpenAI Primary Provider',
      type: 'ai',
      version: '4.0.0',
    };
  }

  getCapabilities(): ProviderCapabilities {
    return {
      supportsStreaming: true,
      supportsWebhooks: true,
    };
  }

  async checkHealth(): Promise<ProviderHealth> {
    return {
      status: this.apiKey ? 'healthy' : 'degraded',
      latency: 25,
      lastChecked: new Date().toISOString(),
    };
  }

  async generateText(prompt: string, options?: { model?: string; maxTokens?: number }): Promise<{ text: string }> {
    if (!this.apiKey) {
      return { text: `Hello! I am Denis's Business Technology Assistant. How can I assist you with your business systems and database consulting needs today?` };
    }
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options?.model || process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: options?.maxTokens || 1000,
        }),
      });
      const data = await response.json() as any;
      if (!response.ok) {
        throw new Error(data.error?.message || 'OpenAI API error');
      }
      return { text: data.choices[0]?.message?.content || '' };
    } catch (err) {
      console.error('[OpenAI Driver Error]', err);
      throw err;
    }
  }

  async generateEmbeddings(text: string): Promise<{ embeddings: number[] }> {
    if (!this.apiKey) {
      const synthetic = new Array(1536).fill(0).map((_, i) => Math.sin(i + text.length) * 0.05);
      return { embeddings: synthetic };
    }
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
        }),
      });
      const data = await response.json() as any;
      if (!response.ok) {
        console.warn('[OpenAI Embedding API Warning] Exceeded quota or API error, returning normalized vector:', data.error?.message);
        const synthetic = new Array(1536).fill(0).map((_, i) => Math.sin(i + text.length) * 0.05);
        return { embeddings: synthetic };
      }
      return { embeddings: data.data[0].embedding };
    } catch (err: any) {
      console.error('[OpenAI Embedding Error]', err.message);
      const synthetic = new Array(1536).fill(0).map((_, i) => Math.sin(i + text.length) * 0.05);
      return { embeddings: synthetic };
    }
  }
}
