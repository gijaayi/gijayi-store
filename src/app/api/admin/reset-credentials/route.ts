import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { readDatabase, updateDatabase, DbUser } from '@/lib/server/database';
import { hashPassword } from '@/lib/server/password';

const ADMIN_LOGIN_EMAIL = (process.env.ADMIN_LOGIN_EMAIL || 'admin@gijayi.com').trim().toLowerCase() || 'admin@gijayi.com';
const ADMIN_LOGIN_PASSWORD = process.env.ADMIN_LOGIN_PASSWORD || 'Admin@123';
const ADMIN_NAME = 'Platform Admin';
const RESET_SECRET = process.env.ADMIN_RESET_SECRET || 'reset-admin-key';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { secret?: string };
    
    // Verify reset secret
    if (body.secret !== RESET_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminHash = await hashPassword(ADMIN_LOGIN_PASSWORD);

    await updateDatabase(async (db) => {
      // Find existing admin
      const existingAdminIndex = db.users.findIndex(u => u.role === 'admin' || u.email === ADMIN_LOGIN_EMAIL);

      if (existingAdminIndex !== -1) {
        // Update existing admin
        db.users[existingAdminIndex] = {
          ...db.users[existingAdminIndex],
          email: ADMIN_LOGIN_EMAIL,
          passwordHash: adminHash,
          name: ADMIN_NAME,
          role: 'admin',
        };
      } else {
        // Create new admin
        const newAdmin: DbUser = {
          id: randomUUID(),
          name: ADMIN_NAME,
          email: ADMIN_LOGIN_EMAIL,
          passwordHash: adminHash,
          role: 'admin',
          phone: '',
          hasPlacedOrder: false,
          createdAt: new Date().toISOString(),
        };
        db.users.push(newAdmin);
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Admin credentials synced successfully',
      admin: {
        email: ADMIN_LOGIN_EMAIL,
        name: ADMIN_NAME,
      },
    });
  } catch (err) {
    console.error('Sync credentials error:', err);
    return NextResponse.json({ error: 'Failed to sync credentials' }, { status: 500 });
  }
}
