import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const memberId = params.id;
  const db = await getDb();
  db.prepare('DELETE FROM team_members WHERE id = ?').run(memberId);

  return NextResponse.json({ success: true, message: 'Team member removed' });
}
