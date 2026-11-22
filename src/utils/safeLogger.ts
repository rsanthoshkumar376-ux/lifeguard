/**
 * LifeGuard Safe Logger
 * Prevents unintended exposure of Personal Health Information (PHI) and
 * Personally Identifiable Information (PII) in browser developer logs,
 * console output, or telemetry streams.
 */

// Patterns to scrub
const PHONE_PATTERN = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const EMAIL_PATTERN = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g;
const JWT_PATTERN = /eyJ[a-zA-Z0-9-_]+\.eyJ[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+/g;
const BEARER_PATTERN = /Bearer\s+[a-zA-Z0-9-_.]+/gi;

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'jwt',
  'pin',
  'otp',
  'bloodgroup',
  'diagnosis',
  'allergies',
  'medications',
  'medicalprofile',
  'healthrecords',
  'emergencycontacts'
]);

/**
 * Recursively redacts sensitive keys and values from objects before logging
 */
export function sanitizeLogData(data: any, depth = 0): any {
  if (depth > 5) return '[Truncated: Max Depth]';
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    return data
      .replace(JWT_PATTERN, '[REDACTED_JWT]')
      .replace(BEARER_PATTERN, 'Bearer [REDACTED_TOKEN]')
      .replace(EMAIL_PATTERN, (match) => {
        const [name, domain] = match.split('@');
        return `${name.charAt(0)}***@${domain}`;
      })
      .replace(PHONE_PATTERN, (match) => {
        return match.slice(0, 3) + '****' + match.slice(-3);
      });
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeLogData(item, depth + 1));
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lowerKey)) {
        sanitized[key] = '[REDACTED_PHI/PII]';
      } else {
        sanitized[key] = sanitizeLogData(val, depth + 1);
      }
    }
    return sanitized;
  }

  return String(data);
}

/**
 * Safe logging interface
 */
export const safeLogger = {
  info: (message: string, ...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log(`[LifeGuard INFO] ${message}`, ...args.map(a => sanitizeLogData(a)));
    }
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[LifeGuard WARN] ${message}`, ...args.map(a => sanitizeLogData(a)));
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[LifeGuard ERROR] ${message}`, ...args.map(a => sanitizeLogData(a)));
  },
  debug: (message: string, ...args: any[]) => {
    if (import.meta.env.DEV) {
      console.debug(`[LifeGuard DEBUG] ${message}`, ...args.map(a => sanitizeLogData(a)));
    }
  }
};
