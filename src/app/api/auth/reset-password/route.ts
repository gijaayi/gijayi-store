import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, updateDatabase } from '@/lib/server/database';
import { hashPassword } from '@/lib/server/password';

export async function POST(request: NextRequest) {
  try {
    const { email: rawEmail, token, newPassword, confirmPassword } = await request.json();
    const email = String(rawEmail || '').trim().toLowerCase();

    if (!email || !token || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const db = await readDatabase();
    const user = db.users.find((u) => u.email.toLowerCase() === email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token or email' }, { status: 400 });
    }

    // @ts-ignore
    const storedToken = user.resetToken;
    // @ts-ignore
    const expiry = user.resetTokenExpiry;

    if (!storedToken || !expiry || storedToken !== token || Date.now() > Number(expiry)) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const hashed = await hashPassword(newPassword);

    await updateDatabase((state) => {
      const toUpdate = state.users.find((u) => u.id === user.id);
      if (toUpdate) {
        toUpdate.passwordHash = hashed;
        // Clean up reset token fields
        // @ts-ignore
        delete toUpdate.resetToken;
        // @ts-ignore
        delete toUpdate.resetTokenExpiry;
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('reset-password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
