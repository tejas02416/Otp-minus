import crypto from 'crypto';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { getDb } from './db';
import { hashOtp } from './auth';

export interface GenerateOtpOptions {
  projectId: string;
  recipient: string;
  channel: 'sms' | 'email' | 'whatsapp' | 'voice' | 'totp';
  codeLength?: 4 | 6 | 8;
  codeType?: 'numeric' | 'alphanumeric';
  expiresInSeconds?: number;
  maxAttempts?: number;
  senderName?: string;
  metadata?: Record<string, any>;
}

export function generateOtpCode(length: number = 6, type: 'numeric' | 'alphanumeric' = 'numeric'): string {
  if (type === 'alphanumeric') {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let res = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      res += chars[bytes[i] % chars.length];
    }
    return res;
  } else {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const num = Math.floor(min + Math.random() * (max - min + 1));
    return num.toString();
  }
}

export async function createAndSendOtp(options: GenerateOtpOptions) {
  const db = await getDb();
  const {
    projectId,
    recipient,
    channel,
    codeLength = 6,
    codeType = 'numeric',
    expiresInSeconds = 300,
    maxAttempts = 3,
    senderName = 'OTP Platform',
    metadata = {},
  } = options;

  const rawCode = generateOtpCode(codeLength, codeType);
  const codeHash = hashOtp(rawCode);

  const reqId = `req_${crypto.randomBytes(12).toString('hex')}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInSeconds * 1000).toISOString();
  const createdAtStr = now.toISOString();

  db.prepare(`
    INSERT INTO otp_requests (
      id, project_id, recipient, channel, otp_hash, code_length, code_type,
      expires_at, is_verified, attempt_count, max_attempts, status, sender_name, metadata, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, 'pending', ?, ?, ?)
  `).run(
    reqId,
    projectId,
    recipient,
    channel,
    codeHash,
    codeLength,
    codeType,
    expiresAt,
    maxAttempts,
    senderName,
    JSON.stringify(metadata),
    createdAtStr
  );

  const template = db.prepare('SELECT body FROM templates WHERE project_id = ? AND channel = ?').get(projectId, channel) as { body: string } | undefined;
  let messageContent = template?.body || `Your verification code is ${rawCode}. Valid for ${Math.round(expiresInSeconds / 60)} minutes.`;
  messageContent = messageContent
    .replace(/\{\{otp\}\}/g, rawCode)
    .replace(/\{\{app_name\}\}/g, senderName)
    .replace(/\{\{expires_in\}\}/g, String(Math.round(expiresInSeconds / 60)))
    .replace(/\{\{request_id\}\}/g, reqId);

  db.prepare(`
    INSERT INTO live_messages_inbox (id, project_id, recipient, channel, message_content, sender, otp_code, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(`msg_${crypto.randomBytes(8).toString('hex')}`, projectId, recipient, channel, messageContent, senderName, rawCode, createdAtStr);

  triggerWebhooks(projectId, 'otp.sent', {
    event: 'otp.sent',
    requestId: reqId,
    recipient,
    channel,
    expiresAt,
    createdAt: createdAtStr,
  });

  return {
    requestId: reqId,
    status: 'pending',
    channel,
    recipient,
    expiresAt,
    expiresInSeconds,
    demoOtp: rawCode,
  };
}

export async function verifyOtp(projectId: string, requestId: string, inputCode: string) {
  const db = await getDb();

  const record = db.prepare('SELECT * FROM otp_requests WHERE id = ? AND project_id = ?').get(requestId, projectId) as {
    id: string;
    otp_hash: string;
    expires_at: string;
    is_verified: number;
    attempt_count: number;
    max_attempts: number;
    status: string;
    recipient: string;
    channel: string;
  } | undefined;

  if (!record) {
    return { success: false, reason: 'Invalid or expired request ID.', code: 'INVALID_REQUEST' };
  }

  if (record.is_verified === 1) {
    return { success: false, reason: 'OTP code has already been verified and consumed.', code: 'ALREADY_USED' };
  }

  if (record.status === 'failed' || record.status === 'expired') {
    return { success: false, reason: `OTP verification is no longer active (Status: ${record.status}).`, code: 'INACTIVE' };
  }

  const now = new Date();
  if (now > new Date(record.expires_at)) {
    db.prepare("UPDATE otp_requests SET status = 'expired' WHERE id = ?").run(requestId);
    triggerWebhooks(projectId, 'otp.expired', { event: 'otp.expired', requestId, recipient: record.recipient });
    return { success: false, reason: 'OTP code has expired.', code: 'EXPIRED' };
  }

  if (record.attempt_count >= record.max_attempts) {
    db.prepare("UPDATE otp_requests SET status = 'failed' WHERE id = ?").run(requestId);
    triggerWebhooks(projectId, 'otp.failed', { event: 'otp.failed', requestId, recipient: record.recipient, reason: 'Max retry limit reached' });
    return { success: false, reason: 'Maximum verification retry limit exceeded.', code: 'MAX_ATTEMPTS_EXCEEDED' };
  }

  const inputHash = hashOtp(inputCode.trim());

  if (inputHash !== record.otp_hash) {
    const newCount = record.attempt_count + 1;
    const isNowFailed = newCount >= record.max_attempts;
    db.prepare('UPDATE otp_requests SET attempt_count = ?, status = ? WHERE id = ?').run(
      newCount,
      isNowFailed ? 'failed' : 'pending',
      requestId
    );

    if (isNowFailed) {
      triggerWebhooks(projectId, 'otp.failed', { event: 'otp.failed', requestId, recipient: record.recipient, reason: 'Incorrect code - limit reached' });
    }

    return {
      success: false,
      reason: `Incorrect OTP code. ${record.max_attempts - newCount} attempts remaining.`,
      code: 'INVALID_CODE',
      attemptsRemaining: record.max_attempts - newCount,
    };
  }

  const verifiedAtStr = now.toISOString();
  db.prepare("UPDATE otp_requests SET is_verified = 1, status = 'verified', verified_at = ? WHERE id = ?").run(verifiedAtStr, requestId);

  triggerWebhooks(projectId, 'otp.verified', {
    event: 'otp.verified',
    requestId,
    recipient: record.recipient,
    channel: record.channel,
    verifiedAt: verifiedAtStr,
  });

  return {
    success: true,
    requestId,
    status: 'verified',
    verifiedAt: verifiedAtStr,
    message: 'OTP verification successful.',
  };
}

export async function setupTotp(projectId: string, userIdentifier: string, appName: string = 'Universal OTP') {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(userIdentifier, appName, secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

  return {
    secret,
    otpauth,
    qrCodeDataUrl,
  };
}

export function verifyTotpCode(secret: string, token: string): boolean {
  try {
    return authenticator.check(token, secret);
  } catch {
    return false;
  }
}

export async function triggerWebhooks(projectId: string, eventType: string, payload: Record<string, any>) {
  const db = await getDb();
  const hooks = db.prepare('SELECT * FROM webhooks WHERE project_id = ? AND is_active = 1').all(projectId) as Array<{
    id: string;
    url: string;
    secret: string;
    events: string;
  }>;

  for (const hook of hooks) {
    const subscribedEvents: string[] = JSON.parse(hook.events || '[]');
    if (subscribedEvents.includes(eventType) || subscribedEvents.includes('*')) {
      const deliveryId = `del_${crypto.randomBytes(8).toString('hex')}`;
      const signature = crypto.createHmac('sha256', hook.secret).update(JSON.stringify(payload)).digest('hex');

      db.prepare(`
        INSERT INTO webhook_deliveries (id, webhook_id, event_type, payload, response_status, response_body, delivery_time_ms, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        deliveryId,
        hook.id,
        eventType,
        JSON.stringify(payload),
        200,
        JSON.stringify({ status: 'received', hmac_signature: signature }),
        Math.floor(Math.random() * 40) + 10,
        'success',
        new Date().toISOString()
      );
    }
  }
}
