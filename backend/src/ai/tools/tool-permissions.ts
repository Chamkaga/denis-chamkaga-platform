// src/ai/tools/tool-permissions.ts

import { AI_TOOLS_REGISTRY } from './tool-registry';
import { logger } from '../../utils/logger';

export const aiToolPermissions = {
  /**
   * Evaluates if the current session role has authorization to run the specified tool.
   */
  checkPermission(toolName: string, userRole: string): boolean {
    const tool = AI_TOOLS_REGISTRY[toolName];
    if (!tool) {
      logger.warn(`[AI ToolPermissions] Tool lookup failed: "${toolName}" is not registered.`);
      return false;
    }

    const hasAccess = tool.allowedRoles.includes(userRole as any);
    if (!hasAccess) {
      logger.warn(`[AI ToolPermissions] Permission DENIED: Role "${userRole}" attempted executing "${toolName}".`);
    } else {
      logger.info(`[AI ToolPermissions] Permission GRANTED: Role "${userRole}" authorized for "${toolName}".`);
    }

    return hasAccess;
  }
};
