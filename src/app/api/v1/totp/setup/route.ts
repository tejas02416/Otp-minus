import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, getUserFromRequest } from '@/lib/auth';
import { setupTotp } from '@/lib/otp-engine';
import { getDb } from '@/lib/db';

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
    const { user_identifier, app_name = 'Universal OTP' } = await req.json();
    if (!user_identifier) {
      return NextResponse.json({ error: 'user_identifier is required' }, { status: 400 });
    }

    const totpData = await setupTotp(projectId, user_identifier, app_name);

    return NextResponse.json({
      success: true,
      user_identifier,
      secret: totpData.secret,
      otpauth_url: totpData.otpauth,
      qr_code: totpData.qrCodeDataUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'TOTP setup failed' }, { status: 500 });
  }
}
