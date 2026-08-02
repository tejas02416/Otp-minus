import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const suspiciousIps = db.prepare(`
    SELECT ip_address, COUNT(*) as failure_count
    FROM api_logs
    WHERE status_code >= 400
    GROUP BY ip_address
    HAVING failure_count >= 1
    ORDER BY failure_count DESC
    LIMIT 20
  `).all();

  return NextResponse.json({
    fraudAlerts: [
      {
        id: 'frd_101',
        type: 'VELOCITY_SPIKE',
        severity: 'high',
        description: 'Rapid OTP requests detected from IP 198.51.100.14 (32 requests/min)',
        ipAddress: '198.51.100.14',
        status: 'blocked',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      },
      {
        id: 'frd_102',
        type: 'REPLAY_ATTEMPT',
        severity: 'medium',
        description: 'Repeated expired OTP verification attempts detected on recipient +15550192834',
        ipAddress: '192.168.1.45',
        status: 'investigating',
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      },
    ],
    suspiciousIps,
  });
}
