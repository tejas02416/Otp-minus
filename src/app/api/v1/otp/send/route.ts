import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { validateApiKey, getUserFromRequest } from '@/lib/auth';
import { checkRateLimitAndSecurity } from '@/lib/rate-limit';
import { createAndSendOtp } from '@/lib/otp-engine';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const db = await getDb();
  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'Unknown';

  let projectId: string | null = null;
  let apiKeyId: string | null = null;

  const apiCtx = await validateApiKey(req);
  if (apiCtx) {
    projectId = apiCtx.project_id;
    apiKeyId = apiCtx.id;
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
    return NextResponse.json({ error: 'Unauthorized. Provide a valid X-API-Key header or Bearer token.' }, { status: 401 });
  }

  const secCheck = await checkRateLimitAndSecurity(projectId, clientIp);
  if (!secCheck.allowed) {
    await logApiRequest(projectId, apiKeyId, '/api/v1/otp/send', 'POST', secCheck.statusCode || 429, Date.now() - startTime, clientIp, userAgent, null, secCheck.reason);
    return NextResponse.json({ error: secCheck.reason }, { status: secCheck.statusCode || 429 });
  }

  try {
    const body = await req.json();
    const {
      recipient,
      channel = 'sms',
      code_length = 6,
      code_type = 'numeric',
      expires_in_seconds = 300,
      sender_name = 'OTP Auth',
      metadata = {},
    } = body;

    if (!recipient) {
      await logApiRequest(projectId, apiKeyId, '/api/v1/otp/send', 'POST', 400, Date.now() - startTime, clientIp, userAgent, body, 'Recipient is required');
      return NextResponse.json({ error: 'Recipient phone number or email is required' }, { status: 400 });
    }

    if (!['sms', 'email', 'whatsapp', 'voice', 'totp'].includes(channel)) {
      return NextResponse.json({ error: 'Invalid channel. Supported: sms, email, whatsapp, voice, totp' }, { status: 400 });
    }

    if (![4, 6, 8].includes(Number(code_length))) {
      return NextResponse.json({ error: 'code_length must be 4, 6, or 8' }, { status: 400 });
    }

    const result = await createAndSendOtp({
      projectId,
      recipient,
      channel,
      codeLength: Number(code_length) as 4 | 6 | 8,
      codeType: code_type,
      expiresInSeconds: Number(expires_in_seconds),
      senderName: sender_name,
      metadata: { ...metadata, clientIp, userAgent },
    });

    const latency = Date.now() - startTime;
    const responseData = {
      success: true,
      request_id: result.requestId,
      status: result.status,
      channel: result.channel,
      recipient: result.recipient,
      expires_at: result.expiresAt,
      expires_in_seconds: result.expiresInSeconds,
      demo_otp: result.demoOtp,
    };

    await logApiRequest(projectId, apiKeyId, '/api/v1/otp/send', 'POST', 200, latency, clientIp, userAgent, body, null, responseData);

    return NextResponse.json(responseData);
  } catch (err: any) {
    const latency = Date.now() - startTime;
    await logApiRequest(projectId, apiKeyId, '/api/v1/otp/send', 'POST', 500, latency, clientIp, userAgent, null, err.message);
    return NextResponse.json({ error: err.message || 'Internal server error sending OTP' }, { status: 500 });
  }
}

async function logApiRequest(
  projectId: string,
  apiKeyId: string | null,
  endpoint: string,
  method: string,
  statusCode: number,
  latencyMs: number,
  clientIp: string,
  userAgent: string,
  reqBody: any,
  errorMsg: string | null = null,
  resBody: any = null
) {
  try {
    const db = await getDb();
    db.prepare(`
      INSERT INTO api_logs (id, project_id, api_key_id, endpoint, method, status_code, latency_ms, ip_address, user_agent, request_body, response_body, error_message, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `log_${crypto.randomBytes(8).toString('hex')}`,
      projectId,
      apiKeyId,
      endpoint,
      method,
      statusCode,
      latencyMs,
      clientIp,
      userAgent,
      reqBody ? JSON.stringify(reqBody) : null,
      resBody ? JSON.stringify(resBody) : null,
      errorMsg,
      new Date().toISOString()
    );
  } catch {
    // Non-blocking
  }
}
