import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDb } from '@/lib/db';
import { signJwtToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const db = await getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const userId = `usr_${crypto.randomBytes(8).toString('hex')}`;
    const passHash = bcrypt.hashSync(password, 10);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, created_at)
      VALUES (?, ?, ?, ?, 'developer', ?)
    `).run(userId, email, passHash, name, now);

    const projectId = `proj_${crypto.randomBytes(8).toString('hex')}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-project';

    db.prepare(`
      INSERT INTO projects (id, user_id, name, slug, environment, description, created_at)
      VALUES (?, ?, ?, ?, 'sandbox', 'My First OTP Project', ?)
    `).run(projectId, userId, `${name}'s Workspace`, slug, now);

    const rawKey = `opt_test_${crypto.randomBytes(12).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const secret = `whsec_${crypto.randomBytes(16).toString('hex')}`;

    db.prepare(`
      INSERT INTO api_keys (id, project_id, name, key_hash, key_prefix, environment, secret_key, is_active, created_at)
      VALUES (?, ?, 'Sandbox Primary Key', ?, ?, 'sandbox', ?, 1, ?)
    `).run(`key_${crypto.randomBytes(8).toString('hex')}`, projectId, keyHash, rawKey.substring(0, 12) + '...', secret, now);

    db.prepare(`
      INSERT INTO security_rules (id, project_id, ip_whitelist, ip_blacklist, max_rate_limit_per_min, captcha_required, fraud_detection_enabled, created_at)
      VALUES (?, ?, '[]', '[]', 120, 0, 1, ?)
    `).run(`sec_${crypto.randomBytes(8).toString('hex')}`, projectId, now);

    const authUser = { id: userId, email, name, role: 'developer' };
    const token = signJwtToken(authUser);

    const response = NextResponse.json({
      success: true,
      user: authUser,
      token,
      apiKey: rawKey,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
