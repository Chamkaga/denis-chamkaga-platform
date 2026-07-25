export interface ProviderMetadata {
  id: string;
  name: string;
  type: 'payment' | 'notification' | 'storage' | 'ai';
  version?: string;
}

export interface ProviderCapabilities {
  supportsRefunds?: boolean;
  supportsRecurring?: boolean;
  supportsWebhooks?: boolean;
  supportsCurrencies?: string[];
  supportsStreaming?: boolean;
}

export interface ProviderHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency: number; // in milliseconds
  lastChecked: Date | string;
  error?: string;
}
