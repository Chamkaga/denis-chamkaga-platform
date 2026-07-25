// src/ai/services/meeting-handoff.ts
// Provider implementing Meeting booking handoff links.

import { HumanHandoffProvider, HandoffRequestParams, HandoffResult, registerHandoffProvider } from './handoff.interface';
import { logger } from '../../utils/logger';

export class MeetingHandoffProvider implements HumanHandoffProvider {
  name = 'meeting';

  isEnabled(): boolean {
    return true;
  }

  async initiateHandoff(params: HandoffRequestParams): Promise<HandoffResult> {
    logger.info(`[Meeting Handoff] Pre-compiling meeting links for ${params.customerName}`);
    
    // Suggest Cal.com / Calendly redirect calendar URL
    const calendarUrl = process.env.CALENDLY_REDIRECT_URL || 'https://calendly.com/denis-chamkaga/consultation';

    return {
      success: true,
      channel: 'meeting',
      message: 'Redirecting to booking schedule calendar.',
      redirectUrl: calendarUrl
    };
  }
}

registerHandoffProvider(new MeetingHandoffProvider());
