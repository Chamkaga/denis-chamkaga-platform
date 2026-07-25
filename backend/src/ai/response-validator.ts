// src/ai/response-validator.ts

import { aiGuards } from './guards';
import { logger } from '../utils/logger';

export const aiResponseValidator = {
  /**
   * Evaluates the LLM-generated response for safety, off-topic leakages, and syntax errors.
   */
  validateResponse(content: string, isSwahili: boolean): { isValid: boolean; replacement?: string } {
    if (!content || !content.trim()) {
      return { isValid: false, replacement: "..." };
    }

    // 1. Check for prompt leakage markers
    const containsSystemMarkers = [
      'system instructions',
      'instruction set',
      'system prompt',
      'retrieved context',
      '--- RETRIEVED CONTEXT'
    ].some(marker => content.toLowerCase().includes(marker));

    if (containsSystemMarkers) {
      logger.warn('[AI Validator] Response blocked: contained prompt instruction markers.');
      const fallback = isSwahili
        ? "Samahani, mimi ni msaidizi wako wa kiteknolojia na biashara. Naweza kukusaidia vipi kuhusu mifumo na uboreshaji wa biashara leo?"
        : "I am your business and technology assistant. How can I help you optimize your business systems today?";
      return { isValid: false, replacement: fallback };
    }

    // 2. Validate Swahili spelling check (blocking typical LLM garbles)
    if (isSwahili && !aiGuards.validateSwahiliSyntax(content)) {
      logger.warn('[AI Validator] Response blocked: garbled Swahili detected.');
      return {
        isValid: false,
        replacement: "Samahani, unaweza kufafanua kidogo kuhusu biashara yako? Ningependa kukupa ushauri wa kiteknolojia unaoendana kabisa na mtiririko wako wa kazi."
      };
    }

    return { isValid: true };
  }
};
