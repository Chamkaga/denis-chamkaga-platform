// backend/src/ai/state-machine.ts
// Explicit Conversation State Machine, Policy Matrix & Active Goal Tracker

export type ConversationState =
  | 'WELCOME'
  | 'DISCOVERY'
  | 'BUSINESS_UNDERSTANDING'
  | 'READINESS_ASSESSMENT'
  | 'KNOWLEDGE_RETRIEVAL'
  | 'BUSINESS_EDUCATION'
  | 'SOLUTION_DESIGN'
  | 'ROADMAP'
  | 'LEAD_QUALIFICATION'
  | 'HANDOVER'
  | 'FOLLOW_UP';

export interface StateGoal {
  id: string;
  description: string;
  swahiliDescription: string;
  isCompleted: boolean;
}

export interface StatePolicy {
  entryConditions: string[];
  exitConditions: string[];
  timeoutMs: number;
  retryPolicy: 'none' | 'once' | 'exponential_backoff';
  rollbackState: ConversationState;
}

export interface StateMachineContext {
  currentState: ConversationState;
  activeGoal: StateGoal;
  policy: StatePolicy;
  completedGoals: string[];
  factsCollected: Record<string, any>;
  turnCount: number;
}

const STATE_POLICY_MAP: Record<ConversationState, StatePolicy> = {
  WELCOME: {
    entryConditions: ['visitor_session_created'],
    exitConditions: ['greeting_delivered'],
    timeoutMs: 10000,
    retryPolicy: 'once',
    rollbackState: 'WELCOME'
  },
  DISCOVERY: {
    entryConditions: ['greeting_delivered'],
    exitConditions: ['business_type_identified'],
    timeoutMs: 30000,
    retryPolicy: 'once',
    rollbackState: 'WELCOME'
  },
  BUSINESS_UNDERSTANDING: {
    entryConditions: ['business_type_identified'],
    exitConditions: ['pain_points_captured'],
    timeoutMs: 45000,
    retryPolicy: 'once',
    rollbackState: 'DISCOVERY'
  },
  READINESS_ASSESSMENT: {
    entryConditions: ['pain_points_captured'],
    exitConditions: ['readiness_score_calculated'],
    timeoutMs: 30000,
    retryPolicy: 'once',
    rollbackState: 'BUSINESS_UNDERSTANDING'
  },
  KNOWLEDGE_RETRIEVAL: {
    entryConditions: ['readiness_score_calculated'],
    exitConditions: ['domain_knowledge_retrieved'],
    timeoutMs: 15000,
    retryPolicy: 'exponential_backoff',
    rollbackState: 'READINESS_ASSESSMENT'
  },
  BUSINESS_EDUCATION: {
    entryConditions: ['domain_knowledge_retrieved'],
    exitConditions: ['roi_education_delivered'],
    timeoutMs: 45000,
    retryPolicy: 'once',
    rollbackState: 'READINESS_ASSESSMENT'
  },
  SOLUTION_DESIGN: {
    entryConditions: ['roi_education_delivered'],
    exitConditions: ['solution_spec_designed'],
    timeoutMs: 30000,
    retryPolicy: 'once',
    rollbackState: 'BUSINESS_EDUCATION'
  },
  ROADMAP: {
    entryConditions: ['solution_spec_designed'],
    exitConditions: ['visual_roadmap_generated'],
    timeoutMs: 30000,
    retryPolicy: 'once',
    rollbackState: 'SOLUTION_DESIGN'
  },
  LEAD_QUALIFICATION: {
    entryConditions: ['visual_roadmap_generated'],
    exitConditions: ['contact_details_captured'],
    timeoutMs: 60000,
    retryPolicy: 'once',
    rollbackState: 'ROADMAP'
  },
  HANDOVER: {
    entryConditions: ['contact_details_captured'],
    exitConditions: ['dossier_submitted_to_admin'],
    timeoutMs: 30000,
    retryPolicy: 'exponential_backoff',
    rollbackState: 'LEAD_QUALIFICATION'
  },
  FOLLOW_UP: {
    entryConditions: ['dossier_submitted_to_admin'],
    exitConditions: ['relationship_archived'],
    timeoutMs: 120000,
    retryPolicy: 'none',
    rollbackState: 'HANDOVER'
  }
};

