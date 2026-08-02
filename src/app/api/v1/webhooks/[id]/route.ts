import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const webhookId = params.id;
  const db = await getDb();

  db.prepare(`
    DELETE FROM webhooks
    WHERE id = ? AND project_id IN (SELECT id FROM projects WHERE user_id = ?)
  `).run(webhookId, user.id);

  return NextResponse.json({ success: true, message: 'Webhook deleted' });
}
