import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const db = await getDb();
  let projectId: string | null = null;

  const apiCtx = await validateApiKey(req);
  if (apiCtx) {
    projectId = apiCtx.project_id;
  } else {
    const user = getUserFromRequest(req);
    if (user) {
      const headerProj = req.headers.get('x-project-id');
      if (headerProj) {
        projectId = headerProj;
      } else {
        const firstProj = db.prepare('SELECT id FROM projects WHERE user_id = ? ORDER BY created_at ASC LIMIT 1').get(user.id) as { id: string } | undefined;
        projectId = firstProj?.id || null;
      }
    }
  }

  if (!projectId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requestId = params.id;
  const record = db.prepare('SELECT id, recipient, channel, is_verified, attempt_count, max_attempts, status, created_at, expires_at, verified_at FROM otp_requests WHERE id = ? AND project_id = ?').get(requestId, projectId) as any;

  if (!record) {
    return NextResponse.json({ error: 'OTP Request not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    request: record,
  });
}
