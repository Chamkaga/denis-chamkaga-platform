export enum FeatureFlag {
  AI = "ENABLE_AI",
  SUPPORT = "ENABLE_SUPPORT",
  LEDGER = "ENABLE_LEDGER",
  PUBLIC_ASSISTANT = "ENABLE_PUBLIC_ASSISTANT",
  VOICE_AI = "ENABLE_VOICE_AI"
}

export interface FeatureDefinition {
  key: FeatureFlag;
  description: string;
  defaultValue: boolean;
  phase: string;
  owner: string;
}

export const FEATURE_FLAG_DEFINITIONS: Record<FeatureFlag, FeatureDefinition> = {
  [FeatureFlag.AI]: {
    key: FeatureFlag.AI,
    description: "Enables Admin AI Copilot dashboard controls",
    defaultValue: false,
    phase: "2B",
    owner: "AI Team"
  },
  [FeatureFlag.SUPPORT]: {
    key: FeatureFlag.SUPPORT,
    description: "Enables real-time support widget and audio calling integrations",
    defaultValue: false,
    phase: "2A",
    owner: "Support Team"
  },
  [FeatureFlag.LEDGER]: {
    key: FeatureFlag.LEDGER,
    description: "Enables central double-entry financial ledger auditing",
    defaultValue: false,
    phase: "2A",
    owner: "Finance Team"
  },
  [FeatureFlag.PUBLIC_ASSISTANT]: {
    key: FeatureFlag.PUBLIC_ASSISTANT,
    description: "Enables client-side voice chatbot integrations",
    defaultValue: false,
    phase: "3",
    owner: "AI Team"
  },
  [FeatureFlag.VOICE_AI]: {
    key: FeatureFlag.VOICE_AI,
    description: "Enables real-time voice synthesis and calling features",
    defaultValue: false,
    phase: "4",
    owner: "Voice Team"
  }
};
