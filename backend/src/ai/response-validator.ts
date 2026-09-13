// src/ai/response-validator.ts

import { aiGuards } from './guards';
import { logger } from '../utils/logger';

export const aiResponseValidator = {
  /**
   * Evaluates the LLM-generated response for safety, off-topic leakages, Knowledge Base metadata leaks, and UI location hallucinations.
   */
  validateResponse(content: string, isSwahili: boolean): { isValid: boolean; replacement?: string } {
    if (!content || !content.trim()) {
      return { isValid: false, replacement: "..." };
    }

    let sanitized = content;

    // 1. Check for prompt leakage markers & Knowledge Base disclosures
    const systemMarkers = [
      'system instructions', 'instruction set', 'system prompt',
      'retrieved context', '--- RETRIEVED CONTEXT', 'vector id', 'bm25 score', 'retrieval score'
    ];
    if (systemMarkers.some(marker => sanitized.toLowerCase().includes(marker))) {
      logger.warn('[AI Validator] Response blocked: contained prompt instruction or RAG diagnostic markers.');
      const fallback = isSwahili
        ? "Mimi ni Msaidizi wa Biashara wa Denis Chamkaga. Ninaweza kukusaidia kufafanua mahitaji ya mfumo wako, kutoa nukuu za bei au kukueleza zaidi kuhusu huduma zetu."
        : "I am Denis Chamkaga's Business Assistant. I can help you define your system requirements, provide pricing quotes, or explain our business software solutions.";
      return { isValid: false, replacement: fallback };
    }

    // 2. Strip Knowledge Base disclosures if generated in response text
    const kbPhrasesEn = [
      /here is relevant information from the (denis chamkaga )?knowledge base:?/gi,
      /according to our knowledge base:?/gi,
      /from our knowledge base:?/gi
    ];
    const kbPhrasesSw = [
      /hapa kuna taarifa kutoka hifadhi ya maarifa( ya denis chamkaga)?:?/gi,
      /kulingana na hifadhi wetu wa maarifa:?/gi,
      /kulingana na hifadhi ya maarifa:?/gi
    ];

    for (const pattern of [...kbPhrasesEn, ...kbPhrasesSw]) {
      if (pattern.test(sanitized)) {
        logger.warn('[AI Validator] Knowledge Base disclosure detected. Stripping boilerplate phrase.');
        sanitized = sanitized.replace(pattern, '').trim();
      }
    }

    // 3. Fix UI Position Hallucinations (e.g., "top of the chat widget" -> "bottom-left of the chat widget")
    if (sanitized.toLowerCase().includes('top of the chat widget') || sanitized.toLowerCase().includes('top of this chat widget')) {
      logger.warn('[AI Validator] UI location hallucination detected. Correcting to bottom-left.');
      sanitized = sanitized.replace(/top of (the|this) chat widget/gi, 'bottom-left of the chat widget (beside the paperclip attachment control)');
    }
    if (sanitized.toLowerCase().includes('juu ya chat widget') || sanitized.toLowerCase().includes('juu mwa chat widget')) {
      logger.warn('[AI Validator] Swahili UI location hallucination detected. Correcting to bottom-left.');
      sanitized = sanitized.replace(/juu (ya|mwa) chat widget/gi, 'chini kushoto (bottom-left) mwa chat widget, pembeni ya kitufe cha kuunganisha faili');
    }

    // 4. Validate Swahili spelling check (blocking typical LLM garbles)
    if (isSwahili && !aiGuards.validateSwahiliSyntax(sanitized)) {
      logger.warn('[AI Validator] Response blocked: garbled Swahili detected.');
      return {
        isValid: false,
        replacement: "Samahani, unaweza kufafanua kidogo kuhusu biashara yako? Ningependa kukupa ushauri wa kiteknolojia unaoendana kabisa na mtiririko wako wa kazi."
      };
    }

    return { isValid: true, replacement: sanitized !== content ? sanitized : undefined };
  }
};
