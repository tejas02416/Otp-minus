import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId');

  const db = await getDb();
  let keys;
  if (projectId) {
    keys = db.prepare(`
      SELECT k.id, k.project_id, k.name, k.key_prefix, k.environment, k.is_active, k.last_used_at, k.created_at, p.name as project_name
      FROM api_keys k
      JOIN projects p ON k.project_id = p.id
      WHERE k.project_id = ? AND p.user_id = ?
      ORDER BY k.created_at DESC
    `).all(projectId, user.id);
  } else {
    keys = db.prepare(`
      SELECT k.id, k.project_id, k.name, k.key_prefix, k.environment, k.is_active, k.last_used_at, k.created_at, p.name as project_name
      FROM api_keys k
      JOIN projects p ON k.project_id = p.id
      WHERE p.user_id = ?
      ORDER BY k.created_at DESC
    `).all(user.id);
  }

  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { projectId, name, environment = 'sandbox' } = await req.json();

    if (!projectId || !name) {
      return NextResponse.json({ error: 'projectId and key name are required' }, { status: 400 });
    }

    const db = await getDb();
    const proj = db.prepare('SELECT id FROM projects WHERE id = ? AND user_id = ?').get(projectId, user.id);
    if (!proj) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const prefixStr = environment === 'live' ? 'opt_live_' : 'opt_test_';
    const rawKey = prefixStr + crypto.randomBytes(16).toString('hex');
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const secretKey = 'whsec_' + crypto.randomBytes(16).toString('hex');
    const now = new Date().toISOString();
    const keyId = `key_${crypto.randomBytes(8).toString('hex')}`;

    db.prepare(`
      INSERT INTO api_keys (id, project_id, name, key_hash, key_prefix, environment, secret_key, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(keyId, projectId, name, keyHash, rawKey.substring(0, 12) + '...', environment, secretKey, now);

    db.prepare(`
      INSERT INTO audit_logs (id, user_id, project_id, action, details, ip_address, created_at)
      VALUES (?, ?, ?, 'API_KEY_CREATED', ?, '127.0.0.1', ?)
    `).run(`aud_${crypto.randomBytes(8).toString('hex')}`, user.id, projectId, `Created API key: ${name}`, now);

    return NextResponse.json({
      success: true,
      key: {
        id: keyId,
        name,
        environment,
        key_prefix: rawKey.substring(0, 12) + '...',
        secret_key: secretKey,
        created_at: now,
      },
      rawApiKey: rawKey,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate key' }, { status: 500 });
  }
}
