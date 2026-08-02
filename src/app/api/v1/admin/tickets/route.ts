import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const tickets = db.prepare(`
    SELECT t.*, u.email as user_email, u.name as user_name
    FROM support_tickets t
    JOIN users u ON t.user_id = u.id
    ORDER BY t.updated_at DESC
  `).all();

  return NextResponse.json({ tickets });
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { subject, category, priority = 'medium', message } = await req.json();

    if (!subject || !category || !message) {
      return NextResponse.json({ error: 'subject, category, and message are required' }, { status: 400 });
    }

    const db = await getDb();
    const ticketId = `tkt_${crypto.randomBytes(6).toString('hex')}`;
    const now = new Date().toISOString();
    const initialMsg = [{ sender: user.email, text: message, time: now }];

    db.prepare(`
      INSERT INTO support_tickets (id, user_id, subject, category, priority, status, messages, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'open', ?, ?, ?)
    `).run(ticketId, user.id, subject, category, priority, JSON.stringify(initialMsg), now, now);

    return NextResponse.json({ success: true, ticketId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create support ticket' }, { status: 500 });
  }
}
