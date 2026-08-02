import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const projectId = params.id;

  const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(projectId, user.id);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const { name, environment, description } = await req.json();

  if (name !== undefined) db.prepare('UPDATE projects SET name = ? WHERE id = ?').run(name, projectId);
  if (environment !== undefined) db.prepare('UPDATE projects SET environment = ? WHERE id = ?').run(environment, projectId);
  if (description !== undefined) db.prepare('UPDATE projects SET description = ? WHERE id = ?').run(description, projectId);

  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
  return NextResponse.json({ success: true, project: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const projectId = params.id;

  db.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?').run(projectId, user.id);
  return NextResponse.json({ success: true, message: 'Project deleted' });
}
