import { INotificationProvider } from '../interfaces/notification.provider';
import { ProviderMetadata, ProviderCapabilities, ProviderHealth } from '@dc/shared';

export class ResendNotificationDriver implements INotificationProvider {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.RESEND_API_KEY || '';
  }

  getMetadata(): ProviderMetadata {
    return {
      id: 'resend',
      name: 'Resend Email Provider',
      type: 'notification',
      version: '1.0.0',
    };
  }

  getCapabilities(): ProviderCapabilities {
    return {
      supportsWebhooks: true,
    };
  }

  async checkHealth(): Promise<ProviderHealth> {
    return {
      status: this.apiKey ? 'healthy' : 'degraded',
      latency: 15,
      lastChecked: new Date().toISOString(),
    };
  }

  async sendEmail(to: string, subject: string, body: string): Promise<{ success: boolean; messageId?: string }> {
    if (!this.apiKey) {
      console.log(`[Resend Mock Email Log] To: ${to} | Subject: ${subject} | Body: ${body.substring(0, 100)}...`);
      return { success: true, messageId: `resend-mock-${Date.now()}` };
    }
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'noreply@denischamkaga.com',
          to,
          subject,
          html: body,
        }),
      });
      const data = await response.json() as any;
      if (!response.ok) {
        throw new Error(data.message || 'Resend send failed');
      }
      return { success: true, messageId: data.id };
    } catch (err: any) {
      console.error('[Resend Error]', err);
      throw err;
    }
  }

  async sendSMS(): Promise<{ success: boolean; messageId?: string }> {
    throw new Error('Resend driver does not support SMS');
  }

  async sendWhatsApp(): Promise<{ success: boolean; messageId?: string }> {
    throw new Error('Resend driver does not support WhatsApp');
  }
}
