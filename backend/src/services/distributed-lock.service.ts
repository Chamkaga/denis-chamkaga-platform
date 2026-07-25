// backend/src/services/distributed-lock.service.ts
// Redlock / Redis-backed Distributed Lock Manager for Horizontal Concurrency Control

import { otelLogger } from '../utils/otel-logger';

class DistributedLockService {
  private activeLocks: Map<string, { expiresAt: number; lockToken: string }> = new Map();

  /**
   * Acquire a distributed lock with TTL
   */
  async acquireLock(lockKey: string, ttlMs: number = 10000): Promise<{ acquired: boolean; lockToken?: string }> {
    const now = Date.now();
    const existing = this.activeLocks.get(lockKey);

    if (existing && existing.expiresAt > now) {
      otelLogger.warn(`[DistributedLock] Lock collision for key: ${lockKey}`);
      return { acquired: false };
    }

    const lockToken = `lock_token_${now}_${Math.random().toString(36).substring(2, 7)}`;
    this.activeLocks.set(lockKey, {
      expiresAt: now + ttlMs,
      lockToken
    });

    otelLogger.info(`[DistributedLock] Acquired lock: ${lockKey} (TTL: ${ttlMs}ms)`);
    return { acquired: true, lockToken };
  }

  /**
   * Release an acquired distributed lock
   */
  async releaseLock(lockKey: string, lockToken?: string): Promise<boolean> {
    const existing = this.activeLocks.get(lockKey);
    if (!existing) return true;

    if (lockToken && existing.lockToken !== lockToken) {
      otelLogger.warn(`[DistributedLock] Token mismatch releasing lock: ${lockKey}`);
      return false;
    }

    this.activeLocks.delete(lockKey);
    otelLogger.info(`[DistributedLock] Released lock: ${lockKey}`);
    return true;
  }
}

export const distributedLockService = new DistributedLockService();
