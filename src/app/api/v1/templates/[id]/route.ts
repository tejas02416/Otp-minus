import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tplId = params.id;
  const db = await getDb();
  const { name, subject, body } = await req.json();

  const now = new Date().toISOString();

  if (name !== undefined) db.prepare('UPDATE templates SET name = ?, updated_at = ? WHERE id = ?').run(name, now, tplId);
  if (subject !== undefined) db.prepare('UPDATE templates SET subject = ?, updated_at = ? WHERE id = ?').run(subject, now, tplId);
  if (body !== undefined) db.prepare('UPDATE templates SET body = ?, updated_at = ? WHERE id = ?').run(body, now, tplId);

  const updated = db.prepare('SELECT * FROM templates WHERE id = ?').get(tplId);
  return NextResponse.json({ success: true, template: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tplId = params.id;
  const db = await getDb();
  db.prepare('DELETE FROM templates WHERE id = ?').run(tplId);

  return NextResponse.json({ success: true, message: 'Template deleted' });
}
