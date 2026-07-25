import { ProviderMetadata, ProviderCapabilities, ProviderHealth } from '@dc/shared';

export type SupportedEmailDriver = 'resend' | 'sendgrid';
export type SupportedSMSDriver = 'africastalking' | 'beem';
export type SupportedWhatsAppDriver = 'whatsapp-cloud' | 'twilio-whatsapp';

export interface INotificationProvider {
  getMetadata(): ProviderMetadata;
  getCapabilities(): ProviderCapabilities;
  checkHealth(): Promise<ProviderHealth>;
  sendEmail(to: string, subject: string, body: string): Promise<{ success: boolean; messageId?: string }>;
  sendSMS(to: string, message: string): Promise<{ success: boolean; messageId?: string }>;
  sendWhatsApp(to: string, message: string): Promise<{ success: boolean; messageId?: string }>;
}
