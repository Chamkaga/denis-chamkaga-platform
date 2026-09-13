// backend/src/middleware/security.middleware.ts
// OWASP Enterprise Security Guards: Path Traversal, SSRF Prevention, and Sanitization

import { Request, Response, NextFunction } from 'express';
import net from 'net';

/**
 * Path Traversal Prevention Middleware
 * Checks request params, query strings, and body strings for ../ or ..\ sequences
 */
export const preventPathTraversal = (req: Request, res: Response, next: NextFunction): void => {
  const checkValue = (val: any): boolean => {
    if (typeof val === 'string') {
      if (val.includes('../') || val.includes('..\\') || val.includes('%2e%2e%2f') || val.includes('%2e%2e/')) {
        return true;
      }
    } else if (typeof val === 'object' && val !== null) {
      for (const k of Object.keys(val)) {
        if (checkValue(val[k])) return true;
      }
    }
    return false;
  };

  if (checkValue(req.params) || checkValue(req.query) || checkValue(req.body)) {
    res.status(400).json({
      success: false,
      error: { code: 'INVALID_PATH', message: 'Path traversal attempt detected and blocked.' }
    });
    return;
  }
  next();
};

/**
 * SSRF Guard Utility
 * Ensures internal private IP addresses (127.0.0.1, 10.x, 172.16.x, 192.168.x) cannot be requested via user-provided URLs
 */
export const validateExternalUrl = (urlString: string): boolean => {
  try {
    const parsed = new URL(urlString);
    const hostname = parsed.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname.endsWith('.local')) {
      return false;
    }

    if (net.isIP(hostname)) {
      // Check private IPv4 ranges
      const parts = hostname.split('.').map(Number);
      if (parts[0] === 10) return false;
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return false;
      if (parts[0] === 192 && parts[1] === 168) return false;
      if (parts[0] === 169 && parts[1] === 254) return false; // Link-local
    }
    return true;
  } catch (err) {
    return false;
  }
};
