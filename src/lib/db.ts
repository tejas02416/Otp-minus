import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'otp_platform.db');

let rawDb: any = null;
let dbWrapperInstance: any = null;
let initPromise: Promise<any> | null = null;

export async function getDb() {
  if (dbWrapperInstance) return dbWrapperInstance;

  if (!initPromise) {
    initPromise = (async () => {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      const initSqlJs = eval('require')('sql.js');
      const SQL = await initSqlJs();

      if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        rawDb = new SQL.Database(fileBuffer);
      } else {
        rawDb = new SQL.Database();
      }

      dbWrapperInstance = createWrapper(rawDb);
      initTables(dbWrapperInstance);
      seedInitialData(dbWrapperInstance);
      return dbWrapperInstance;
    })();
  }

  return await initPromise;
}

function saveDb() {
  if (rawDb) {
    const data = rawDb.export();
    const buffer = Buffer.from(data);
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, buffer);
  }
}

function flattenParams(params: any[]): any[] {
  if (params.length === 1 && Array.isArray(params[0])) {
    return params[0];
  }
  return params;
}

function createWrapper(db: any) {
  return {
    exec(sql: string) {
      db.run(sql);
      saveDb();
    },
    prepare(sql: string) {
      return {
        run(...params: any[]) {
          const flat = flattenParams(params);
          db.run(sql, flat);
          saveDb();
          return { changes: 1 };
        },
        get(...params: any[]) {
          const flat = flattenParams(params);
          const stmt = db.prepare(sql);
          stmt.bind(flat);
          if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
          }
          stmt.free();
          return undefined;
        },
        all(...params: any[]) {
          const flat = flattenParams(params);
          const stmt = db.prepare(sql);
          stmt.bind(flat);
          const rows: any[] = [];
          while (stmt.step()) {
            rows.push(stmt.getAsObject());
          }
          stmt.free();
          return rows;
        },
      };
    },
  };
}

