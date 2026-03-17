import { createHmac } from 'crypto';

export type SessionRole = 'admin' | 'user';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: SessionRole;
  exp: number;
}

export const SESSION_COOKIE_NAME = 'gijayi_session';

const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-only-change-this-secret';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function sign(data: string): string {
  return createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
}

export function createSessionToken(payload: Omit<SessionPayload, 'exp'>): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const fullPayload: SessionPayload = { ...payload, exp };
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return null;

  const expected = sign(encodedPayload);
  if (signature !== expected) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8')) as SessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
