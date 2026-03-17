import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { updateDatabase } from '@/lib/server/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const firstName = String(body.firstName || '').trim();
    const lastName = String(body.lastName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const topic = String(body.topic || '').trim();
    const message = String(body.message || '').trim();

    if (!firstName || !lastName || !email || !topic || !message) {
      return NextResponse.json({ error: 'Please fill all required fields.' }, { status: 400 });
    }

    await updateDatabase((db) => {
      db.contacts.unshift({
        id: randomUUID(),
        firstName,
        lastName,
        email,
        phone,
        topic,
        message,
        status: 'new',
        createdAt: new Date().toISOString(),
      });
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to submit contact form.' }, { status: 500 });
  }
}
