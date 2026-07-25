import { DomainEvent } from './DomainEvent';

export interface LeadCreatedPayload {
  leadId: string;
  email: string;
  fullName: string;
  source: string;
  companyName?: string;
}
export interface LeadCreatedEventV1 extends DomainEvent<LeadCreatedPayload> {}

export interface LeadQualifiedPayload {
  leadId: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  assignedUserId?: string;
}
export interface LeadQualifiedEventV1 extends DomainEvent<LeadQualifiedPayload> {}
