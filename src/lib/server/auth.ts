import 'server-only';

import { NextRequest } from 'next/server';
import { readDatabase, sanitizeUser } from './database';
import { SESSION_COOKIE_NAME, verifySessionToken } from './session';

export async function getCurrentUserFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);
  if (!session) return null;

  const db = await readDatabase();
  const user = db.users.find((item) => item.id === session.userId);
  if (!user) return null;

  return sanitizeUser(user);
}

export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return { error: 'Unauthorized' as const };
  }

  return { user };
}

export async function requireAdmin(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) return auth;

  if (auth.user.role !== 'admin') {
    return { error: 'Forbidden' as const };
  }

  return auth;
}
