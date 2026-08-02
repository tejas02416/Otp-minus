import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, getUserFromRequest } from '@/lib/auth';
import { verifyTotpCode } from '@/lib/otp-engine';

export async function POST(req: NextRequest) {
  try {
    const { secret, token } = await req.json();

    if (!secret || !token) {
      return NextResponse.json({ error: 'secret and token are required' }, { status: 400 });
    }

    const isValid = verifyTotpCode(secret, String(token));

    if (!isValid) {
      return NextResponse.json({ success: false, reason: 'Invalid or expired TOTP authenticator code' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'TOTP authentication code verified successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'TOTP verification failed' }, { status: 500 });
  }
}
