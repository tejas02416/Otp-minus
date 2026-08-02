import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const keyId = params.id;
  const db = await getDb();

  const key = db.prepare(`
    SELECT k.id, k.name, k.project_id
    FROM api_keys k
    JOIN projects p ON k.project_id = p.id
    WHERE k.id = ? AND p.user_id = ?
  `).get(keyId, user.id) as { id: string; name: string; project_id: string } | undefined;

  if (!key) return NextResponse.json({ error: 'Key not found' }, { status: 404 });

  db.prepare('DELETE FROM api_keys WHERE id = ?').run(keyId);

  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO audit_logs (id, user_id, project_id, action, details, ip_address, created_at)
    VALUES (?, ?, ?, 'API_KEY_REVOKED', ?, '127.0.0.1', ?)
  `).run(`aud_${crypto.randomBytes(8).toString('hex')}`, user.id, key.project_id, `Revoked API key: ${key.name}`, now);

  return NextResponse.json({ success: true, message: 'API key revoked' });
}
