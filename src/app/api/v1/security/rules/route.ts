import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId');

  const db = await getDb();
  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
  }

  let rules = db.prepare('SELECT * FROM security_rules WHERE project_id = ?').get(projectId) as any;
  if (!rules) {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO security_rules (id, project_id, ip_whitelist, ip_blacklist, max_rate_limit_per_min, captcha_required, fraud_detection_enabled, created_at)
      VALUES (?, ?, '[]', '[]', 120, 0, 1, ?)
    `).run(`sec_${Date.now()}`, projectId, now);
    rules = db.prepare('SELECT * FROM security_rules WHERE project_id = ?').get(projectId);
  }

  return NextResponse.json({ rules });
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { projectId, ip_whitelist = [], ip_blacklist = [], max_rate_limit_per_min = 120, captcha_required = 0, fraud_detection_enabled = 1 } = await req.json();

    const db = await getDb();
    const existing = db.prepare('SELECT id FROM security_rules WHERE project_id = ?').get(projectId);

    if (existing) {
      db.prepare(`
        UPDATE security_rules
        SET ip_whitelist = ?, ip_blacklist = ?, max_rate_limit_per_min = ?, captcha_required = ?, fraud_detection_enabled = ?
        WHERE project_id = ?
      `).run(
        JSON.stringify(ip_whitelist),
        JSON.stringify(ip_blacklist),
        max_rate_limit_per_min,
        captcha_required ? 1 : 0,
        fraud_detection_enabled ? 1 : 0,
        projectId
      );
    } else {
      db.prepare(`
        INSERT INTO security_rules (id, project_id, ip_whitelist, ip_blacklist, max_rate_limit_per_min, captcha_required, fraud_detection_enabled, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `sec_${Date.now()}`,
        projectId,
        JSON.stringify(ip_whitelist),
        JSON.stringify(ip_blacklist),
        max_rate_limit_per_min,
        captcha_required ? 1 : 0,
        fraud_detection_enabled ? 1 : 0,
        new Date().toISOString()
      );
    }

    return NextResponse.json({ success: true, message: 'Security rules updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update security rules' }, { status: 500 });
  }
}
