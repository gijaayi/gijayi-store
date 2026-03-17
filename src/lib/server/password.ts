import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${key.toString('hex')}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, storedKey] = hash.split(':');
  if (!salt || !storedKey) return false;

  const key = (await scrypt(password, salt, 64)) as Buffer;
  const storedBuffer = Buffer.from(storedKey, 'hex');

  if (storedBuffer.length !== key.length) return false;

  return timingSafeEqual(storedBuffer, key);
}
