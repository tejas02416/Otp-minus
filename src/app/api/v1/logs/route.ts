import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId');
  const type = url.searchParams.get('type');

  const db = await getDb();

  if (type === 'otp') {
    let whereStr = '';
    const queryParams: any[] = [];
    if (projectId) {
      whereStr = ' WHERE project_id = ? ';
      queryParams.push(projectId);
    }
    const otpLogs = db.prepare(`
      SELECT id, project_id, recipient, channel, code_length, status, attempt_count, sender_name, created_at, verified_at, expires_at
      FROM otp_requests
      ${whereStr}
      ORDER BY created_at DESC
      LIMIT 100
    `).all(...queryParams);

    return NextResponse.json({ logs: otpLogs });
  }

  let whereStr = '';
  const queryParams: any[] = [];
  if (projectId) {
    whereStr = ' WHERE project_id = ? ';
    queryParams.push(projectId);
  }

  if (type === 'errors') {
    whereStr += whereStr ? ' AND status_code >= 400 ' : ' WHERE status_code >= 400 ';
  }

  const logs = db.prepare(`
    SELECT *
    FROM api_logs
    ${whereStr}
    ORDER BY created_at DESC
    LIMIT 100
  `).all(...queryParams);

  return NextResponse.json({ logs });
}
