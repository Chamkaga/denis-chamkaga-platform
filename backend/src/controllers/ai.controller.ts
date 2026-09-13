// src/controllers/ai.controller.ts

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { conversationService } from '../ai/services/conversation.service';
import { getAIProvider } from '../ai/providers';
import { ApiResponse } from '../types/api';
import { webrtcSignaling } from '../ai/webrtc-signaling';
import prisma from '../config/database';
import { sessionCapabilityService } from '../ai/session-capability.service';
import { AppError } from '../middleware/errorHandler';

const chatSchema = z.object({
  message: z.string().min(1).max(2000, 'Message too long'),
  sessionId: z.string().optional(),
  visitorId: z.string().optional(),
  language: z.enum(['en', 'sw']).optional(),
});

export const aiController = {
  async webrtcSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isEnabled = process.env.WEBRTC_ENABLED === 'true';
      const presenceState = await prisma.siteSetting.findUnique({
        where: { key: 'presence_state' }
      });
      const presence = presenceState?.value || 'Offline';
      
      const activeCallCount = await prisma.callSession.count({
        where: {
          status: {
            in: ['initiated', 'ringing', 'answered', 'connecting', 'connected', 'reconnecting']
          }
        }
      });

      const webRtcActive = isEnabled && presence === 'Online' && activeCallCount === 0;
      if (!webRtcActive) {
        res.status(503).json({
          success: false,
          error: { code: 'WEBRTC_DISABLED', message: 'Voice calls are currently offline or busy' }
        });
        return;
      }
      
      // Structural placeholder response for WebRTC SDP offer/answer negotiation
      const { sdpOffer } = req.body;
      if (!sdpOffer) {
        res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'sdpOffer is required' }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          sdpAnswer: 'v=0\no=- 0 0 IN IP4 127.0.0.1\ns=-\nt=0 0\na=inactive\n',
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
          ]
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async webrtcSessionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isEnabled = process.env.WEBRTC_ENABLED === 'true';
      const presenceState = await prisma.siteSetting.findUnique({
        where: { key: 'presence_state' }
      });
      const presence = presenceState?.value || 'Online';
      
      const activeCallCount = await prisma.callSession.count({
        where: {
          status: {
            in: ['initiated', 'ringing', 'answered', 'connecting', 'connected', 'reconnecting']
          }
        }
      });

      const sessionId = req.query.sessionId as string;
      let qualified = false;

      if (sessionId) {
        await sessionCapabilityService.assertRequestAccess(req, { sessionId });
        const session = await prisma.chatSession.findUnique({
          where: { id: sessionId },
          include: { lead: true }
        });
        if (session) {
          const metadata = (session.metadata as Record<string, any> | null) || {};
          const authorization = metadata.maryCallAuthorization;
          qualified = authorization?.allowed === true
            && !authorization?.consumedAt
            && Date.parse(authorization?.expiresAt || '') > Date.now();
        }
      }

      const webRtcActive = isEnabled && presence !== 'Offline' && activeCallCount === 0 && qualified;
      res.status(200).json({
        success: true,
        data: {
          enabled: webRtcActive,
          status: activeCallCount > 0
            ? 'busy'
            : (!qualified ? 'mary_authorization_required' : (webRtcActive ? 'ready' : 'disabled'))
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async postOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId, sdpOffer } = req.body;
      if (!sessionId || !sdpOffer) {
        res.status(400).json({ success: false, error: { message: 'sessionId and sdpOffer are required' } });
        return;
      }

      const chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { lead: true }
      });

      if (!chatSession) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Chat session not found' } });
        return;
      }

      const sessionMetadata = (chatSession.metadata as Record<string, any> | null) || {};
      const callAuthorization = sessionMetadata.maryCallAuthorization;
      const isAuthorizedByMary = callAuthorization?.allowed === true
        && !callAuthorization?.consumedAt
        && Date.parse(callAuthorization?.expiresAt || '') > Date.now();
      if (!isAuthorizedByMary) {
        throw new AppError(403, 'MARY_CALL_AUTHORIZATION_REQUIRED', 'Mary must authorize this call before it can be placed.');
      }

      const activeCallCount = await prisma.callSession.count({
        where: {
          status: {
            in: ['initiated', 'ringing', 'answered', 'connecting', 'connected', 'reconnecting']
          }
        }
      });
      if (activeCallCount >= 1) {
        res.status(503).json({ success: false, error: { code: 'BUSY', message: 'Denis is currently on another call.' } });
        return;
      }

      webrtcSignaling.registerOffer(sessionId, sdpOffer);

      const leadScoreBefore = chatSession?.lead?.score || 0;

      const callSession = await prisma.callSession.upsert({
        where: { sessionId },
        update: {
          status: 'initiated',
          startedAt: new Date(),
          leadId: chatSession?.leadId || null,
          chatSessionId: sessionId,
          leadScoreBefore
        },
        create: {
          sessionId,
          callerName: chatSession?.lead?.name || 'Visitor',
          receiverName: 'Denis (Admin)',
          status: 'initiated',
          startedAt: new Date(),
          leadId: chatSession?.leadId || null,
          chatSessionId: sessionId,
          leadScoreBefore
        }
      });

      await prisma.chatSession.update({
        where: { id: sessionId },
        data: {
          metadata: {
            ...sessionMetadata,
            maryCallAuthorization: {
              ...callAuthorization,
              consumedAt: new Date().toISOString(),
              callSessionId: callSession.id
            }
          }
        }
      });

      await prisma.callLog.create({
        data: {
          callSessionId: callSession.id,
          event: 'join',
          detail: 'Caller initiated the call'
        }
      });

      // Asynchronously generate customer brief and save to CallSession
      const { leadIntelligenceService } = await import('../ai/services/lead-intelligence.service');
      leadIntelligenceService.generateCustomerBrief(sessionId).then(async (brief) => {
        await prisma.callSession.update({
          where: { sessionId },
          data: { customerBrief: brief }
        });
      }).catch(err => console.error('Failed to generate Customer Brief:', err));

      res.status(200).json({ success: true, message: 'SDP Offer registered', data: { callSessionId: callSession.id } });
    } catch (err) {
      next(err);
    }
  },

  async getOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = String(req.params.sessionId);
      const sdpOffer = webrtcSignaling.getOffer(sessionId);
      res.status(200).json({ success: true, data: { sdpOffer } });
    } catch (err) {
      next(err);
    }
  },

  async postAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId, sdpAnswer } = req.body;
      if (!sessionId || !sdpAnswer) {
        res.status(400).json({ success: false, error: { message: 'sessionId and sdpAnswer are required' } });
        return;
      }
      webrtcSignaling.registerAnswer(sessionId, sdpAnswer);

      const callSession = await prisma.callSession.findUnique({ where: { sessionId } });
      if (callSession) {
        await prisma.callSession.update({
          where: { id: callSession.id },
          data: {
            status: 'connected',
            answeredAt: new Date()
          }
        });

        await prisma.callLog.create({
          data: {
            callSessionId: callSession.id,
            event: 'join',
            detail: 'Admin answered and joined the call'
          }
        });
      }

      res.status(200).json({ success: true, message: 'SDP Answer registered' });
    } catch (err) {
      next(err);
    }
  },

  async getAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = String(req.params.sessionId);
      const sdpAnswer = webrtcSignaling.getAnswer(sessionId);
      res.status(200).json({ success: true, data: { sdpAnswer } });
    } catch (err) {
      next(err);
    }
  },

  async postCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId, role, candidate } = req.body;
      if (!sessionId || !role || !candidate) {
        res.status(400).json({ success: false, error: { message: 'sessionId, role and candidate are required' } });
        return;
      }
      if (role !== 'visitor') {
        throw new AppError(403, 'FORBIDDEN', 'Public callers may only submit visitor candidates');
      }
      webrtcSignaling.addCandidate(sessionId, role as any, candidate);
      res.status(200).json({ success: true, message: 'ICE candidate registered' });
    } catch (err) {
      next(err);
    }
  },

  async getCandidates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = String(req.params.sessionId);
      const role = req.query.role as 'visitor' | 'admin';
      if (!role) {
        res.status(400).json({ success: false, error: { message: 'role parameter is required' } });
        return;
      }
      const candidates = webrtcSignaling.getCandidates(sessionId, role);
      res.status(200).json({ success: true, data: { candidates } });
    } catch (err) {
      next(err);
    }
  },

  async createCallLog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        sessionId, 
        status, 
        denisNotes, 
        packetLoss, 
        latency, 
        jitter, 
        audioLevel, 
        reconnectCount 
      } = req.body;

      if (!sessionId || !status) {
        res.status(400).json({ success: false, error: { message: 'sessionId and status are required' } });
        return;
      }
      const actorRole = String((req as any).user?.role || '').toLowerCase();
      const isAuthorizedOperator = ['owner', 'super_admin', 'admin'].includes(actorRole);
      if (denisNotes !== undefined && !isAuthorizedOperator) {
        throw new AppError(403, 'FORBIDDEN', 'Internal call notes require administrator access');
      }

      const callSession = await prisma.callSession.findUnique({ where: { sessionId } });
      if (!callSession) {
        res.status(404).json({ success: false, error: { message: 'Call session not found' } });
        return;
      }

      const allowedVisitorTransitions: Record<string, string[]> = {
        initiated: ['cancelled', 'failed', 'missed'],
        ringing: ['cancelled', 'failed', 'missed'],
        connecting: ['cancelled', 'failed'],
        connected: ['completed', 'failed'],
        reconnecting: ['completed', 'failed'],
      };
      const allowedOperatorTransitions: Record<string, string[]> = {
        initiated: ['declined', 'failed', 'missed'],
        ringing: ['declined', 'failed', 'missed'],
        answered: ['completed', 'failed'],
        connecting: ['completed', 'failed'],
        connected: ['completed', 'failed'],
        reconnecting: ['completed', 'failed'],
      };
      const allowedTransitions = isAuthorizedOperator ? allowedOperatorTransitions : allowedVisitorTransitions;
      if (!(allowedTransitions[callSession.status] || []).includes(status)) {
        throw new AppError(409, 'INVALID_CALL_TRANSITION', `Cannot transition call from ${callSession.status} to ${status}`);
      }

      const endedAt = new Date();
      const startedAt = callSession.startedAt;
      const durationSec = Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 1000));

      const updated = await prisma.callSession.update({
        where: { id: callSession.id },
        data: {
          endedAt,
          status: status === 'completed' && durationSec === 0 ? 'missed' : status,
          durationSec,
          denisNotes: denisNotes || undefined,
          packetLoss: packetLoss !== undefined ? +packetLoss : null,
          latency: latency !== undefined ? +latency : null,
          jitter: jitter !== undefined ? +jitter : null,
          audioLevel: audioLevel !== undefined ? +audioLevel : null,
          reconnectCount: reconnectCount !== undefined ? +reconnectCount : 0
        }
      });

      await prisma.callLog.create({
        data: {
          callSessionId: callSession.id,
          event: 'leave',
          detail: `Call finished. Status: ${status}`
        }
      });

      webrtcSignaling.clearSession(sessionId);

      const { aiEventBus } = await import('../ai/event-bus');
      aiEventBus.publish('VoiceCallCompleted', {
        sessionId: callSession.sessionId,
        callSessionId: callSession.id,
        durationSec,
        status: updated.status,
        startedAt,
        endedAt
      });

      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { message, sessionId, visitorId, language } = chatSchema.parse(req.body);
      if (sessionId) {
        await sessionCapabilityService.assertRequestAccess(req, { sessionId });
      }
      
      // Configure Server-Sent Events (SSE) headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for proxies
      
      await conversationService.chatStream({ message, sessionId, visitorId, language }, res);
    } catch (err) {
      next(err);
    }
  },

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = req.params.sessionId as string;
      const messages = await conversationService.getSessionHistory(sessionId);
      res.status(200).json({ success: true, data: { messages } } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async health(req: Request, res: Response): Promise<void> {
    const provider = getAIProvider();
    let status = 'online';
    let modelName = 'unknown';
    try {
      const hc = await provider.healthCheck();
      status = hc.status === 'healthy' ? 'online' : 'offline';
      modelName = hc.model;
    } catch {
      status = 'offline';
    }
    
    res.status(200).json({
      success: true,
      data: {
        status,
        model: modelName,
        provider: 'openai'
      },
    } satisfies ApiResponse);
  },

  async closeSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = req.params.sessionId as string;
      const { rating, comments } = req.body;
      await conversationService.closeSession(sessionId, rating ? +rating : undefined, comments);
      res.status(200).json({ success: true, data: { message: 'Session closed with feedback saved.' } } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async downloadSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = req.params.sessionId as string;
      const history = await conversationService.getSessionHistory(sessionId);
      
      const formattedLog = history
        .map(msg => `[${msg.role.toUpperCase()}]\n${msg.content}`)
        .join('\n\n------------------------------------------------------------\n\n');

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename=chat-history-${sessionId}.txt`);
      res.send(formattedLog);
    } catch (err) {
      next(err);
    }
  },

  async getVisitorSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const visitorId = req.params.visitorId as string;
      const sessions = await conversationService.getVisitorSessions(visitorId);
      res.status(200).json({ success: true, data: { sessions } } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async renameSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = req.params.sessionId as string;
      const { title } = z.object({ title: z.string().min(1).max(100) }).parse(req.body);
      await conversationService.renameSession(sessionId, title);
      res.status(200).json({ success: true, data: { message: 'Session renamed' } } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async deleteSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = req.params.sessionId as string;
      await conversationService.deleteSession(sessionId);
      res.status(200).json({ success: true, data: { message: 'Session deleted' } } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },
};
