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
  let members;
  if (projectId) {
    members = db.prepare('SELECT * FROM team_members WHERE project_id = ? ORDER BY created_at DESC').all(projectId);
  } else {
    members = db.prepare(`
      SELECT tm.*, p.name as project_name
      FROM team_members tm
      JOIN projects p ON tm.project_id = p.id
      WHERE p.user_id = ?
      ORDER BY tm.created_at DESC
    `).all(user.id);
  }

  return NextResponse.json({ members });
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { projectId, email, role = 'developer' } = await req.json();

    if (!projectId || !email) {
      return NextResponse.json({ error: 'projectId and email are required' }, { status: 400 });
    }

    const db = await getDb();
    const existing = db.prepare('SELECT id FROM team_members WHERE project_id = ? AND email = ?').get(projectId, email);
    if (existing) {
      return NextResponse.json({ error: 'Member already in team' }, { status: 400 });
    }

    const memberId = `tm_${crypto.randomBytes(8).toString('hex')}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO team_members (id, project_id, user_id, email, role, status, created_at)
      VALUES (?, ?, NULL, ?, ?, 'invited', ?)
    `).run(memberId, projectId, email, role, now);

    return NextResponse.json({
      success: true,
      member: { id: memberId, projectId, email, role, status: 'invited', created_at: now },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to invite team member' }, { status: 500 });
  }
}
