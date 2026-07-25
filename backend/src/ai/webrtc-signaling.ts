// backend/src/ai/webrtc-signaling.ts
import { logger } from '../utils/logger';

interface SignalingSession {
  sessionId: string;
  sdpOffer?: string;
  sdpAnswer?: string;
  visitorCandidates: any[];
  adminCandidates: any[];
  createdAt: number;
}

const sessionsRegistry = new Map<string, SignalingSession>();

// Periodic garbage collection sweep
setInterval(() => {
  const now = Date.now();
  const TTL = 15 * 60 * 1000;
  for (const [sid, sess] of sessionsRegistry.entries()) {
    if (now - sess.createdAt > TTL) {
      logger.info(`[WebRTC Signaling] Garbage collecting stale session: ${sid}`);
      sessionsRegistry.delete(sid);
    }
  }
}, 5 * 60 * 1000);

export const webrtcSignaling = {
  createOrGetSession(sessionId: string): SignalingSession {
    let sess = sessionsRegistry.get(sessionId);
    if (!sess) {
      sess = {
        sessionId,
        visitorCandidates: [],
        adminCandidates: [],
        createdAt: Date.now()
      };
      sessionsRegistry.set(sessionId, sess);
      logger.info(`[WebRTC Signaling] Session registered: ${sessionId}`);
    }
    return sess;
  },

  registerOffer(sessionId: string, sdpOffer: string): void {
    const sess = this.createOrGetSession(sessionId);
    sess.sdpOffer = sdpOffer;
    logger.info(`[WebRTC Signaling] Registering SDP Offer for: ${sessionId}`);
  },

  registerAnswer(sessionId: string, sdpAnswer: string): void {
    const sess = this.createOrGetSession(sessionId);
    sess.sdpAnswer = sdpAnswer;
    logger.info(`[WebRTC Signaling] Registering SDP Answer for: ${sessionId}`);
  },

  addCandidate(sessionId: string, role: 'visitor' | 'admin', candidate: any): void {
    const sess = this.createOrGetSession(sessionId);
    if (role === 'visitor') {
      sess.visitorCandidates.push(candidate);
    } else {
      sess.adminCandidates.push(candidate);
    }
    logger.info(`[WebRTC Signaling] Adding ICE Candidate from ${role} for: ${sessionId}`);
  },

  getOffer(sessionId: string): string | undefined {
    return sessionsRegistry.get(sessionId)?.sdpOffer;
  },

  getAnswer(sessionId: string): string | undefined {
    return sessionsRegistry.get(sessionId)?.sdpAnswer;
  },

  getCandidates(sessionId: string, role: 'visitor' | 'admin'): any[] {
    const sess = sessionsRegistry.get(sessionId);
    if (!sess) return [];
    return role === 'visitor' ? sess.visitorCandidates : sess.adminCandidates;
  },

  clearSession(sessionId: string): void {
    sessionsRegistry.delete(sessionId);
    logger.info(`[WebRTC Signaling] Cleaned up session: ${sessionId}`);
  },

  getActiveOffers(): { sessionId: string; sdpOffer: string }[] {
    const list: any[] = [];
    for (const [sid, sess] of sessionsRegistry.entries()) {
      if (sess.sdpOffer && !sess.sdpAnswer) {
        list.push({ sessionId: sid, sdpOffer: sess.sdpOffer });
      }
    }
    return list;
  }
};
