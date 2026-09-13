// src/ai/providers/provider.interface.ts
// Standardized LLM Provider Interface contract and health check structures.

export interface ProviderMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

export interface GenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  responseFormat?: 'text' | 'json';
  allowFallback?: boolean;
}

export interface ProviderResponse {
  content: string;
  tokensUsed?: number;
  durationMs?: number;
  toolCalls?: ToolCall[];
  provider: string;
  model: string;
  mode: 'live' | 'fallback' | 'offline';
  errorCode?: string;
  errorMessage?: string;
}

export interface HealthCheckResult {
  provider: string;
  model: string;
  status: 'healthy' | 'unhealthy';
  latencyMs: number;
  version?: string;
  error?: string;
}

export interface LLMProvider {
  /**
   * Generates a complete response (non-streamed).
   */
  generate(messages: ProviderMessage[], options?: GenerateOptions): Promise<ProviderResponse>;

  /**
   * Generates a response and streams tokens as they become available.
   */
  stream(
    messages: ProviderMessage[],
    onToken: (token: string) => void,
    options?: GenerateOptions
  ): Promise<ProviderResponse>;

  /**
   * Generates high-dimensional vector embeddings for a given input query text.
   */
  embed(text: string): Promise<number[]>;

  /**
   * Performs connectivity validation checks on the host API server endpoint, returning standardized metrics.
   */
  healthCheck(): Promise<HealthCheckResult>;
}
