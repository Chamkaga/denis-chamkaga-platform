import { ProviderMetadata, ProviderCapabilities, ProviderHealth } from '@dc/shared';

export type SupportedPaymentDriver = 'dpo' | 'stripe';

export interface IPaymentProvider {
  getMetadata(): ProviderMetadata;
  getCapabilities(): ProviderCapabilities;
  checkHealth(): Promise<ProviderHealth>;
  createTransaction(amount: number, currency: string, metadata?: Record<string, any>): Promise<{ transactionId: string; redirectUrl?: string }>;
  verifyTransaction(transactionId: string): Promise<{ status: 'SUCCESSFUL' | 'FAILED' | 'PENDING' }>;
}
