// src/ai/communication-engine.ts

import { ChatSessionFacts } from './memory';
import { logger } from '../utils/logger';

export type CommunicationChannel = 'chat' | 'whatsapp' | 'voice' | 'consultation' | 'email';

export interface ChannelRecommendation {
  channel: CommunicationChannel;
  label: string;
  reason: string;
  actionUrl: string;
}

export const aiCommunicationEngine = {
  /**
   * Decides the next best communication channel based on visitor memory, intent context, and owner presence status.
   */
  determineBestChannel(
    facts: ChatSessionFacts,
    activeIntent: string,
    leadScore: number,
    presenceState = 'Offline',
    contactSettings?: { phone?: string; whatsapp?: string; email?: string; bookingUrl?: string }
  ): ChannelRecommendation {
    logger.info(`[AI CommEngine] Routing channel for intent "${activeIntent}" (Presence: ${presenceState}, Lead Score: ${leadScore}%)`);

    // Normalize state
    const state = (presenceState || 'Offline').trim().toLowerCase();

    if (state === 'online') {
      return {
        channel: 'voice',
        label: 'Talk Now',
        reason: 'Denis is currently online and available to discuss systems projects.',
        actionUrl: '#webrtc-call'
      };
    }

    if (state === 'busy') {
      const email = contactSettings?.email?.trim();
      return {
        channel: 'chat',
        label: 'Talk to AI / Leave Message',
        reason: email 
          ? `Denis is busy, but his AI Assistant is fully briefed. Alternatively, write to ${email}.`
          : 'Denis is busy, but his AI Assistant is fully briefed. Leave a message.',
        actionUrl: '#'
      };
    }

    if (state === 'meeting') {
      return {
        channel: 'consultation',
        label: 'Book Consultation',
        reason: 'Denis is currently in a meeting. Schedule a consultation directly.',
        actionUrl: contactSettings?.bookingUrl || '/contact?type=meeting'
      };
    }

    // Default or Away / Vacation / Offline / etc.
    const rawPhone = contactSettings?.phone?.trim();
    if (!rawPhone || rawPhone.includes('XXX')) {
      // If phone is missing or placeholder '+255 XXX XXX XXX', fallback to email or chat
      const email = contactSettings?.email?.trim();
      return {
        channel: 'chat',
        label: 'Talk to AI / Leave Message',
        reason: email
          ? `Denis is currently offline. Write to ${email} or leave a message with the AI.`
          : 'Denis is currently offline. Please leave a message with his AI Assistant.',
        actionUrl: '#'
      };
    }

    const phoneDigits = rawPhone.replace(/\s+/g, '');
    return {
      channel: 'voice',
      label: 'Call Mobile',
      reason: 'Denis is currently offline. Reach out directly via mobile call.',
      actionUrl: `tel:${phoneDigits}`
    };
  }
};


