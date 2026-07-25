// src/ai/visitor-intelligence.ts
// Dynamically classifies visitor profiles and detects operational business stages.

import { logger } from '../utils/logger';

export type VisitorProfile =
  | 'Explorer'
  | 'Student / Learner'
  | 'Startup Founder'
  | 'Small Business Owner'
  | 'Registered Company'
  | 'Existing Client';

export type BusinessStage =
  | 'Idea'
  | 'Startup'
  | 'Established'
  | 'Growth'
  | 'Not Applicable';

export interface ClassificationResult {
  profile: VisitorProfile;
  stage: BusinessStage;
  confidence: number;
}

export const aiVisitorIntelligence = {
  /**
   * Rule-based heuristic classifier to analyze visitor profile and business stage as a fallback.
   */
  classify(message: string, currentProfile?: VisitorProfile): ClassificationResult {
    const text = message.toLowerCase();
    let profile: VisitorProfile = currentProfile || 'Explorer';
    let stage: BusinessStage = 'Not Applicable';
    let confidence = 0.4;

    // 1. Identify Learner / Student
    if (
      text.includes('mwanafunzi') ||
      text.includes('shule') ||
      text.includes('jifunza') ||
      text.includes('student') ||
      text.includes('learn') ||
      text.includes('assignment') ||
      text.includes('homework') ||
      text.includes('soma')
    ) {
      profile = 'Student / Learner';
      stage = 'Not Applicable';
      confidence = 0.8;
    }
    // 2. Identify Existing Client
    else if (
      text.includes('mradi wangu') ||
      text.includes('my project') ||
      text.includes('invoice') ||
      text.includes('ankara') ||
      text.includes('support') ||
      text.includes('bug') ||
      text.includes('error') ||
      text.includes('shida kwenye mfumo')
    ) {
      profile = 'Existing Client';
      stage = 'Established';
      confidence = 0.75;
    }
    // 3. Identify Startup Founder
    else if (
      text.includes('startup') ||
      text.includes('wazo la biashara') ||
      text.includes('business idea') ||
      text.includes('nataka kuanzisha') ||
      text.includes('plan to start') ||
      text.includes('founder') ||
      text.includes('co-founder')
    ) {
      profile = 'Startup Founder';
      stage = 'Idea';
      confidence = 0.85;
    }
    // 4. Identify Registered Company
    else if (
      text.includes('kampuni') ||
      text.includes('company') ||
      text.includes('incorporat') ||
      text.includes('director') ||
      text.includes('ltd') ||
      text.includes('limited') ||
      text.includes('matawi') ||
      text.includes('branches')
    ) {
      profile = 'Registered Company';
      stage = text.includes('growth') || text.includes('expand') ? 'Growth' : 'Established';
      confidence = 0.8;
    }
    // 5. Identify Small Business Owner (e.g. pharmacy, shop, retail kiosk)
    else if (
      text.includes('duka') ||
      text.includes('duka langu') ||
      text.includes('pharmacy') ||
      text.includes('dawa') ||
      text.includes('salon') ||
      text.includes('barbershop') ||
      text.includes('retail') ||
      text.includes('supermarket') ||
      text.includes('mgahawa') ||
      text.includes('restaurant') ||
      text.includes('kioski') ||
      text.includes('kiosk')
    ) {
      profile = 'Small Business Owner';
      stage = 'Startup';
      confidence = 0.85;
    }

    logger.info(`[Visitor Intelligence] Classifying: "${profile}" | Stage: "${stage}" (Confidence: ${confidence})`);
    return { profile, stage, confidence };
  }
};
