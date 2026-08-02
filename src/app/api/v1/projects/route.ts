import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await getDb();
  const projects = db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC').all(user.id);

  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, environment = 'sandbox', description = '' } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const db = await getDb();
    const projectId = `proj_${crypto.randomBytes(8).toString('hex')}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO projects (id, user_id, name, slug, environment, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(projectId, user.id, name, slug, environment, description, now);

    const rawKey = `opt_${environment === 'live' ? 'live' : 'test'}_${crypto.randomBytes(12).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const secret = `whsec_${crypto.randomBytes(16).toString('hex')}`;

    db.prepare(`
      INSERT INTO api_keys (id, project_id, name, key_hash, key_prefix, environment, secret_key, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      `key_${crypto.randomBytes(8).toString('hex')}`,
      projectId,
      `${name} Primary Key`,
      keyHash,
      rawKey.substring(0, 12) + '...',
      environment,
      secret,
      now
    );

    db.prepare(`
      INSERT INTO security_rules (id, project_id, ip_whitelist, ip_blacklist, max_rate_limit_per_min, captcha_required, fraud_detection_enabled, created_at)
      VALUES (?, ?, '[]', '[]', 120, 0, 1, ?)
    `).run(`sec_${crypto.randomBytes(8).toString('hex')}`, projectId, now);

    db.prepare(`
      INSERT INTO templates (id, project_id, channel, name, body, variables, created_at, updated_at)
      VALUES (?, ?, 'sms', 'Default SMS Template', 'Your {{app_name}} verification code is {{otp}}. Valid for {{expires_in}} mins.', '["otp", "app_name", "expires_in"]', ?, ?)
    `).run(`tpl_${crypto.randomBytes(8).toString('hex')}`, projectId, now, now);

    return NextResponse.json({
      success: true,
      project: { id: projectId, name, slug, environment, description, created_at: now },
      apiKey: rawKey,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create project' }, { status: 500 });
  }
}
