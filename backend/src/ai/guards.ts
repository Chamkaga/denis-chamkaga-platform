// src/ai/guards.ts
// AI Guardrails & Safety Boundary Engine for DBIP Platform

import { logger } from '../utils/logger';

// List of strictly blocked words/topics (politics, general sports, celebrity gossip, out-of-scope topics)
const BLOCKED_TOPICS = [
  'football', 'soccer', 'premier league', 'chelsea', 'manchester united', 'arsenal',
  'politics', 'election', 'president', 'parliament', 'gossip', 'celebrity',
  'recipe', 'cook', 'baking', 'movies', 'music chart', 'superbowl'
];

export interface GuardrailCheckResult {
  isBlocked: boolean;
  reason?: string;
  swahiliSafetyReply?: string;
  englishSafetyReply?: string;
}

export const aiGuards = {
  /**
   * Sanitizes input strings to prevent prompt injection and remove suspicious elements
   */
  sanitizeInput(text: string): string {
    if (!text) return '';
    return text.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '').trim();
  },

  /**
   * Checks for obvious prompt injections or database injections
   */
  detectInjection(text: string): boolean {
    const lower = text.toLowerCase();
    
    const injectionPatterns = [
      'ignore previous instructions',
      'system prompt',
      'you must reset',
      'select * from',
      'drop table',
      'delete from',
      'insert into',
      'prisma.',
      'database schema',
      'bypass authorization'
    ];

    const matched = injectionPatterns.some(pattern => lower.includes(pattern));
    if (matched) {
      logger.warn(`[AI Guard] Prompt injection trigger matched for: "${text.substring(0, 50)}..."`);
    }
    return matched;
  },

  /**
   * Evaluates enterprise boundary guardrails (Discounts, Custom Pricing, Legal/Medical advice)
   */
  evaluateGuardrails(text: string): GuardrailCheckResult {
    const lower = text.toLowerCase();

    // 1. Discount or Custom Price Bargaining Guardrail
    if (lower.includes('punguza bei') || lower.includes('discount') || lower.includes('punguzo') || lower.includes('cheaper price')) {
      return {
        isBlocked: true,
        reason: 'unapproved_discount',
        swahiliSafetyReply: 'Punguzo la bei au makubaliano maalum ya malipo yanahitaji idhini ya moja kwa moja kutoka kwa Denis Chamkaga. Nitaratibu miadi au kukuunganisha naye ili mjadili nukuu maalum.',
        englishSafetyReply: 'Custom discounts or special pricing agreements require direct approval from Denis Chamkaga. I can schedule a consultation with Denis to discuss custom package terms.'
      };
    }

    // 2. Out-of-Scope Legal or Medical Advice Guardrail
    if (lower.includes('matibabu') || lower.includes('prescribe medicine') || lower.includes('sheria za mahakama') || lower.includes('legal lawsuit')) {
      return {
        isBlocked: true,
        reason: 'out_of_scope_advice',
        swahiliSafetyReply: 'Mimi ni Mfanyakazi wa Kidijitali wa Denis Chamkaga aliyebobea kwenye mifumo ya biashara na teknolojia tu. Siwezi kutoa ushauri wa kisheria au wa kitiba.',
        englishSafetyReply: 'I am Denis Chamkaga\'s Digital Assistant specializing in business software and technology. I cannot provide medical or legal counsel.'
      };
    }

    // 3. Off-topic topics
    const matchesBlocked = BLOCKED_TOPICS.some(topic => lower.includes(topic));
    if (matchesBlocked) {
      return {
        isBlocked: true,
        reason: 'off_topic',
        swahiliSafetyReply: 'Jukumu langu ni kuwasaidia wageni kuhusu huduma za Denis Chamkaga, mifumo ya kidijitali na biashara tu.',
        englishSafetyReply: 'My role is to assist visitors with Denis Chamkaga\'s services, digital systems, and business growth solutions.'
      };
    }

    return { isBlocked: false };
  },

  /**
   * Simple check for off-topic queries
   */
  isOffTopic(text: string): boolean {
    return this.evaluateGuardrails(text).isBlocked;
  },

  /**
   * Checks for Swahili language syntax validity
   */
  validateSwahiliSyntax(text: string): boolean {
    const garbledPatterns = ['dukalangu', 'tovuti ya ziada', 'mtumba wa maji', 'nikusaidia'];
    const lower = text.toLowerCase();
    return !garbledPatterns.some(p => lower.includes(p));
  }
};
