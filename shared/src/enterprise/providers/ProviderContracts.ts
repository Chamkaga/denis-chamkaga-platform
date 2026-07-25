export interface ProviderMetadata {
  id: string;
  name: string;
  type: 'payment' | 'notification' | 'storage' | 'ai';
}

export interface ProviderCapabilities {
  supportsRefunds: boolean;
  supportsRecurring: boolean;
  supportsWebhooks: boolean;
  supportsCurrencies: string[];
}

export interface ProviderHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency: number; // Latency checks in ms
  lastChecked: Date;
  version?: string;
}
