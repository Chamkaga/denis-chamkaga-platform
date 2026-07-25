import { DomainEvent } from './DomainEvent';

export interface NotificationSentPayload {
  notificationId: string;
  recipient: string;
  type: 'email' | 'sms' | 'push' | 'whatsapp';
  sentAt: Date;
  status: 'SUCCESS' | 'FAILED';
}
export interface NotificationSentEventV1 extends DomainEvent<NotificationSentPayload> {}
