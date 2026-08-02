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
  let templates;
  if (projectId) {
    templates = db.prepare('SELECT * FROM templates WHERE project_id = ? ORDER BY created_at DESC').all(projectId);
  } else {
    templates = db.prepare(`
      SELECT t.*, p.name as project_name
      FROM templates t
      JOIN projects p ON t.project_id = p.id
      WHERE p.user_id = ?
      ORDER BY t.created_at DESC
    `).all(user.id);
  }

  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { projectId, channel, name, subject = '', body, variables = ['otp', 'app_name', 'expires_in'] } = await req.json();

    if (!projectId || !channel || !name || !body) {
      return NextResponse.json({ error: 'projectId, channel, name, and body are required' }, { status: 400 });
    }

    const db = await getDb();
    const tplId = `tpl_${crypto.randomBytes(8).toString('hex')}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO templates (id, project_id, channel, name, subject, body, variables, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(tplId, projectId, channel, name, subject, body, JSON.stringify(variables), now, now);

    return NextResponse.json({
      success: true,
      template: { id: tplId, projectId, channel, name, subject, body, variables, created_at: now },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save template' }, { status: 500 });
  }
}
