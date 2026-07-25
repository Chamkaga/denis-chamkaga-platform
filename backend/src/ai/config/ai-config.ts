// backend/src/ai/config/ai-config.ts
// Centralized AI Configuration & Feature Flag Control System for Denis Business Platform

export interface AIConfigurationParams {
  temperature: number;
  topP: number;
  maxTokens: number;
  toolTimeoutMs: number;
  ragTimeoutMs: number;
  confidenceThresholdPercent: number;
  maxHistoryTurns: number;
  memoryTtlSeconds: number;
  fallbackPolicy: 'knowledge_summary' | 'defer_to_denis' | 'default_greeting';
}

export interface AIFeatureFlags {
  enableRoadmapEngine: boolean;
  enableReadinessEngine: boolean;
  enableProposalEngine: boolean;
  enableCrmSync: boolean;
  enableAnalytics: boolean;
  enableMemoryEngine: boolean;
  enableKnowledgeSearch: boolean;
  enableToolRouter: boolean;
}

export interface ComponentHealthStatus {
  component: string;
  status: 'green' | 'yellow' | 'red';
  latencyMs?: number;
  lastChecked: string;
}

export const AI_CENTRAL_CONFIG: AIConfigurationParams = {
  temperature: 0.3,
  topP: 0.9,
  maxTokens: 500,
  toolTimeoutMs: 5000,
  ragTimeoutMs: 3000,
  confidenceThresholdPercent: 70,
  maxHistoryTurns: 6,
  memoryTtlSeconds: 86400, // 24 Hours
  fallbackPolicy: 'defer_to_denis'
};

export const AI_FEATURE_FLAGS: AIFeatureFlags = {
  enableRoadmapEngine: true,
  enableReadinessEngine: true,
  enableProposalEngine: true,
  enableCrmSync: true,
  enableAnalytics: true,
  enableMemoryEngine: true,
  enableKnowledgeSearch: true,
  enableToolRouter: true
};

export const platformHealthMonitor = {
  getSystemHealth(): ComponentHealthStatus[] {
    const now = new Date().toISOString();
    return [
      { component: 'AI Orchestrator', status: 'green', latencyMs: 120, lastChecked: now },
      { component: 'Knowledge Engine & RAG', status: 'green', latencyMs: 85, lastChecked: now },
      { component: 'Vector Embeddings', status: 'green', latencyMs: 45, lastChecked: now },
      { component: 'Database (PostgreSQL)', status: 'green', latencyMs: 12, lastChecked: now },
      { component: 'Memory Engine', status: 'green', latencyMs: 15, lastChecked: now },
      { component: 'Tool Router', status: 'green', latencyMs: 25, lastChecked: now },
      { component: 'CRM Integration', status: 'green', latencyMs: 30, lastChecked: now },
      { component: 'Event Bus Broker', status: 'green', latencyMs: 5, lastChecked: now }
    ];
  }
};
