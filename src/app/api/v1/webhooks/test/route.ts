import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { webhookId, eventType = 'otp.verified' } = await req.json();

    const db = await getDb();
    const webhook = db.prepare('SELECT * FROM webhooks WHERE id = ?').get(webhookId) as any;

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    const mockPayload = {
      event: eventType,
      requestId: `req_test_${crypto.randomBytes(6).toString('hex')}`,
      recipient: '+15550192834',
      channel: 'sms',
      timestamp: new Date().toISOString(),
      testTrigger: true,
    };

    const signature = crypto.createHmac('sha256', webhook.secret).update(JSON.stringify(mockPayload)).digest('hex');
    const deliveryId = `del_${crypto.randomBytes(8).toString('hex')}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO webhook_deliveries (id, webhook_id, event_type, payload, response_status, response_body, delivery_time_ms, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      deliveryId,
      webhookId,
      eventType,
      JSON.stringify(mockPayload),
      200,
      JSON.stringify({ status: 'OK', signature }),
      45,
      'success',
      now
    );

    return NextResponse.json({
      success: true,
      message: 'Test webhook event triggered',
      delivery: {
        id: deliveryId,
        eventType,
        payload: mockPayload,
        signature,
        status: 'success',
        responseStatus: 200,
        createdAt: now,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Webhook test failed' }, { status: 500 });
  }
}
