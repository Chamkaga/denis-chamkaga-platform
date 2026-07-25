// backend/src/services/fraud-risk.service.ts
// Enterprise Pre-Ledger Fraud Risk Detection Service

import { otelLogger } from '../utils/otel-logger';

export interface FraudCheckRequest {
  transactionId: string;
  invoiceId?: string;
  customerEmail: string;
  amount: number;
  ipAddress?: string;
  paymentChannel?: string;
}

export interface FraudCheckResult {
  passed: boolean;
  riskScore: number; // 0 (Lowest) to 100 (Highest)
  recommendation: 'APPROVE' | 'FLAG' | 'REJECT';
  riskFlags: string[];
}

class FraudRiskService {
  private processedTransactions: Set<string> = new Set();
  private ipVelocity: Map<string, { count: number; resetAt: number }> = new Map();

  async evaluateTransaction(req: FraudCheckRequest): Promise<FraudCheckResult> {
    const riskFlags: string[] = [];
    let riskScore = 0;

    // 1. Anti-Replay & Duplicate Webhook Check
    if (this.processedTransactions.has(req.transactionId)) {
      riskFlags.push('REPLAY_ATTACK_DUPLICATE_TRANSACTION_ID');
      riskScore += 90;
    } else {
      this.processedTransactions.add(req.transactionId);
    }

    // 2. Abnormal Payment Amount Check (> 100M TZS)
    if (req.amount > 100000000) {
      riskFlags.push('HIGH_VALUE_TRANSACTION_EXCEEDS_NORMAL_THRESHOLD');
      riskScore += 25;
    }

    // 3. IP Velocity Spikes
    if (req.ipAddress) {
      const now = Date.now();
      const entry = this.ipVelocity.get(req.ipAddress) || { count: 0, resetAt: now + 60000 };
      if (now > entry.resetAt) {
        entry.count = 1;
        entry.resetAt = now + 60000;
      } else {
        entry.count++;
      }
      this.ipVelocity.set(req.ipAddress, entry);

      if (entry.count > 10) {
        riskFlags.push('HIGH_FREQUENCY_IP_VELOCITY_SPIKE');
        riskScore += 40;
      }
    }

    let recommendation: 'APPROVE' | 'FLAG' | 'REJECT' = 'APPROVE';
    if (riskScore >= 75) {
      recommendation = 'REJECT';
    } else if (riskScore >= 25) {
      recommendation = 'FLAG';
    }

    if (recommendation !== 'APPROVE') {
      otelLogger.warn(`[FraudRisk] Transaction ${req.transactionId} evaluated: Score=${riskScore}, Recommendation=${recommendation}, Flags=${riskFlags.join(',')}`);
    } else {
      otelLogger.info(`[FraudRisk] Transaction ${req.transactionId} approved safely. Risk Score: ${riskScore}`);
    }

    return {
      passed: recommendation !== 'REJECT',
      riskScore,
      recommendation,
      riskFlags
    };
  }
}

export const fraudRiskService = new FraudRiskService();
