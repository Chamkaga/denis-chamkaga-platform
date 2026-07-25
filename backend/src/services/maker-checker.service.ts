// backend/src/services/maker-checker.service.ts
// Dual Control Maker-Checker Financial Approval Engine

import { otelLogger } from '../utils/otel-logger';
import { AppError } from '../middleware/errorHandler';

export type ApprovalStatus = 'SUBMITTED_BY_MAKER' | 'REVIEWED_BY_CHECKER' | 'APPROVED_BY_APPROVER' | 'REJECTED';

export interface MakerCheckerRequest {
  id: string;
  actionType: string;
  amount: number;
  currency: string;
  makerUserId: string;
  checkerUserId?: string;
  approverUserId?: string;
  status: ApprovalStatus;
  payload: any;
  createdAt: Date;
}

class MakerCheckerService {
  private requests: Map<string, MakerCheckerRequest> = new Map();
  private HIGH_VALUE_THRESHOLD_TZS = 10000000; // 10 Million TZS

  /**
   * Step 1: Maker submits financial action
   */
  submitAction(actionType: string, amount: number, makerUserId: string, payload: any): { requiresChecker: boolean; request: MakerCheckerRequest } {
    const id = `req_mc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const requiresChecker = amount >= this.HIGH_VALUE_THRESHOLD_TZS;

    const request: MakerCheckerRequest = {
      id,
      actionType,
      amount,
      currency: 'TZS',
      makerUserId,
      status: 'SUBMITTED_BY_MAKER',
      payload,
      createdAt: new Date()
    };

    this.requests.set(id, request);
    otelLogger.info(`[MakerChecker] Action ${actionType} (${amount} TZS) submitted by Maker ${makerUserId}. Dual Control: ${requiresChecker}`);
    return { requiresChecker, request };
  }

  /**
   * Step 2: Checker reviews high-value action
   */
  checkerReview(requestId: string, checkerUserId: string, approve: boolean): MakerCheckerRequest {
    const req = this.requests.get(requestId);
    if (!req) throw new AppError(404, 'NOT_FOUND', 'Maker-Checker request not found.');

    if (req.makerUserId === checkerUserId) {
      throw new AppError(403, 'MAKER_CHECKER_COLLUSION_BLOCKED', 'Maker cannot act as Checker on their own request.');
    }

    req.checkerUserId = checkerUserId;
    req.status = approve ? 'REVIEWED_BY_CHECKER' : 'REJECTED';
    otelLogger.info(`[MakerChecker] Request ${requestId} reviewed by Checker ${checkerUserId}. Status: ${req.status}`);
    return req;
  }

  /**
   * Step 3: Approver final authorization
   */
  approverAuthorize(requestId: string, approverUserId: string, approve: boolean): MakerCheckerRequest {
    const req = this.requests.get(requestId);
    if (!req) throw new AppError(404, 'NOT_FOUND', 'Maker-Checker request not found.');

    if (req.makerUserId === approverUserId || req.checkerUserId === approverUserId) {
      throw new AppError(403, 'MAKER_CHECKER_COLLUSION_BLOCKED', 'Approver must be an independent third party.');
    }

    req.approverUserId = approverUserId;
    req.status = approve ? 'APPROVED_BY_APPROVER' : 'REJECTED';
    otelLogger.info(`[MakerChecker] Request ${requestId} authorized by Approver ${approverUserId}. Status: ${req.status}`);
    return req;
  }
}

export const makerCheckerService = new MakerCheckerService();
