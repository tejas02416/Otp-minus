import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { validateApiKey, getUserFromRequest } from '@/lib/auth';
import { checkRateLimitAndSecurity } from '@/lib/rate-limit';
import { verifyOtp } from '@/lib/otp-engine';
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
    return NextResponse.json({ error: 'Unauthorized. Provide valid X-API-Key or Bearer token.' }, { status: 401 });
  }

  const secCheck = await checkRateLimitAndSecurity(projectId, clientIp);
  if (!secCheck.allowed) {
    return NextResponse.json({ error: secCheck.reason }, { status: secCheck.statusCode || 429 });
  }

  try {
    const body = await req.json();
    const requestId = body.request_id || body.requestId;
    const code = body.code || body.otp;

    if (!requestId || !code) {
      return NextResponse.json({ error: 'request_id and code are required fields' }, { status: 400 });
    }

    const result = await verifyOtp(projectId, requestId, String(code));
    const latency = Date.now() - startTime;

    if (!result.success) {
      await logApiLog(projectId, apiKeyId, '/api/v1/otp/verify', 'POST', 400, latency, clientIp, userAgent, body, result.reason || null, result);
      return NextResponse.json(result, { status: 400 });
    }

    await logApiLog(projectId, apiKeyId, '/api/v1/otp/verify', 'POST', 200, latency, clientIp, userAgent, body, null, result);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error processing OTP verification' }, { status: 500 });
  }
}

async function logApiLog(
  projectId: string,
  apiKeyId: string | null,
  endpoint: string,
  method: string,
  statusCode: number,
  latencyMs: number,
  clientIp: string,
  userAgent: string,
  reqBody: any,
  errorMsg: string | null,
  resBody: any
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
      JSON.stringify(reqBody),
      JSON.stringify(resBody),
      errorMsg,
      new Date().toISOString()
    );
  } catch {
    // Non-blocking
  }
}
