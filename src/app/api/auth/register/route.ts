import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/server/password';
import { sanitizeUser, updateDatabase } from '@/lib/server/database';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/server/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!name || !email || password.length < 6) {
      return NextResponse.json({ error: 'Name, valid email, and password (min 6) are required.' }, { status: 400 });
    }

    let createdUserId = '';

    const db = await updateDatabase(async (state) => {
      const exists = state.users.some((user) => user.email === email);
      if (exists) {
        throw new Error('EMAIL_EXISTS');
      }

      const passwordHash = await hashPassword(password);
      createdUserId = randomUUID();

      state.users.push({
        id: createdUserId,
        name,
        email,
        passwordHash,
        role: 'user',
        createdAt: new Date().toISOString(),
      });
    });

    const user = db.users.find((item) => item.id === createdUserId);
    if (!user) {
      return NextResponse.json({ error: 'Registration failed.' }, { status: 500 });
    }

    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({ user: sanitizeUser(user) });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_EXISTS') {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Unable to register user.' }, { status: 500 });
  }
}
