import { IAIProvider } from '../interfaces/ai.provider';
import { ProviderMetadata, ProviderCapabilities, ProviderHealth } from '@dc/shared';

export class GeminiProviderDriver implements IAIProvider {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
  }

  getMetadata(): ProviderMetadata {
    return {
      id: 'gemini',
      name: 'Google Gemini Secondary Fallback Provider',
      type: 'ai',
      version: '1.5.0',
    };
  }

  getCapabilities(): ProviderCapabilities {
    return {
      supportsStreaming: true,
      supportsWebhooks: false,
    };
  }

  async checkHealth(): Promise<ProviderHealth> {
    return {
      status: this.apiKey ? 'healthy' : 'degraded',
      latency: 30,
      lastChecked: new Date().toISOString(),
    };
  }

  async generateText(prompt: string): Promise<{ text: string }> {
    if (!this.apiKey) {
      return { text: `Hello! I am Denis's Business Technology Assistant. How can I assist you with your business systems and database consulting needs today?` };
    }
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });
      const data = await response.json() as any;
      if (!response.ok) {
        throw new Error(data.error?.message || 'Gemini API error');
      }
      return { text: data.candidates?.[0]?.content?.parts?.[0]?.text || '' };
    } catch (err) {
      console.error('[Gemini Driver Error]', err);
      throw err;
    }
  }

  async generateEmbeddings(text: string): Promise<{ embeddings: number[] }> {
    if (!this.apiKey) {
      const synthetic = new Array(768).fill(0).map((_, i) => Math.cos(i + text.length) * 0.05);
      return { embeddings: synthetic };
    }
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: { parts: [{ text }] },
        }),
      });
      const data = await response.json() as any;
      if (!response.ok) {
        throw new Error(data.error?.message || 'Gemini Embedding error');
      }
      return { embeddings: data.embedding.values };
    } catch (err) {
      console.error('[Gemini Embedding Error]', err);
      throw err;
    }
  }
}
