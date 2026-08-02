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
  let webhooks;
  if (projectId) {
    webhooks = db.prepare('SELECT * FROM webhooks WHERE project_id = ? ORDER BY created_at DESC').all(projectId);
  } else {
    webhooks = db.prepare(`
      SELECT w.*, p.name as project_name
      FROM webhooks w
      JOIN projects p ON w.project_id = p.id
      WHERE p.user_id = ?
      ORDER BY w.created_at DESC
    `).all(user.id);
  }

  const deliveries = db.prepare(`
    SELECT d.*, w.name as webhook_name
    FROM webhook_deliveries d
    JOIN webhooks w ON d.webhook_id = w.id
    JOIN projects p ON w.project_id = p.id
    WHERE p.user_id = ?
    ORDER BY d.created_at DESC
    LIMIT 30
  `).all(user.id);

  return NextResponse.json({ webhooks, deliveries });
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { projectId, name, url, events = ['otp.sent', 'otp.verified'] } = await req.json();

    if (!projectId || !name || !url) {
      return NextResponse.json({ error: 'projectId, name, and url are required' }, { status: 400 });
    }

    const db = await getDb();
    const proj = db.prepare('SELECT id FROM projects WHERE id = ? AND user_id = ?').get(projectId, user.id);
    if (!proj) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const webhookId = `wh_${crypto.randomBytes(8).toString('hex')}`;
    const secret = `whsec_${crypto.randomBytes(16).toString('hex')}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO webhooks (id, project_id, name, url, secret, events, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `).run(webhookId, projectId, name, url, secret, JSON.stringify(events), now);

    return NextResponse.json({
      success: true,
      webhook: { id: webhookId, projectId, name, url, secret, events, is_active: 1, created_at: now },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create webhook' }, { status: 500 });
  }
}