const STATE_GOAL_MAP: Record<ConversationState, { id: string; en: string; sw: string }> = {
  WELCOME: {
    id: 'welcome_visitor',
    en: 'Welcome visitor and determine initial context or entry page',
    sw: 'Mkaribishe mgeni na utambue sababu ya ziara yake'
  },
  DISCOVERY: {
    id: 'discover_industry',
    en: 'Identify visitor business type and industry category',
    sw: 'Gundua aina ya biashara na sekta ya mgeni'
  },
  BUSINESS_UNDERSTANDING: {
    id: 'understand_pain_points',
    en: 'Listen to operational headaches and key pain points',
    sw: 'Sikiliza changamoto kuu na maumivu ya kibiashara'
  },
  READINESS_ASSESSMENT: {
    id: 'assess_digital_readiness',
    en: 'Evaluate 5-pillar digital maturity and calculate readiness score',
    sw: 'Pima utayari wa kidijitali na ukokotoe namba ya asilimia (%)'
  },
  KNOWLEDGE_RETRIEVAL: {
    id: 'retrieve_domain_knowledge',
    en: 'Fetch relevant domain and Denis personal knowledge',
    sw: 'Tafuta maarifa sahihi ya biashara na Denis'
  },
  BUSINESS_EDUCATION: {
    id: 'proactive_education',
    en: 'Proactively educate visitor on ROI and why manual tools fail',
    sw: 'Kutoa elimu ya kibiashara kabla ya kupendekeza mfumo'
  },
  SOLUTION_DESIGN: {
    id: 'design_solution',
    en: 'Design tailored business software solution',
    sw: 'Sanifu suluhisho maalum la mfumo wa biashara'
  },
  ROADMAP: {
    id: 'generate_visual_roadmap',
    en: 'Generate multi-stage growth timeline card',
    sw: 'Tengeneza kadi ya picha ya ramani ya ukuaji'
  },
  LEAD_QUALIFICATION: {
    id: 'qualify_lead',
    en: 'Progressively collect contact details and timeline',
    sw: 'Kusanya taarifa za mawasiliano na bajeti taratibu'
  },
  HANDOVER: {
    id: 'admin_handover',
    en: 'Compile structured dossier for Denis on Admin Dashboard',
    sw: 'Andaa taarifa kamili ya mteja kwa Denis kwenye Admin Dashboard'
  },
  FOLLOW_UP: {
    id: 'longterm_relationship',
    en: 'Persist long-term relationship memory and offer follow-up',
    sw: 'Hifadhi kumbukumbu ya miaka mingi ya ufuatiliaji'
  }
};

export const conversationStateMachine = {
  /**
   * Evaluates current message and facts to determine state transition, policy, and active goal.
   */
  evaluateState(
    currentCtx?: Partial<StateMachineContext>,
    userMessage: string = '',
    facts: Record<string, any> = {}
  ): StateMachineContext {
    const currentState = currentCtx?.currentState || 'WELCOME';
    const turnCount = (currentCtx?.turnCount || 0) + 1;
    const completedGoals = currentCtx?.completedGoals || [];

    let nextState: ConversationState = currentState;

    const lowerMsg = userMessage.toLowerCase();

    // State transition rules
    if (currentState === 'WELCOME') {
      nextState = 'DISCOVERY';
    } else if (currentState === 'DISCOVERY') {
      if (facts.industry || facts.businessType || lowerMsg.includes('biashara') || lowerMsg.includes('duka') || lowerMsg.includes('shop') || lowerMsg.includes('pharmacy')) {
        nextState = 'BUSINESS_UNDERSTANDING';
      }
    } else if (currentState === 'BUSINESS_UNDERSTANDING') {
      if (facts.challenges || facts.painPoints || lowerMsg.includes('stoki') || lowerMsg.includes('faida') || lowerMsg.includes('madeni') || lowerMsg.includes('loss') || lowerMsg.includes('whatsapp') || lowerMsg.includes('excel')) {
        nextState = 'READINESS_ASSESSMENT';
      }
    } else if (currentState === 'READINESS_ASSESSMENT') {
      nextState = 'KNOWLEDGE_RETRIEVAL';
    } else if (currentState === 'KNOWLEDGE_RETRIEVAL') {
      nextState = 'BUSINESS_EDUCATION';
    } else if (currentState === 'BUSINESS_EDUCATION') {
      nextState = 'SOLUTION_DESIGN';
    } else if (currentState === 'SOLUTION_DESIGN') {
      nextState = 'ROADMAP';
    } else if (currentState === 'ROADMAP') {
      if (facts.name || facts.phone || facts.email || lowerMsg.includes('bei') || lowerMsg.includes('price') || lowerMsg.includes('nukuu') || lowerMsg.includes('quote') || lowerMsg.includes('mkutano') || lowerMsg.includes('meeting')) {
        nextState = 'LEAD_QUALIFICATION';
      }
    } else if (currentState === 'LEAD_QUALIFICATION') {
      if (lowerMsg.includes('mkutano') || lowerMsg.includes('meeting') || lowerMsg.includes('denis') || lowerMsg.includes('nukuu') || lowerMsg.includes('quote') || (facts.email && facts.phone)) {
        nextState = 'HANDOVER';
      }
    } else if (currentState === 'HANDOVER') {
      nextState = 'FOLLOW_UP';
    }

    const goalInfo = STATE_GOAL_MAP[nextState];
    const policy = STATE_POLICY_MAP[nextState];

    if (!completedGoals.includes(goalInfo.id) && nextState !== currentState) {
      completedGoals.push(STATE_GOAL_MAP[currentState].id);
    }

    return {
      currentState: nextState,
      activeGoal: {
        id: goalInfo.id,
        description: goalInfo.en,
        swahiliDescription: goalInfo.sw,
        isCompleted: false
      },
      policy,
      completedGoals,
      factsCollected: facts,
      turnCount
    };
  }
};
