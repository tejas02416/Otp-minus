import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { getDb } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-otp-minus-jwt-key-2026';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface ApiKeyContext {
  id: string;
  project_id: string;
  name: string;
  environment: 'live' | 'sandbox';
  user_id: string;
}

export function signJwtToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyJwtToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (err) {
    return null;
  }
}

export function getUserFromRequest(req: NextRequest): AuthUser | null {
  const cookieToken = req.cookies.get('token')?.value;
  if (cookieToken) {
    const decoded = verifyJwtToken(cookieToken);
    if (decoded) return decoded;
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token.startsWith('opt_live_') || token.startsWith('opt_test_')) {
      return null;
    }
    return verifyJwtToken(token);
  }

  return null;
}

export async function validateApiKey(req: NextRequest): Promise<ApiKeyContext | null> {
  const db = await getDb();

  let apiKeyStr = req.headers.get('x-api-key');
  const authHeader = req.headers.get('authorization');

  if (!apiKeyStr && authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token.startsWith('opt_live_') || token.startsWith('opt_test_')) {
      apiKeyStr = token;
    }
  }

  if (!apiKeyStr) return null;

  const keyHash = crypto.createHash('sha256').update(apiKeyStr).digest('hex');

  const record = db.prepare(`
    SELECT k.id, k.project_id, k.name, k.environment, p.user_id
    FROM api_keys k
    JOIN projects p ON k.project_id = p.id
    WHERE k.key_hash = ? AND k.is_active = 1
  `).get(keyHash) as { id: string; project_id: string; name: string; environment: 'live' | 'sandbox'; user_id: string } | undefined;

  if (!record) return null;

  try {
    db.prepare('UPDATE api_keys SET last_used_at = ? WHERE id = ?').run(new Date().toISOString(), record.id);
  } catch (e) {
    // Ignore
  }

  return record;
}

export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(`otp_salt_2026_${otp}`).digest('hex');
}
