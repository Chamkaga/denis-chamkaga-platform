// src/ai/prompt-builder.ts
// Modular Prompt Builder constructing persona, dynamic memory, retrieved knowledge, and card schema blocks.

import { AIContext } from './context-manager';
import { ProviderMessage } from './providers/provider.interface';
import { adminCopilotService } from './services/admin-copilot.service';
import { DENIS_PERSONAL_KNOWLEDGE } from '@dc/shared';

// ─── Modular Formatters ──────────────────────────────────────────────────────

const PersonaManager = {
  getSystemBase(language: 'sw' | 'en'): string {
    if (language === 'sw') {
      return `Jina lako ni **Mary**, Mfanyakazi wa Kwanza wa Kidijitali na Mshauri mkuu wa Biashara wa Denis Chamkaga (Denis Chamkaga's Digital Front Office & Business Growth Partner).

FALSAFA NA NIDHAMU YAKO YA KAZI:
1. UTAMBULISHO WA FRONT OFFICE: Wewe si chatbot ya kawaida wala search engine. Wewe ni Mfanyakazi wa Kwanza wa Kampuni ya Denis Chamkaga. Unapokea wageni, unawafundisha, unaelewa biashara zao, unapima utayari wao wa kidijitali, unaandaa ramani ya ukuaji (visual roadmap), na kumuunganisha mteja na Denis.
2. SHIDA YA BIASHARA KWANZA (BUSINESS PROBLEM FIRST): Wageni wengi hawatafuti "ERP" au "CRM". Wanatafuta suluhisho la changamoto zao (mauzo kupotea, stoki kuibiwa, madeni kusahaulika, kuchat WhatsApp masaa mengi). Sikiliza na utambue shida ya biashara kwanza kabla ya kutaja mfumo wowote.
3. KUTOA ELIMU KABLA YA KUUZA (EDUCATE BEFORE SELLING): Anza kwa kueleza KWA NINI daftari za mkono au WhatsApp hufikia kikomo biashara inapokua (financial leakage, lost debts, staff mistakes) kabla ya kupendekeza mfumo.
4. UFAHAMU WA DENIS CHAMKAGA: Denis ni Msomi wa Digrii ya Business Information Technology mwenye uzoefu wa miaka 8+ aliyejenga mifumo 20+ ya biashara Tanzania (POS, Inventory, ERP, Credit Portals). Ana utaalamu wa PostgreSQL, React, Node.js, na Ulinzi wa OWASP Security. Akiulizwa "Kwa nini nimchague Denis?", jibu kwa kujiamini ukitaja uzoefu wake na uwezo wa kutengeneza mfumo maalum wa biashara zao.
5. MAJIBU KWA KISWAHILI WA KIBIASHARA: Tumia Kiswahili sanifu cha kibiashara cha Kitanzania. Tumia msamiati unaofahamika (madeni, vitabu vya stoki, M-Pesa, Airtel Money, risiti za mkono, faida halisi).
6. UKUSANYAJI WA TAARIFA TARATIBU: Usiulize fomu ndefu mara moja. Kusanya Jina, Barua pepe, Simu, Aina ya Biashara, na Aina ya Mfumo taratibu wakati wa mazungumzo.
7. HANDOVER KWA DENIS: Mteja akiwa tayari kufanya mkutano au kuomba nukuu ya bei, muandalie taarifa kamili bila kumfanya ajirudie.`;
    }

    return `Your name is **Mary**, Denis Chamkaga's Digital Front Office Representative & Business Growth Partner.

YOUR CORE OPERATIONAL PHILOSOPHY:
1. DIGITAL FRONT OFFICE IDENTITY: You are not a generic chatbot or RAG search engine. You are the first official employee of Denis Chamkaga's Business. You welcome visitors, educate them, evaluate digital readiness, design multi-stage growth roadmaps, collect contact information, and execute seamless handovers to Denis.
2. BUSINESS PROBLEM FIRST: Visitors do not search for "ERP" or "PostgreSQL". They experience daily operational pains (untracked debt, stock theft, WhatsApp order bottlenecks, uncertain monthly profit). Always diagnose the underlying business problem first before recommending technology.
3. EDUCATE BEFORE SELLING: Explain WHY manual tools fail as volume grows (financial leakage, forgotten debts, staff error risks) before presenting a software system.
4. DENIS CHAMKAGA'S EXPERTISE: Denis holds a BSc. in Business Information Technology with 8+ years of experience engineering 20+ enterprise business systems across Tanzania. He specializes in PostgreSQL, React, Node.js, Docker, and OWASP-certified security baseline. When asked "Why should I work with Denis?", answer confidently detailing his track record and custom software methodology.
5. HUMAN CONSULTATIVE STYLE: Keep initial conversation warm, consultative, and empathetic. Avoid technical acronym dumping (ERP, CRM, API, Schema) when talking to non-technical business owners.
6. PROGRESSIVE PROFILING: Collect visitor details step-by-step during conversation: Name, Email, Phone, Business Name, Industry, Current Tools, Pain Points, Budget, and Timeline.
7. SEAMLESS HANDOVER: When a visitor requests a meeting or quote, generate a complete Lead Dossier for Denis on his Admin Dashboard without making the client repeat themselves.`;
  }
};

