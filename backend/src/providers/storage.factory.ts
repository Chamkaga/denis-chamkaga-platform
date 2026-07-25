import { IStorageProvider } from './interfaces/storage.provider';
import { CloudinaryStorageDriver } from './drivers/cloudinary.storage.driver';
import { S3StorageDriver } from './drivers/s3.storage.driver';

export class StorageProviderFactory {
  private static drivers: Record<string, IStorageProvider> = {};

  static getProvider(driverName?: 'cloudinary' | 's3'): IStorageProvider {
    const activeDriver = driverName || process.env.ACTIVE_STORAGE_PROVIDER || process.env.STORAGE_PROVIDER || 'cloudinary';

    if (!this.drivers[activeDriver]) {
      if (activeDriver === 's3') {
        this.drivers[activeDriver] = new S3StorageDriver();
      } else {
        this.drivers[activeDriver] = new CloudinaryStorageDriver();
      }
    }
    return this.drivers[activeDriver];
  }
}
