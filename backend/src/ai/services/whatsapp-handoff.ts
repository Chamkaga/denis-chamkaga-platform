// src/ai/services/whatsapp-handoff.ts
// Provider implementing WhatsApp-based human handoff.

import { HumanHandoffProvider, HandoffRequestParams, HandoffResult, registerHandoffProvider } from './handoff.interface';
import { logger } from '../../utils/logger';

export class WhatsAppHandoffProvider implements HumanHandoffProvider {
  name = 'whatsapp';

  isEnabled(): boolean {
    return true;
  }

  async initiateHandoff(params: HandoffRequestParams): Promise<HandoffResult> {
    logger.info(`[WhatsApp Handoff] Preparing link redirect for lead ${params.customerName}`);
    
    // Construct pre-filled message redirect for WhatsApp link api
    const targetPhone = process.env.WHATSAPP_HANDOFF_PHONE || '255712345678';
    const textMsg = `Habari Denis! Naitwa ${params.customerName}. Nilikuwa naongea na AI Assistant wako kuhusu mifumo na ningependa kuendelea hapa.`;
    const redirectUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(textMsg)}`;

    return {
      success: true,
      channel: 'whatsapp',
      message: 'Redirecting visitor to Denis\'s WhatsApp chat.',
      redirectUrl
    };
  }
}

registerHandoffProvider(new WhatsAppHandoffProvider());
