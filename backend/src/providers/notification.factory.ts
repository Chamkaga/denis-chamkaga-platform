import { INotificationProvider } from './interfaces/notification.provider';
import { ResendNotificationDriver } from './drivers/resend.notification.driver';
import { SendGridNotificationDriver } from './drivers/sendgrid.notification.driver';
import { ProviderMetadata, ProviderCapabilities, ProviderHealth } from '@dc/shared';

export class CompositeNotificationProvider implements INotificationProvider {
  private primary: INotificationProvider;
  private fallback: INotificationProvider;

  constructor() {
    this.primary = new ResendNotificationDriver();
    this.fallback = new SendGridNotificationDriver();
  }

  getMetadata(): ProviderMetadata {
    return this.primary.getMetadata();
  }

  getCapabilities(): ProviderCapabilities {
    return this.primary.getCapabilities();
  }

  async checkHealth(): Promise<ProviderHealth> {
    return this.primary.checkHealth();
  }

  async sendEmail(to: string, subject: string, body: string): Promise<{ success: boolean; messageId?: string }> {
    try {
      return await this.primary.sendEmail(to, subject, body);
    } catch (primaryErr) {
      console.warn('[Notification Provider] Primary (Resend) failed, falling back to Secondary (SendGrid)', primaryErr);
      return await this.fallback.sendEmail(to, subject, body);
    }
  }

  async sendSMS(to: string, message: string): Promise<{ success: boolean; messageId?: string }> {
    return { success: false };
  }

  async sendWhatsApp(to: string, message: string): Promise<{ success: boolean; messageId?: string }> {
    return { success: false };
  }
}

export class NotificationProviderFactory {
  private static drivers: Record<string, INotificationProvider> = {};

  /**
   * Returns the configured active Notification Provider instance based on environment configuration.
   * Default production active provider: 'resend'.
   * Secondary providers (e.g., 'sendgrid') remain installed as future adapters but are disabled in runtime flow unless configured.
   */
  static getProvider(driverName?: string): INotificationProvider {
    const activeDriver = driverName || process.env.ACTIVE_NOTIFICATION_PROVIDER || process.env.NOTIFICATION_PROVIDER || 'resend';

    if (!this.drivers[activeDriver]) {
      if (activeDriver === 'sendgrid') {
        this.drivers[activeDriver] = new SendGridNotificationDriver();
      } else {
        this.drivers[activeDriver] = new ResendNotificationDriver();
      }
    }
    return this.drivers[activeDriver];
  }
}