// ─── Admin Context Formatter ─────────────────────────────────────────────────

const AdminContextFormatter = {
  buildSystemPrompt(context: AIContext): string {
    const liveContext = context.adminPlatformContext
      ? `\n\n${adminCopilotService.formatForPrompt(context.adminPlatformContext)}`
      : '';

    return `You are the Admin AI Copilot for Denis Chamkaga's Platform — a private, intelligent operational assistant.
Your role is to assist Denis (Super Admin) in managing his professional platform and business operations.

Your core responsibilities:
1. PLATFORM OPERATIONS: Answer questions about lead status, message inbox, content, and knowledge base using the LIVE PLATFORM CONTEXT below.
2. CRM INTELLIGENCE: Summarize lead pipeline, identify hot leads, flag pending actions.
3. KNOWLEDGE MANAGEMENT: Guide Denis on updating, reviewing, or improving knowledge base documents.
4. CONTENT STRATEGY: Assist with drafting blog posts, reviewing service descriptions, or planning content.
5. SYSTEM GUIDANCE: Explain platform features, settings, and operational workflows clearly.

Strict rules:
- NEVER fabricate data. If a number is not in the LIVE PLATFORM CONTEXT, say "I don't have current data on that."
- NEVER discuss topics unrelated to Denis's platform operations, business, or professional work.
- NEVER impersonate Denis or speak on his behalf to external parties.
- Keep responses structured, direct, and actionable. Use bullet points for lists.${liveContext}`;
  }
};

const MemoryFormatter = {
  formatFacts(facts: AIContext['facts'], lead: AIContext['lead']): string {
    return `
[VISITOR MEMORY PROFILE]
- Name: ${facts.name || 'Unknown'}
- Stated Industry: ${facts.industry || 'Unknown'}
- Business Stage: ${facts.businessStage || 'Unknown'}
- Key Goals: ${facts.goals || 'Gathering information'}
- Challenges/Pain Points: ${facts.challenges || 'Not specified'}
- Budget: ${facts.budget || 'Not specified'}
- Email: ${facts.email || 'Not specified'}
- Phone: ${facts.phone || 'Not specified'}
- Lead Score: ${lead.score}%
- Lead Grade: ${lead.temperature.toUpperCase()}
`.trim();
  }
};

const DenisKnowledgeFormatter = {
  formatProfile(lang: 'sw' | 'en'): string {
    const p = DENIS_PERSONAL_KNOWLEDGE;
    if (lang === 'sw') {
      return `
[TAARIFA ZA DENIS CHAMKAGA]
- Jina: ${p.name} (${p.title})
- Elimu na Uzoefu: ${p.background}
- Falsafa: ${p.philosophy}
- Sababu za Kumchagua Denis: ${p.swahiliWhyChooseDenis.join('; ')}
`.trim();
    }
    return `
[DENIS CHAMKAGA BACKGROUND & CAPABILITIES]
- Name: ${p.name} (${p.title})
- Background: ${p.background}
- Philosophy: ${p.philosophy}
- Core Strengths: ${p.strengths.join('; ')}
- Why Work With Denis: ${p.whyChooseDenis.join('; ')}
`.trim();
  }
};

const KnowledgeFormatter = {
  formatKnowledge(docs: AIContext['knowledge']): string {
    if (docs.length === 0) {
      return `
[VERIFIED KNOWLEDGE BASE]
Denis Chamkaga is a Systems & Database Consultant specializing in POS, Inventory Control, E-Commerce, PostgreSQL, React, and Node.js for Tanzanian SMEs.
`.trim();
    }

    const docBlocks = docs.map(d => `Source: ${d.source}\nTitle: ${d.title}\nContent: ${d.content}`).join('\n\n');
    return `\n[VERIFIED KNOWLEDGE BASE]\n${docBlocks}`;
  }
};

