import { DomainEvent } from './DomainEvent';

export interface ContributionInitiatedPayload {
  contributionId: string;
  userId?: string;
  amount: number;
  currency: string;
  paymentGateway: string;
}
export interface ContributionInitiatedEventV1 extends DomainEvent<ContributionInitiatedPayload> {}

export interface ContributionRedirectedPayload {
  contributionId: string;
  transactionReference: string;
  redirectUrl: string;
}
export interface ContributionRedirectedEventV1 extends DomainEvent<ContributionRedirectedPayload> {}

export interface ContributionPaidPayload {
  contributionId: string;
  amountPaid: number;
  currency: string;
  gatewayTransactionId: string;
  paidAt: Date;
}
export interface ContributionPaidEventV1 extends DomainEvent<ContributionPaidPayload> {}

export interface ContributionVerifiedPayload {
  contributionId: string;
  status: 'SUCCESS' | 'FAILED';
  verificationResponse: Record<string, any>;
}
export interface ContributionVerifiedEventV1 extends DomainEvent<ContributionVerifiedPayload> {}

export interface ContributionCompletedPayload {
  contributionId: string;
  userId?: string;
  amount: number;
  currency: string;
  completedAt: Date;
}
export interface ContributionCompletedEventV1 extends DomainEvent<ContributionCompletedPayload> {}
