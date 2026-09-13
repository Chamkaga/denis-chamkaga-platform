// src/ai/intent-classifier.ts
// Continuous intent engine evaluating user intention, supporting tokenized word-boundary matching in English and Swahili.

import { logger } from '../utils/logger';

export type UserIntentType =
  | 'Greeting'
  | 'Capability Discovery'
  | 'Service Inquiry'
  | 'Project Request'
  | 'Requirement Discovery'
  | 'Pricing Inquiry'
  | 'Quotation Request'
  | 'Payment Inquiry'
  | 'Consultation Request'
  | 'Human Handoff Request'
  | 'Handoff Deferral'
  | 'Learning'
  | 'Technical Support'
  | 'Existing Client Support'
  | 'General Inquiry'
  | 'Unsupported Question';

export interface IntentScore {
  intent: UserIntentType;
  confidence: number;
}

const INTENT_KEYWORDS: Record<UserIntentType, string[]> = {
  Greeting: [
    'hi', 'hello', 'hey', 'habari', 'jambo', 'mambo', 'good morning', 
    'good afternoon', 'good evening', 'karibu', 'vipi', 'shikamoo'
  ],
  'Capability Discovery': [
    'what can you help', 'what you can help', 'what services', 'what do you do', 
    'how can you help', 'unaweza nisaidia nini', 'huduma gani', 'mnafanya nini', 
    'capabilities', 'what can you do', 'what do you build', 'do you provide training', 
    'provide training', 'unatoa mafunzo', 'kutoa mafunzo'
  ],
  'Service Inquiry': [
    'website', 'mobile app', 'pos', 'erp', 'crm', 'inventory', 'e-commerce', 
    'consulting', 'automation', 'cloud', 'database', 'mifumo', 'stock', 
    'losing stock', 'stoki', 'mauzo', 'instagram', 'tiktok', 'facebook', 
    'social media', 'whatsapp', 'pharmacy', 'dawa', 'restaurant', 'kitchen', 
    'kot', 'madeni', 'debt', 'owe', 'after i approve', 'delivery lifecycle',
    'shop', 'duka', 'duka langu', 'small business', 'my business', 'biashara yangu',
    'digitize', 'retail', 'training', 'mafunzo', 'after delivery', 'support after',
    'support package', 'losing money', 'kupoteza pesa', 'hasara', 'hardware',
    'supermarket', 'school', 'shule'
  ],
  'Project Request': [
    'can you do a system', 'build a system', 'make a system', 'create a system', 
    'develop a system', 'tengeneza mfumo', 'nina shida ya mfumo', 'need a system', 
    'stock theft', 'stock loss', 'losing stock', 'digitize my business', 
    'nataka kufanya biashara kidijitali', 'nataka mfumo', 'jenga mfumo'
  ],
  'Requirement Discovery': [
    'requirements', 'what info', 'what information', 'how does it work', 
    'what details', 'taarifa gani', 'mahitaji'
  ],
  'Pricing Inquiry': [
    'price', 'cost', 'how much', 'rate', 'budget', 'bei', 'gharama', 'senti', 
    'shilingi', 'usd', 'tzs', 'how much does', 'gharama gani', 'bei gani',
    'pricing range', 'range ya bei'
  ],
  'Quotation Request': [
    'quote', 'quotation', 'nukuu', 'proforma', 'invoice estimate', 'omba nukuu'
  ],
  'Payment Inquiry': [
    'how to pay', 'payment method', 'm-pesa', 'mpesa', 'airtel money', 'tigo pesa', 
    'bank transfer', 'dpo', 'malipo', 'nitalipa vipi', 'how do i pay', 'how do we pay', 
    'after i pay', 'what happens after i pay', 'kulipia', 'njia za malipo'
  ],
  'Consultation Request': [
    'book', 'schedule', 'appointment', 'meet', 'calendar', 'zoom', 'miadi', 'panga mkutano'
  ],
  'Human Handoff Request': [
    'speak to denis', 'talk to denis', 'call denis', 'speak to a person', 
    'human agent', 'ongea na denis', 'chat na denis', 'call denis directly',
    'want to speak to denis', 'nataka kuongea na denis', 'i want to speak to denis'
  ],
  'Handoff Deferral': [
    'why don\'t you help me first', 'why you not help me first', 'help me first', 
    'guide me instead', 'guide me instead of denis', 'not online you can guide me', 
    'saidia kwanza', 'badala ya denis', 'hauna haja ya denis'
  ],
  Learning: [
    'how does', 'what is', 'explain', 'jifunze', 'jinsi ya', 'nini maana', 'elimu', 
    'ideas', 'wazo', 'dont know', "don't know", 'dont know anything', "don't know anything", 
    'sijui', 'sijui chochote', 'notebooks', 'daftari', 'outgrown', 'outgrown whatsapp', 
    'excel risk', 'excel become a problem', 'why should i use'
  ],
  'Technical Support': [
    'bug', 'error', 'broken', 'not working', 'fail', 'crash', 'shida', 'tatizo', 'misaada', 'help'
  ],
  'Existing Client Support': [
    'my project', 'mradi wangu', 'invoice', 'ankara', 'payment link', 'receipt', 'risiti'
  ],
  'Unsupported Question': [
    'rocket', 'spaceship', 'football match', 'crypto trading', 'cooking recipe', 'movie recommendation'
  ],
  'General Inquiry': []
};

/**
 * Word-boundary aware matching ensuring whole phrases/words match rather than accidental substrings.
 */
function matchesKeyword(text: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match phrase boundaries: start/end of line, spaces, or non-alphanumeric punctuation
  const regex = new RegExp(`(^|[^a-zA-Z0-9_])${escaped}([^a-zA-Z0-9_]|$)`, 'i');
  return regex.test(text);
}

export const aiIntentClassifier = {
  /**
   * Continuous intent classifier analyzing user query and identifying multiple matching intents.
   */
  classify(message: string): IntentScore[] {
    const text = message.toLowerCase().trim();
    const matches: IntentScore[] = [];

    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
      if (intent === 'General Inquiry') continue;
      
      const matchCount = keywords.filter(kw => matchesKeyword(text, kw)).length;
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

    logger.info(`[AI IntentClassifier] Classified intents for "${text.substring(0, 40)}": ${JSON.stringify(matches)}`);
    return matches;
  }
};
