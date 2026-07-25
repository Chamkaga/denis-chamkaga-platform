// src/ai/intent-classifier.ts
// Continuous intent engine evaluating user intention, supporting multi-intent detection and scoring.

import { logger } from '../utils/logger';

export type UserIntentType =
  | 'Learning'
  | 'Consultation'
  | 'Service Request'
  | 'Pricing'
  | 'Technical Support'
  | 'Existing Client Support'
  | 'Human Handoff'
  | 'General Inquiry';

export interface IntentScore {
  intent: UserIntentType;
  confidence: number;
}

const INTENT_KEYWORDS: Record<UserIntentType, string[]> = {
  Learning: ['how does', 'what is', 'explain', 'jifunze', 'jinsi ya', 'nini maana', 'elimu', 'ideas', 'wazo'],
  Consultation: ['book', 'schedule', 'appointment', 'meet', 'calendar', 'zoom', 'call denis', 'miadi', 'ongea na denis'],
  'Service Request': ['build', 'develop', 'create', 'setup', 'system', 'integrate', 'tengeneza', 'anzisha', 'pos system', 'crm', 'erp'],
  Pricing: ['price', 'cost', 'how much', 'quote', 'quotation', 'rate', 'budget', 'bei', 'gharama', 'senti'],
  'Technical Support': ['bug', 'error', 'broken', 'not working', 'fail', 'crash', 'shida', 'tatizo', 'misaada', 'help'],
  'Existing Client Support': ['my project', 'mradi wangu', 'invoice', 'ankara', 'payment link', 'receipt', 'risiti', 'malipo'],
  'Human Handoff': ['human', 'person', 'representative', 'agent', 'denis directly', 'ongea na mtu', 'chat na denis', 'whatsapp', 'email'],
  'General Inquiry': []
};

export const aiIntentClassifier = {
  /**
   * Continuous intent classifier analyzing user query and identifying multiple matching intents.
   */
  classify(message: string): IntentScore[] {
    const text = message.toLowerCase();
    const matches: IntentScore[] = [];

    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
      if (intent === 'General Inquiry') continue;
      
      const matchCount = keywords.filter(kw => text.includes(kw)).length;
      if (matchCount > 0) {
        // Calculate confidence dynamically based on keywords matched
        const confidence = Math.min(0.5 + matchCount * 0.15, 0.95);
        matches.push({ intent: intent as UserIntentType, confidence });
      }
    }

    // Sort by confidence descending
    matches.sort((a, b) => b.confidence - a.confidence);

    if (matches.length === 0) {
      matches.push({ intent: 'General Inquiry', confidence: 0.4 });
    }

    logger.info(`[AI IntentClassifier] Classified intents: ${JSON.stringify(matches)}`);
    return matches;
  }
};
