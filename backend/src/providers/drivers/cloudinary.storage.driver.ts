import { IStorageProvider } from '../interfaces/storage.provider';
import { ProviderMetadata, ProviderCapabilities, ProviderHealth } from '@dc/shared';

export class CloudinaryStorageDriver implements IStorageProvider {
  getMetadata(): ProviderMetadata {
    return {
      id: 'cloudinary',
      name: 'Cloudinary Storage Provider',
      type: 'storage',
      version: '2.0.0',
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
      status: 'healthy',
      latency: 10,
      lastChecked: new Date().toISOString(),
    };
  }

  async uploadFile(fileBuffer: Buffer, filename: string, mimeType: string): Promise<{ url: string; key: string }> {
    console.log(`[Cloudinary Driver Upload] Filename: ${filename} | Size: ${fileBuffer.length} bytes | Mime: ${mimeType}`);
    const key = `knowledge/doc-${Date.now()}-${filename}`;
    const url = `https://res.cloudinary.com/denischamkaga/raw/upload/v1/${key}`;
    return { url, key };
  }

  async deleteFile(key: string): Promise<{ success: boolean }> {
    console.log(`[Cloudinary Driver Delete] Key: ${key}`);
    return { success: true };
  }

  async getSignedUrl(key: string): Promise<{ url: string }> {
    return { url: `https://res.cloudinary.com/denischamkaga/raw/upload/v1/${key}` };
  }
}
