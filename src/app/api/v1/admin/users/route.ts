import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
  }

  const db = await getDb();
  const users = db.prepare(`
    SELECT u.id, u.email, u.name, u.role, u.created_at, COUNT(p.id) as project_count
    FROM users u
    LEFT JOIN projects p ON u.id = p.user_id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `).all();

  return NextResponse.json({ users });
}