function initTables(db: any) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'developer',
      avatar_url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      environment TEXT NOT NULL DEFAULT 'sandbox',
      description TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      key_hash TEXT UNIQUE NOT NULL,
      key_prefix TEXT NOT NULL,
      environment TEXT NOT NULL DEFAULT 'sandbox',
      secret_key TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      last_used_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS otp_requests (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      recipient TEXT NOT NULL,
      channel TEXT NOT NULL,
      otp_hash TEXT NOT NULL,
      code_length INTEGER NOT NULL DEFAULT 6,
      code_type TEXT NOT NULL DEFAULT 'numeric',
      expires_at TEXT NOT NULL,
      is_verified INTEGER NOT NULL DEFAULT 0,
      attempt_count INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL DEFAULT 3,
      status TEXT NOT NULL DEFAULT 'pending',
      sender_name TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL,
      verified_at TEXT
    );

    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      channel TEXT NOT NULL,
      name TEXT NOT NULL,
      subject TEXT,
      body TEXT NOT NULL,
      variables TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS webhooks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      secret TEXT NOT NULL,
      events TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS webhook_deliveries (
      id TEXT PRIMARY KEY,
      webhook_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      response_status INTEGER,
      response_body TEXT,
      delivery_time_ms INTEGER,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS api_logs (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      api_key_id TEXT,
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      latency_ms INTEGER NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      request_body TEXT,
      response_body TEXT,
      error_message TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      user_id TEXT,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'developer',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS security_rules (
      id TEXT PRIMARY KEY,
      project_id TEXT UNIQUE NOT NULL,
      ip_whitelist TEXT DEFAULT '[]',
      ip_blacklist TEXT DEFAULT '[]',
      max_rate_limit_per_min INTEGER DEFAULT 60,
      captcha_required INTEGER DEFAULT 0,
      fraud_detection_enabled INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      project_id TEXT,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'open',
      messages TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS live_messages_inbox (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      recipient TEXT NOT NULL,
      channel TEXT NOT NULL,
      message_content TEXT NOT NULL,
      sender TEXT NOT NULL,
      otp_code TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

function seedInitialData(db: any) {
  const userCountRow = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number } | undefined;
  if (userCountRow && userCountRow.count > 0) return;

  const now = new Date().toISOString();
  const passHash = bcrypt.hashSync('demo1234', 10);

  const userId = 'usr_demo123';
  const adminId = 'usr_admin999';

  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, 'developer@otpminus.io', passHash, 'Alex Vance', 'developer', now);

  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(adminId, 'admin@otpminus.io', passHash, 'Elena Rostova (Admin)', 'admin', now);

  const proj1 = 'proj_ecomm_prod';
  const proj2 = 'proj_fintech_sandbox';

  db.prepare(`
    INSERT INTO projects (id, user_id, name, slug, environment, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(proj1, userId, 'Apex Store Checkout', 'apex-store', 'live', 'E-commerce mobile app & website verification', now);

  db.prepare(`
    INSERT INTO projects (id, user_id, name, slug, environment, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(proj2, userId, 'QuantumPay Sandbox', 'quantumpay-sandbox', 'sandbox', 'Financial wallet OTP testing environment', now);

  db.prepare(`
    INSERT INTO security_rules (id, project_id, ip_whitelist, ip_blacklist, max_rate_limit_per_min, captcha_required, fraud_detection_enabled, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('sec_1', proj1, '["192.168.1.1", "10.0.0.1"]', '["198.51.100.14"]', 120, 0, 1, now);

  db.prepare(`
    INSERT INTO security_rules (id, project_id, ip_whitelist, ip_blacklist, max_rate_limit_per_min, captcha_required, fraud_detection_enabled, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('sec_2', proj2, '[]', '[]', 300, 0, 0, now);

  const rawKey1 = 'opt_live_9a8b7c6d5e4f3a2b1c';
  const rawKey2 = 'opt_test_1a2b3c4d5e6f7a8b9c';
  const secret1 = 'whsec_secret_live_key_apex_store_2026';
  const secret2 = 'whsec_secret_test_key_quantumpay_2026';

  const keyHash1 = crypto.createHash('sha256').update(rawKey1).digest('hex');
  const keyHash2 = crypto.createHash('sha256').update(rawKey2).digest('hex');

  db.prepare(`
    INSERT INTO api_keys (id, project_id, name, key_hash, key_prefix, environment, secret_key, is_active, last_used_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('key_live_1', proj1, 'Production Backend Key', keyHash1, 'opt_live_9a8b...', 'live', secret1, 1, now, now);

  db.prepare(`
    INSERT INTO api_keys (id, project_id, name, key_hash, key_prefix, environment, secret_key, is_active, last_used_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('key_test_1', proj2, 'Sandbox Testing Key', keyHash2, 'opt_test_1a2b...', 'sandbox', secret2, 1, now, now);

  db.prepare(`
    INSERT INTO templates (id, project_id, channel, name, subject, body, variables, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'tpl_email_1',
    proj1,
    'email',
    'Default Email Verification',
    'Your Verification Code for {{app_name}}',
    '<div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: #ffffff;"><h2 style="color: #6366f1;">Welcome to {{app_name}}</h2><p>Your security OTP is: <strong style="font-size: 24px; letter-spacing: 4px; color: #38bdf8;">{{otp}}</strong></p><p>This code expires in {{expires_in}} minutes. Do not share it with anyone.</p></div>',
    '["otp", "app_name", "expires_in"]',
    now,
    now
  );

  db.prepare(`
    INSERT INTO templates (id, project_id, channel, name, body, variables, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'tpl_sms_1',
    proj1,
    'sms',
    'Default SMS Verification',
    'Your {{app_name}} verification code is {{otp}}. Valid for {{expires_in}} minutes. Ref: {{request_id}}',
    '["otp", "app_name", "expires_in", "request_id"]',
    now,
    now
  );

  db.prepare(`
    INSERT INTO webhooks (id, project_id, name, url, secret, events, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'wh_1',
    proj1,
    'Production Webhook Dispatcher',
    'https://api.apexstore.io/webhooks/otp-events',
    'whsec_apex_store_webhook_secret_9988',
    '["otp.sent", "otp.verified", "otp.failed", "otp.expired"]',
    1,
    now
  );

  db.prepare(`
    INSERT INTO team_members (id, project_id, user_id, email, role, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('tm_1', proj1, userId, 'developer@otpminus.io', 'owner', 'active', now);

  db.prepare(`
    INSERT INTO team_members (id, project_id, user_id, email, role, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('tm_2', proj1, null, 'devops@apexstore.io', 'admin', 'active', now);

  const channels = ['sms', 'email', 'whatsapp', 'voice', 'totp'];
  const statuses = ['verified', 'verified', 'verified', 'pending', 'failed', 'expired'];

  for (let i = 0; i < 30; i++) {
    const reqId = `req_seed_${i + 1}`;
    const channel = channels[i % channels.length];
    const status = statuses[i % statuses.length];
    const rec = channel === 'email' ? `user_${i}@example.com` : `+1555${100000 + i}`;
    const otpCode = String(100000 + (i * 1234) % 899999);
    const otpHash = crypto.createHash('sha256').update(`otp_salt_2026_${otpCode}`).digest('hex');
    const pastTime = new Date(Date.now() - (30 - i) * 1000 * 3600 * 3).toISOString();
    const expTime = new Date(Date.now() - (30 - i) * 1000 * 3600 * 3 + 300000).toISOString();

    db.prepare(`
      INSERT INTO otp_requests (id, project_id, recipient, channel, otp_hash, code_length, code_type, expires_at, is_verified, attempt_count, max_attempts, status, sender_name, metadata, created_at, verified_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      reqId,
      proj1,
      rec,
      channel,
      otpHash,
      6,
      'numeric',
      expTime,
      status === 'verified' ? 1 : 0,
      status === 'verified' ? 1 : (status === 'failed' ? 3 : 0),
      3,
      status,
      'ApexAuth',
      JSON.stringify({ ip: `192.168.1.${(i % 50) + 1}`, userAgent: 'Mozilla/5.0 Chrome/120.0' }),
      pastTime,
      status === 'verified' ? pastTime : null
    );

    db.prepare(`
      INSERT INTO live_messages_inbox (id, project_id, recipient, channel, message_content, sender, otp_code, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `msg_${i + 1}`,
      proj1,
      rec,
      channel,
      `Your Apex Store OTP verification code is ${otpCode}. Valid for 5 mins.`,
      'ApexAuth',
      otpCode,
      pastTime
    );

    db.prepare(`
      INSERT INTO api_logs (id, project_id, api_key_id, endpoint, method, status_code, latency_ms, ip_address, user_agent, request_body, response_body, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `log_${i + 1}`,
      proj1,
      'key_live_1',
      status === 'verified' ? '/api/v1/otp/verify' : '/api/v1/otp/send',
      'POST',
      status === 'failed' ? 400 : 200,
      Math.floor(Math.random() * 85) + 15,
      `192.168.1.${(i % 50) + 1}`,
      'OtpMinusSDK/v1.0.0',
      JSON.stringify({ channel, recipient: rec }),
      JSON.stringify({ success: status !== 'failed', requestId: reqId }),
      pastTime
    );
  }

  db.prepare(`
    INSERT INTO audit_logs (id, user_id, project_id, action, details, ip_address, created_at)
    VALUES (?, ?, ?, 'API_KEY_CREATED', 'Generated new production API key: Production Backend Key', '192.168.1.1', ?)
  `).run('aud_1', userId, proj1, now);

  db.prepare(`
    INSERT INTO support_tickets (id, user_id, subject, category, priority, status, messages, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'tkt_101',
    userId,
    'Custom SMS Sender ID approval for UK (+44)',
    'SMS Sender Config',
    'high',
    'open',
    JSON.stringify([
      { sender: 'developer@otpminus.io', text: 'Hi team, we need custom alphanumeric sender ID "ApexStore" enabled for UK numbers.', time: now }
    ]),
    now,
    now
  );
}
