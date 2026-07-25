// src/ai/services/handoff.interface.ts
// Interfaces defining human handoff operations and media service placeholders.

export interface HandoffRequestParams {
  sessionId: string;
  visitorId: string;
  leadId?: string;
  customerName: string;
  customerContact: string; // email, phone, or WhatsApp number
  contextNotes: string; // compiled AI dialogue transcript/summary
}

export interface HandoffResult {
  success: boolean;
  channel: 'whatsapp' | 'email' | 'meeting' | 'voice' | 'video' | 'webrtc';
  message: string;
  redirectUrl?: string;
  details?: any;
}

export interface HumanHandoffProvider {
  name: string;
  isEnabled(): boolean;
  initiateHandoff(params: HandoffRequestParams): Promise<HandoffResult>;
}

// ── Placeholder Declarations for Media Handoff Channels ──────────────────────

export interface VoiceChannelProvider {
  initiateVoiceSession(userId: string): Promise<{ success: boolean; callSid?: string }>;
}

export interface VideoChannelProvider {
  createVideoRoom(roomName: string): Promise<{ success: boolean; roomToken?: string }>;
}

export interface WebRTCChannelProvider {
  // Reserved for future peer-to-peer live workspace collaboration
  negotiateOffer(sdpOffer: string): Promise<{ sdpAnswer: string }>;
}

// ── Registry mapping active handoff providers ────────────────────────────────

export const HANDOFF_PROVIDERS_REGISTRY: Record<string, HumanHandoffProvider> = {};

export function registerHandoffProvider(provider: HumanHandoffProvider) {
  HANDOFF_PROVIDERS_REGISTRY[provider.name.toLowerCase()] = provider;
}
