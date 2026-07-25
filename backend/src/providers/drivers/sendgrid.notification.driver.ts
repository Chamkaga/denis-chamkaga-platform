import { INotificationProvider } from '../interfaces/notification.provider';
import { ProviderMetadata, ProviderCapabilities, ProviderHealth } from '@dc/shared';

export class SendGridNotificationDriver implements INotificationProvider {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SENDGRID_API_KEY || '';
  }

  getMetadata(): ProviderMetadata {
    return {
      id: 'sendgrid',
      name: 'SendGrid Email Provider',
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
      latency: 20,
      lastChecked: new Date().toISOString(),
    };
  }

  async sendEmail(to: string, subject: string, body: string): Promise<{ success: boolean; messageId?: string }> {
    if (!this.apiKey) {
      console.log(`[SendGrid Mock Email Log] To: ${to} | Subject: ${subject} | Body: ${body.substring(0, 100)}...`);
      return { success: true, messageId: `sendgrid-mock-${Date.now()}` };
    }
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: process.env.EMAIL_FROM || 'noreply@denischamkaga.com' },
          subject,
          content: [{ type: 'text/html', value: body }],
        }),
      });
      if (!response.ok) {
        throw new Error(`SendGrid send failed with status ${response.status}`);
      }
      return { success: true, messageId: `sg-${Date.now()}` };
    } catch (err: any) {
      console.error('[SendGrid Error]', err);
      throw err;
    }
  }

  async sendSMS(): Promise<{ success: boolean; messageId?: string }> {
    throw new Error('SendGrid driver does not support SMS');
  }

  async sendWhatsApp(): Promise<{ success: boolean; messageId?: string }> {
    throw new Error('SendGrid driver does not support WhatsApp');
  }
}
