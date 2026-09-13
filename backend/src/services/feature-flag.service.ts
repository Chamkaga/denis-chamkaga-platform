// src/services/feature-flag.service.ts
// Centralized Feature Flag Management System for Safe Modular Deployments

import { env } from '../config/env';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export type FeatureFlagName =
  | 'AI_ENABLED'
  | 'MARKETING_ENABLED'
  | 'FINANCE_ENABLED'
  | 'PROJECTS_ENABLED'
  | 'CRM_ENABLED'
  | 'VOICE_ENABLED'
  | 'KNOWLEDGE_ENGINE_ENABLED';

class FeatureFlagService {
  private inMemoryOverrides: Map<FeatureFlagName, boolean> = new Map();

  constructor() {
    // Default system state configuration
    this.inMemoryOverrides.set('AI_ENABLED', env.NODE_ENV !== 'test' ? true : true);
    this.inMemoryOverrides.set('MARKETING_ENABLED', true);
    this.inMemoryOverrides.set('FINANCE_ENABLED', true);
    this.inMemoryOverrides.set('PROJECTS_ENABLED', true);
    this.inMemoryOverrides.set('CRM_ENABLED', true);
    this.inMemoryOverrides.set('VOICE_ENABLED', true);
    this.inMemoryOverrides.set('KNOWLEDGE_ENGINE_ENABLED', true);
  }

  /**
   * Check if a feature flag is enabled
   */
  async isEnabled(flag: FeatureFlagName, _organizationId?: string): Promise<boolean> {
    // Check in-memory override first
    if (this.inMemoryOverrides.has(flag)) {
      return this.inMemoryOverrides.get(flag)!;
    }

    try {
      const dbSetting = await prisma.siteSetting.findUnique({
        where: { key: `FLAG_${flag}` }
      });

      if (dbSetting) {
        return dbSetting.value === 'true';
      }
    } catch (err) {
      logger.warn(`[FeatureFlag] DB query failed for ${flag}, falling back to enabled.`);
    }

    return true;
  }

  /**
   * Set runtime override for a feature flag
   */
  setOverride(flag: FeatureFlagName, enabled: boolean): void {
    this.inMemoryOverrides.set(flag, enabled);
    logger.info(`[FeatureFlag] Override set: ${flag} = ${enabled}`);
  }

  async setFlag(flag: string, enabled: boolean): Promise<{ key: string; enabled: boolean }> {
    const flagName = flag as FeatureFlagName;
    this.inMemoryOverrides.set(flagName, enabled);
    try {
      await prisma.siteSetting.upsert({
        where: { key: `FLAG_${flag}` },
        update: { value: String(enabled) },
        create: { key: `FLAG_${flag}`, value: String(enabled), type: 'boolean', category: 'FEATURE_FLAGS' }
      });
    } catch (err) {
      logger.warn(`[FeatureFlag] Failed to persist ${flag} to DB, kept in memory.`);
    }
    return { key: flag, enabled };
  }

  /**
   * Clear runtime overrides
   */
  clearOverrides(): void {
    this.inMemoryOverrides.clear();
  }

  /**
   * Get state map of all feature flags
   */
  async getAllFlags(): Promise<Record<FeatureFlagName, boolean>> {
    const flags: FeatureFlagName[] = [
      'AI_ENABLED',
      'MARKETING_ENABLED',
      'FINANCE_ENABLED',
      'PROJECTS_ENABLED',
      'CRM_ENABLED',
      'VOICE_ENABLED',
      'KNOWLEDGE_ENGINE_ENABLED'
    ];

    const result: Partial<Record<FeatureFlagName, boolean>> = {};
    for (const flag of flags) {
      result[flag] = await this.isEnabled(flag);
    }
    return result as Record<FeatureFlagName, boolean>;
  }
}

export const featureFlagService = new FeatureFlagService();
