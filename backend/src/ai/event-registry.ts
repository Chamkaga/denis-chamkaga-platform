// backend/src/ai/event-registry.ts
// Official Enterprise AI & Platform Event Registry Specification

export interface EventDefinition {
  name: string;
  category: 'lifecycle' | 'cognitive' | 'crm' | 'finance' | 'operations' | 'knowledge' | 'system';
  description: string;
  schemaVersion: string;
}

export const OFFICIAL_EVENT_REGISTRY: Record<string, EventDefinition> = {
  VisitorCreated: { name: 'VisitorCreated', category: 'lifecycle', description: 'Triggered when a new web visitor is recognized.', schemaVersion: '1.0' },
  ConversationStarted: { name: 'ConversationStarted', category: 'lifecycle', description: 'Triggered when visitor opens an AI chat session.', schemaVersion: '1.0' },
  LeadCreated: { name: 'LeadCreated', category: 'crm', description: 'Triggered when visitor details are captured as a lead.', schemaVersion: '1.0' },
  LeadQualified: { name: 'LeadQualified', category: 'crm', description: 'Triggered when AI qualifies lead score and urgency.', schemaVersion: '1.0' },
  QuotationCreated: { name: 'QuotationCreated', category: 'finance', description: 'Triggered when a commercial quotation is generated.', schemaVersion: '1.0' },
  QuotationApproved: { name: 'QuotationApproved', category: 'finance', description: 'Triggered when client approves quotation.', schemaVersion: '1.0' },
  InvoicePaid: { name: 'InvoicePaid', category: 'finance', description: 'Triggered when invoice payment clears successfully.', schemaVersion: '1.0' },
  ProjectCreated: { name: 'ProjectCreated', category: 'operations', description: 'Triggered when workspace is created for a project.', schemaVersion: '1.0' },
  SupporterContributionPaid: { name: 'SupporterContributionPaid', category: 'finance', description: 'Triggered when platform supporter contribution is paid.', schemaVersion: '1.0' },
  VoiceCallSummaryGenerated: { name: 'VoiceCallSummaryGenerated', category: 'cognitive', description: 'Triggered when AI call transcript summary is ready.', schemaVersion: '1.0' }
};
