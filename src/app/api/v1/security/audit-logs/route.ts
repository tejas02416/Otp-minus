import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId');

  const db = await getDb();
  let auditLogs;
  if (projectId) {
    auditLogs = db.prepare('SELECT * FROM audit_logs WHERE project_id = ? ORDER BY created_at DESC LIMIT 50').all(projectId);
  } else {
    auditLogs = db.prepare('SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(user.id);
  }

  return NextResponse.json({ auditLogs });
}
