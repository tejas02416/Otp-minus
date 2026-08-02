import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { createAndSendOtp } from '@/lib/otp-engine';

export async function POST(req: NextRequest) {
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

  try {
    const { request_id } = await req.json();
    if (!request_id) {
      return NextResponse.json({ error: 'request_id is required' }, { status: 400 });
    }

    const prevReq = db.prepare('SELECT * FROM otp_requests WHERE id = ? AND project_id = ?').get(request_id, projectId) as any;

    if (!prevReq) {
      return NextResponse.json({ error: 'Original OTP request not found' }, { status: 404 });
    }

    db.prepare("UPDATE otp_requests SET status = 'expired' WHERE id = ?").run(request_id);

    const newOtp = await createAndSendOtp({
      projectId,
      recipient: prevReq.recipient,
      channel: prevReq.channel,
      codeLength: prevReq.code_length,
      codeType: prevReq.code_type,
      senderName: prevReq.sender_name || 'OTP Auth',
    });

    return NextResponse.json({
      success: true,
      message: 'OTP resent successfully.',
      previous_request_id: request_id,
      new_request_id: newOtp.requestId,
      status: newOtp.status,
      expires_at: newOtp.expiresAt,
      demo_otp: newOtp.demoOtp,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to resend OTP' }, { status: 500 });
  }
}
