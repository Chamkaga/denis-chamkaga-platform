// backend/src/config/secrets-provider.service.ts
// SecretProvider Abstraction Interface for Env, AWS Secrets, Vault, Azure, GCP

export interface ISecretProvider {
  getSecret(key: string): Promise<string | undefined>;
}

export class EnvSecretProvider implements ISecretProvider {
  async getSecret(key: string): Promise<string | undefined> {
    return process.env[key];
  }
}

class SecretProviderManager {
  private provider: ISecretProvider = new EnvSecretProvider();

  setProvider(provider: ISecretProvider) {
    this.provider = provider;
  }

  async getSecret(key: string, defaultValue?: string): Promise<string> {
    const val = await this.provider.getSecret(key);
    return val || defaultValue || '';
  }
}

export const secretProvider = new SecretProviderManager();
