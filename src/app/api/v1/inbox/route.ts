import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId');

  const db = await getDb();
  let messages;
  if (projectId) {
    messages = db.prepare('SELECT * FROM live_messages_inbox WHERE project_id = ? ORDER BY created_at DESC LIMIT 50').all(projectId);
  } else {
    messages = db.prepare(`
      SELECT m.*, p.name as project_name
      FROM live_messages_inbox m
      JOIN projects p ON m.project_id = p.id
      WHERE p.user_id = ?
      ORDER BY m.created_at DESC
      LIMIT 50
    `).all(user.id);
  }

  return NextResponse.json({ messages });
}
