// backend/src/ai/providers/transcription.provider.ts
// Interface and implementations for audio transcription services (Speech-to-Text).

import { logger } from '../../utils/logger';

export interface TranscriptionContext {
  companyName?: string;
  requirements?: string;
}

export interface TranscriptionResult {
  text: string;
  provider: string;
  durationMs: number;
}

export interface ITranscriptionProvider {
  transcribe(audioPath: string, context?: TranscriptionContext): Promise<TranscriptionResult>;
}

/**
 * Temporary MVP Mock Transcription Provider
 * Generates a context-aware simulated transcript for development and staging.
 */
export class MockTranscriptionProvider implements ITranscriptionProvider {
  async transcribe(audioPath: string, context?: TranscriptionContext): Promise<TranscriptionResult> {
    const startTime = Date.now();
    
    // Simulate short network latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    const company = context?.companyName || 'their organization';
    const hasBudget = context?.requirements?.toLowerCase().includes('budget');
    const budgetDetail = hasBudget ? 'the discussed budget limits' : 'standard service rates';

    const text = `[00:02] Visitor: Hello, is this Denis?
[00:05] Denis: Yes, this is Denis. How can I help you today?
[00:10] Visitor: I am calling from ${company}. We saw your projects portfolio and would love to build a custom CRM and database automation system.
[00:22] Denis: Excellent. I specialize in database schemas, custom CRM architectures, and automated pipelines. What are your core requirements?
[00:35] Visitor: We need real-time data sync and some AI features like email and quotation templates. The main challenge is: ${context?.requirements || 'automating business operations'}.
[00:48] Denis: Got it. We can design a relational system to map your workflow. Do you have a timeline or target budget in mind?
[00:58] Visitor: Yes, we are planning to complete this in about two months, and we wanted to review ${budgetDetail}.
[01:08] Denis: That is a realistic timeline. I will prepare a customer brief and coordinate next steps. I'll send over a summary after this call.
[01:20] Visitor: Thank you, Denis. Looking forward to it!`;

    const durationMs = Date.now() - startTime;
    logger.info(`[MockTranscriptionProvider] Completed mock transcription for file: ${audioPath} (${durationMs}ms)`);

    return {
      text,
      provider: 'mock-mvp',
      durationMs
    };
  }
}

/**
 * Future Production OpenAI Whisper Transcription Provider (Placeholder draft structure)
 */
export class OpenAIWhisperProvider implements ITranscriptionProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
  }

  async transcribe(audioPath: string, context?: TranscriptionContext): Promise<TranscriptionResult> {
    const startTime = Date.now();
    
    if (!this.apiKey) {
      logger.warn('[OpenAIWhisperProvider] API Key missing, falling back to mock provider');
      const fallback = new MockTranscriptionProvider();
      return fallback.transcribe(audioPath, context);
    }

    // In a real implementation:
    // 1. Read audio file from audioPath.
    // 2. Call OpenAI API: https://api.openai.com/v1/audio/transcriptions
    // 3. Return the transcribed text.
    throw new Error('OpenAI Whisper transcription provider not fully configured in MVP environment.');
  }
}
