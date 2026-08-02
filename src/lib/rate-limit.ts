import { getDb } from './db';

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const memoryStore: RateLimitStore = {};

export async function checkRateLimitAndSecurity(
  projectId: string,
  clientIp: string
): Promise<{ allowed: boolean; reason?: string; statusCode?: number }> {
  const db = await getDb();

  const secRule = db.prepare('SELECT * FROM security_rules WHERE project_id = ?').get(projectId) as {
    ip_whitelist: string;
    ip_blacklist: string;
    max_rate_limit_per_min: number;
    captcha_required: number;
  } | undefined;

  if (secRule) {
    const blacklist: string[] = JSON.parse(secRule.ip_blacklist || '[]');
    if (blacklist.includes(clientIp)) {
      return { allowed: false, reason: 'IP address is blacklisted by project security policy.', statusCode: 403 };
    }

    const whitelist: string[] = JSON.parse(secRule.ip_whitelist || '[]');
    if (whitelist.length > 0 && !whitelist.includes(clientIp)) {
      return { allowed: false, reason: 'IP address is not in project allowed whitelist.', statusCode: 403 };
    }

    const maxRequests = secRule.max_rate_limit_per_min || 60;
    const windowMs = 60 * 1000;
    const key = `${projectId}:${clientIp}`;
    const now = Date.now();

    if (!memoryStore[key] || memoryStore[key].resetTime < now) {
      memoryStore[key] = { count: 1, resetTime: now + windowMs };
    } else {
      memoryStore[key].count += 1;
      if (memoryStore[key].count > maxRequests) {
        return {
          allowed: false,
          reason: `Rate limit exceeded. Maximum ${maxRequests} requests per minute allowed.`,
          statusCode: 429
        };
      }
    }
  }

  return { allowed: true };
}