const CardSchemaFormatter = {
  formatCards(allowedCards: string[], language: 'sw' | 'en'): string {
    const sw = language === 'sw';
    
    if (allowedCards.includes('select-industry')) {
      return `
[ALLOWED CARD SCHEMA]
Suggest the industry choice card to categorize their business:
[CARD: {
  "id": "select-industry",
  "title": "${sw ? 'Unajishughulisha na biashara gani?' : 'What type of business do you operate?'}",
  "kind": "radio",
  "options": ["Duka la Rejareja (Retail)", "Famasi (Pharmacy)", "Wauzaji wa WhatsApp", "Shule / Chuo", "Mgahawa / Bar", "Hardware", "Nyingine"],
  "actions": {"primary": "${sw ? 'Endelea' : 'Continue'}", "secondary": "${sw ? 'Ghairi' : 'Cancel'}"}
}]
`.trim();
    }

    if (allowedCards.includes('business-name-input')) {
      return `
[ALLOWED CARD SCHEMA]
Request their business name:
[CARD: {
  "id": "business-name",
  "title": "${sw ? 'Jina la biashara yako ni gani?' : 'What is your business name?'}",
  "kind": "text",
  "placeholder": "${sw ? 'Weka jina la biashara...' : 'Enter name...'}",
  "actions": {"primary": "${sw ? 'Tuma' : 'Submit'}", "secondary": "${sw ? 'Ghairi' : 'Cancel'}"}
}]
`.trim();
    }

    if (allowedCards.includes('budget-range')) {
      return `
[ALLOWED CARD SCHEMA]
Suggest budget brackets options card:
[CARD: {
  "id": "budget-range",
  "title": "${sw ? 'Bajeti yako ya makadirio ni ipi?' : 'What is your estimated budget range?'}",
  "kind": "radio",
  "options": ["1M - 3M TZS", "3M - 5M TZS", "5M - 10M TZS", "Zaidi ya 10M TZS"],
  "actions": {"primary": "${sw ? 'Tuma' : 'Submit'}", "secondary": "${sw ? 'Skip' : 'Skip'}"}
}]
`.trim();
    }

    if (allowedCards.includes('confirm-consultation')) {
      return `
[ALLOWED CARD SCHEMA]
Suggest consultation booking card:
[CARD: {
  "id": "confirm-consult",
  "title": "${sw ? 'Je, ungependa kuweka miadi ya mkutano na Denis Chamkaga?' : 'Would you like to book a strategy consultation with Denis Chamkaga?'}",
  "kind": "confirm",
  "actions": {"primary": "${sw ? 'Panga Miadi' : 'Book Meeting'}", "secondary": "${sw ? 'Baadaye' : 'Later'}"}
}]
`.trim();
    }

    return '';
  }
};

// ─── Main Prompt Builder ───

export const aiPromptBuilder = {
  build(context: AIContext): ProviderMessage[] {
    const lang = context.currentLanguage;
    const isAdmin = context.userRole === 'admin' || context.userRole === 'super_admin';
    
    const baseSystem = isAdmin
      ? AdminContextFormatter.buildSystemPrompt(context)
      : PersonaManager.getSystemBase(lang);

    const rules = `\n\n[OPERATIONAL RULES]\n${context.businessRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;
    const memory = isAdmin ? '' : `\n\n${MemoryFormatter.formatFacts(context.facts, context.lead)}`;
    const denisKnowledge = isAdmin ? '' : `\n\n${DenisKnowledgeFormatter.formatProfile(lang)}`;
    const knowledge = `\n\n${KnowledgeFormatter.formatKnowledge(context.knowledge)}`;
    const cards = isAdmin ? '' : CardSchemaFormatter.formatCards(context.allowedCards, lang);

    const cardsInstruction = cards 
      ? `\n\n${cards}\nOutput the appropriate tag on its own line when you need details. Only output one card at a time.` 
      : '';

    const contextSummaryBlock = context.contextSummary
      ? `\n\n[CONVERSATION CONTEXT SUMMARY]\n${context.contextSummary}`
      : '';

    const systemContent = isAdmin
      ? `${baseSystem}\n\nEnsure your response is structured, professional, and under 300 words.`
      : `${baseSystem}${rules}${contextSummaryBlock}${memory}${denisKnowledge}${knowledge}${cardsInstruction}\n\nEnsure responses are empathetic, consultative, structured, and kept under 180 words.`;

    const userAndAssistantHistory = context.history.filter(m => m.role !== 'system');

    return [
      { role: 'system', content: systemContent },
      ...userAndAssistantHistory
    ];
  }
};
