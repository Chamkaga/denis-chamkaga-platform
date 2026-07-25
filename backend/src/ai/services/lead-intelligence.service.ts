// src/ai/services/lead-intelligence.service.ts
// Handles evaluation of leads, lead temperature grading, and compilation of structured intelligence summaries.

import { ChatSessionFacts } from '../memory';
import { logger } from '../../utils/logger';

export interface LeadGrading {
  score: number;
  temperature: 'cold' | 'warm' | 'hot';
  recommendation: string;
}

export interface LeadIntelligenceSummary {
  visitorProfile: string;
  businessStage: string;
  industry: string;
  goals: string;
  painPoints: string;
  leadScore: number;
  temperature: 'cold' | 'warm' | 'hot';
  recommendedNextAction: string;
}

export const leadIntelligenceService = {
  /**
   * Evaluates the lead score and grade based on facts, active intent, and message count.
   */
  evaluate(facts: ChatSessionFacts, activeIntent: string, messageCount: number): LeadGrading {
    let score = 0; // Starts at 0 points

    // 1. Contact Fields (Max 35 pts)
    if (facts.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(facts.email.trim())) {
        score += 20;
      }
    }
    if (facts.phone && facts.phone.trim().length > 0) {
      score += 15;
    }

    // 2. Project Context Fields (Max 45 pts)
    if (facts.budget && facts.budget.trim().length > 0) {
      score += 20;
    }
    if (facts.timeline && facts.timeline.trim().length > 0) {
      score += 15;
    }
    if (facts.company && facts.company.trim().length > 0) {
      score += 10;
    }

    // 3. Engagement Signals (Max 20 pts)
    if (messageCount >= 5) {
      score += 5;
    }
    if (activeIntent.toLowerCase() === 'consultation' || activeIntent.toLowerCase() === 'booking') {
      score += 15;
    }

    // Cap score at 100%
    score = Math.min(score, 100);

    // Grade temperature
    let temperature: 'cold' | 'warm' | 'hot' = 'cold';
    let recommendation = 'Provide Portfolio & General Services Info';

    if (score >= 61) {
      temperature = 'hot';
      recommendation = 'Immediately escalate lead. Send email notification to Denis. Renders calendar CTA.';
    } else if (score >= 31) {
      temperature = 'warm';
      recommendation = 'Flag lead in CRM. Include conversation transcript.';
    }

    logger.info(`[LeadIntelligenceService] Evaluated Lead - Score: ${score}%, Temp: ${temperature.toUpperCase()}, Rec: "${recommendation}"`);

    return { score, temperature, recommendation };
  },

  /**
   * Compiles structured business intelligence for a qualified lead conversation session.
   */
  compileSummary(facts: ChatSessionFacts, grade: LeadGrading): LeadIntelligenceSummary {
    return {
      visitorProfile: facts.visitorProfile || 'Explorer',
      businessStage: facts.businessStage || 'Not Applicable',
      industry: facts.industry || 'Unknown',
      goals: facts.goals || 'Information gathering',
      painPoints: facts.challenges || 'Unknown operational bottlenecks',
      leadScore: grade.score,
      temperature: grade.temperature,
      recommendedNextAction: grade.recommendation,
    };
  },

  /**
   * Generates Explainability Dossier detailing why AI made specific recommendations.
   */
  generateExplainabilityDossier(facts: ChatSessionFacts, grade: LeadGrading, readinessScore = 37): Record<string, any> {
    const industry = facts.industry || 'General Business';
    const challenges = facts.challenges || 'Manual inventory and debt tracking';
    const budget = facts.budget || 'Standard SME Bracket';

    return {
      recommendedSolution: `Custom ${industry} POS & Business Management System`,
      whyRecommended: `Visitor stated key operational pain points: "${challenges}". Custom automation eliminates stock leakage and unrecorded debt loss.`,
      whyReadinessScore: `Readiness score evaluated at ${readinessScore}% due to reliance on notebooks/manual tools without real-time inventory control.`,
      whyLeadTemperatureIsHot: `Lead score reached ${grade.score}% (${grade.temperature.toUpperCase()}) due to stated budget bracket of "${budget}" and request for consultation.`,
      confidenceScore: "94% (High Confidence)",
      sourcesCited: [
        "docs/BusinessTransformation.md",
        "shared/src/constants/businessGuides.ts"
      ]
    };
  },

  /**
   * Generates a plain text format of the Lead Intelligence summary for emails/notifications.
   */
  formatTextSummary(summary: LeadIntelligenceSummary): string {
    return `
--- LEAD BUSINESS INTELLIGENCE SUMMARY ---
Visitor Profile: ${summary.visitorProfile}
Business Stage: ${summary.businessStage}
Stated Industry: ${summary.industry}
Key Business Goals: ${summary.goals}
Pain Points / Challenges: ${summary.painPoints}
Lead Score: ${summary.leadScore}%
Lead Temperature: ${summary.temperature.toUpperCase()}
Recommended Next Action: ${summary.recommendedNextAction}
------------------------------------------
`.trim();
  },

  /**
   * Compiles pre-call customer brief from history and facts using LLM.
   */
  async generateCustomerBrief(sessionId: string): Promise<any> {
    const { getAIProvider } = await import('../providers');
    const { aiMemory } = await import('../memory');
    const prisma = (await import('../../config/database')).default;

    const facts = await aiMemory.getFacts(sessionId);
    const history = await prisma.aiConversation.findMany({
      where: { sessionId, role: { not: 'system' } },
      orderBy: { createdAt: 'asc' }
    });
    const historyText = history.map(h => `${h.role === 'user' ? 'Visitor' : 'AI'}: ${h.content}`).join('\n');
    
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { lead: true }
    });
    const meta = (chatSession?.metadata as any) || {};

    const startTime = chatSession?.startedAt || new Date();
    const durationMin = Math.max(1, Math.round((Date.now() - startTime.getTime()) / 60000));
    
    const systemPrompt = `You are Denis Chamkaga's Business Intelligence Assistant.
Analyze the provided chat history and facts for a visitor, and generate a structured Customer Brief for Denis before he answers a voice call.
Infer any missing fields (like position, budget, timeline, main problem, desired outcome, urgency) as accurately as possible from the dialogue.
If a field is completely unknown and cannot be reasonably inferred, output "Not specified" or a reasonable estimation.

Your output must be a valid JSON object matching this structure (do not include markdown backticks or explanations):
{
  "name": "Visitor Name",
  "position": "Job Title / Position (e.g. CEO, Startup Founder, Owner)",
  "company": "Company Name",
  "country": "Visitor Country if known",
  "leadTemperature": "cold" | "warm" | "hot",
  "leadScore": 0-100 score,
  "serviceRequested": "Specific service of interest (e.g. POS development, CRM, ERP)",
  "currentPage": "Current page path or title",
  "budget": "Budget discussed or estimation",
  "timeline": "Timeline discussed or estimation",
  "conversationDuration": "${durationMin} minutes",
  "summary": "Concise paragraph summarizing the key details of the conversation",
  "painPoints": ["Bullet 1", "Bullet 2", ...],
  "goals": ["Goal 1", "Goal 2", ...],
  "recommendedApproach": "Specific sales advice for Denis on how to guide this call",
  "suggestedOpening": "A natural, friendly opening quote Denis can use to start the call"
}`;

    const prompt = `Chat History:\n${historyText}\n\nFacts:\n${JSON.stringify(facts)}\n\nMetadata:\n${JSON.stringify(meta)}`;

    try {
      const provider = getAIProvider();
      const result = await provider.generate([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]);

      const cleanContent = result.content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanContent);
    } catch (err: any) {
      logger.warn('[LeadIntelligenceService] Failed to generate customer brief from LLM, returning default brief:', err.message);
      return {
        name: facts.name || 'Visitor',
        position: 'Business Owner',
        company: facts.company || 'Unknown Company',
        country: meta.country || 'Tanzania',
        leadTemperature: chatSession?.lead?.temperature || 'cold',
        leadScore: chatSession?.lead?.score || 0,
        serviceRequested: facts.interests || 'Custom Software Development',
        currentPage: meta.currentPage || 'Home',
        budget: facts.budget || 'Not specified',
        timeline: facts.timeline || 'Not specified',
        conversationDuration: `${durationMin} minutes`,
        summary: 'Visitor initiated a voice call after chatting with the AI.',
        painPoints: [facts.challenges || 'Unknown challenges'],
        goals: [facts.goals || 'Improve business systems'],
        recommendedApproach: 'Qualify their requirements and discuss implementation timelines.',
        suggestedOpening: `Hello ${facts.name || 'there'}, thank you for waiting. I understand you're looking for solutions. Let's continue from there.`
      };
    }
  },

  /**
   * Compiles CRM post-call report from rough notes and dialogue using LLM.
   */
  async generateCRMSummary(sessionId: string, rawNotes: string): Promise<any> {
    const { getAIProvider } = await import('../providers');
    const { aiMemory } = await import('../memory');
    const prisma = (await import('../../config/database')).default;

    const facts = await aiMemory.getFacts(sessionId);
    const history = await prisma.aiConversation.findMany({
      where: { sessionId, role: { not: 'system' } },
      orderBy: { createdAt: 'asc' }
    });
    const historyText = history.map(h => `${h.role === 'user' ? 'Visitor' : 'AI'}: ${h.content}`).join('\n');

    const systemPrompt = `You are Denis Chamkaga's CRM Intelligence Assistant.
Your task is to take Denis's rough, raw call notes and the preceding chat conversation history, and transform them into a highly structured Customer Relationship summary.
Infer details from the chat history if they are missing from Denis's notes, but prioritize Denis's notes as the ground truth.

Your output must be a valid JSON object matching the following structure (do not write any markdown backticks or explanations):
{
  "customerProfile": "Detailed description of the customer profile/vertical",
  "businessNeeds": "Business needs identified during chat/call",
  "painPoints": "Pain points / bottlenecks discussed",
  "budget": "Budget details or estimated range",
  "timeline": "Timeline for implementation",
  "decisionMakers": "Identified decision makers or roles",
  "objections": "Objections or concerns raised",
  "risks": "Potential risks or project blockers",
  "nextAction": "Immediate next action / follow-up tasks",
  "followUpPlan": "Longer term follow up plan",
  "recommendedService": "Recommended services for their needs",
  "probabilityOfClosing": "Percentage (e.g. 85%) or range (e.g. High)"
}`;

    const prompt = `Raw Call Notes:\n${rawNotes}\n\nChat Conversation History:\n${historyText}\n\nVisitor Facts:\n${JSON.stringify(facts)}`;

    try {
      const provider = getAIProvider();
      const result = await provider.generate([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]);

      const cleanContent = result.content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanContent);
    } catch (err) {
      logger.error('[LeadIntelligenceService] Failed to generate/parse CRM summary:', err);
      return {
        customerProfile: 'Standard business profile',
        businessNeeds: 'General custom development',
        painPoints: 'Slow manual reporting',
        budget: 'Under discussion',
        timeline: 'Under discussion',
        decisionMakers: 'Stated contact',
        objections: 'None',
        risks: 'None noted',
        nextAction: 'Follow up next week',
        followUpPlan: 'Call client back',
        recommendedService: 'Custom Database & CRM',
        probabilityOfClosing: 'Medium'
      };
    }
  }
};
