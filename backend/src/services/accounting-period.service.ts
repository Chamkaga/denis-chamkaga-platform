// backend/src/services/accounting-period.service.ts
// Enterprise Accounting Period Lock Engine (Open, Closing, Closed, Locked)

import { otelLogger } from '../utils/otel-logger';
import { AppError } from '../middleware/errorHandler';

export type AccountingPeriodStatus = 'OPEN' | 'CLOSING' | 'CLOSED' | 'LOCKED';

export interface AccountingPeriodRecord {
  periodKey: string; // e.g. "2026-07"
  status: AccountingPeriodStatus;
  closedAt?: Date;
  closedBy?: string;
}

class AccountingPeriodService {
  private periods: Map<string, AccountingPeriodRecord> = new Map();

  constructor() {
    // Current period is OPEN by default
    const currentKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    this.periods.set(currentKey, { periodKey: currentKey, status: 'OPEN' });
  }

  /**
   * Validate if journal postings are allowed for a given date
   */
  validatePostingAllowed(postingDate: Date, isSuperAdmin: boolean = false) {
    const periodKey = `${postingDate.getFullYear()}-${String(postingDate.getMonth() + 1).padStart(2, '0')}`;
    const period = this.periods.get(periodKey);

    if (!period) return; // Open if untracked

    if ((period.status === 'CLOSED' || period.status === 'LOCKED') && !isSuperAdmin) {
      otelLogger.warn(`[AccountingPeriod] Blocked posting to ${period.status} period ${periodKey}`);
      throw new AppError(403, 'PERIOD_LOCKED', `Accounting Period ${periodKey} is ${period.status}. Postings blocked.`);
    }
  }

  /**
   * Close & Lock an Accounting Period
   */
  setPeriodStatus(periodKey: string, status: AccountingPeriodStatus, userRole: string, userId: string) {
    if ((status === 'OPEN' || status === 'CLOSING') && userRole !== 'super_admin' && userRole !== 'admin') {
      throw new AppError(403, 'FORBIDDEN', 'Only Admin or Super Admin can alter accounting period locks.');
    }

    const record: AccountingPeriodRecord = {
      periodKey,
      status,
      closedAt: status === 'CLOSED' || status === 'LOCKED' ? new Date() : undefined,
      closedBy: userId
    };

    this.periods.set(periodKey, record);
    otelLogger.info(`[AccountingPeriod] Period ${periodKey} status changed to ${status} by ${userId}`);
    return record;
  }

  getPeriodStatus(periodKey: string): AccountingPeriodStatus {
    return this.periods.get(periodKey)?.status || 'OPEN';
  }
}

export const accountingPeriodService = new AccountingPeriodService();
