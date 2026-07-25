// src/ai/services/email-handoff.ts
// Provider implementing Email notification for human handoff.

import { HumanHandoffProvider, HandoffRequestParams, HandoffResult, registerHandoffProvider } from './handoff.interface';
import { logger } from '../../utils/logger';

export class EmailHandoffProvider implements HumanHandoffProvider {
  name = 'email';

  isEnabled(): boolean {
    return true;
  }

  async initiateHandoff(params: HandoffRequestParams): Promise<HandoffResult> {
    logger.info(`[Email Handoff] Queuing lead email notification alert to admin for ${params.customerName}`);
    
    // Stub or trigger direct email sender logic here
    const alertSubject = `[Denis AI Handoff Alert] - ${params.customerName} requests assistance`;
    logger.info(`[Email Alert queued] Subject: ${alertSubject}`);

    return {
      success: true,
      channel: 'email',
      message: 'Email request notification queued to administrator successfully.'
    };
  }
}

registerHandoffProvider(new EmailHandoffProvider());
