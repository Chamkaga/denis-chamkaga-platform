import { ProviderMetadata, ProviderCapabilities, ProviderHealth } from '@dc/shared';

export type SupportedStorageDriver = 'cloudinary' | 's3' | 'local';

export interface IStorageProvider {
  getMetadata(): ProviderMetadata;
  getCapabilities(): ProviderCapabilities;
  checkHealth(): Promise<ProviderHealth>;
  uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<{ url: string; key: string }>;
  deleteFile(key: string): Promise<{ success: boolean }>;
  getSignedUrl(key: string): Promise<{ url: string }>;
}
