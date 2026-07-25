// backend/src/ai/ai-guardrails.ts
// AI Guardrails & Input/Output Safety Verification Engine

import { otelLogger } from '../utils/otel-logger';

export interface GuardrailValidationResult {
  passed: boolean;
  sanitizedContent: string;
  violations: string[];
}

export class AIGuardrailsEngine {
  private forbiddenPatterns = [
    /ignore previous instructions/i,
    /system prompt leak/i,
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /DROP TABLE/i,
    /DELETE FROM/i
  ];

  validateInput(prompt: string): GuardrailValidationResult {
    const violations: string[] = [];
    let sanitized = prompt;

    for (const pattern of this.forbiddenPatterns) {
      if (pattern.test(prompt)) {
        violations.push(`Security violation detected: Pattern ${pattern.toString()}`);
        sanitized = sanitized.replace(pattern, '[REDACTED_SECURITY_RISK]');
      }
    }

    if (prompt.length > 8000) {
      violations.push('Input prompt length exceeds 8000 character safety threshold.');
      sanitized = sanitized.slice(0, 8000);
    }

    if (violations.length > 0) {
      otelLogger.warn(`[AIGuardrails] Prompt input violations detected: ${violations.join(', ')}`);
    }

    return {
      passed: violations.length === 0,
      sanitizedContent: sanitized,
      violations
    };
  }

  validateOutput(response: string): GuardrailValidationResult {
    const violations: string[] = [];
    let sanitized = response;

    if (/api[-_]?key|secret[-_]?key|bearer\s+[a-z0-9-_.]+/i.test(response)) {
      violations.push('Potential sensitive API token leak detected in model output.');
      sanitized = sanitized.replace(/bearer\s+[a-z0-9-_.]+/gi, 'Bearer [REDACTED]');
    }

    return {
      passed: violations.length === 0,
      sanitizedContent: sanitized,
      violations
    };
  }
}

export const aiGuardrailsEngine = new AIGuardrailsEngine();
