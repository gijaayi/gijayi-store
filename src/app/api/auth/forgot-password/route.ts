import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { readDatabase, updateDatabase } from '@/lib/server/database';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.ORDER_CONFIRMATION_FROM_EMAIL || 'support@gijayi.com';
const FALLBACK_FROM_EMAIL = 'noreply@resend.dev';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

async function sendResetEmail(fromAddress: string, toEmail: string, html: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [toEmail],
      subject: 'Reset your Gijayi password',
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend error ${response.status}: ${errorText}`);
  }

  return response;
}

export async function POST(request: NextRequest) {
  try {
    const { email: rawEmail } = await request.json();
    const email = String(rawEmail || '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const db = await readDatabase();
    const user = db.users.find((u) => u.email.toLowerCase() === email);

    // Always return success to avoid leaking which emails exist.
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = randomBytes(24).toString('hex');
    const expiry = Date.now() + 1000 * 60 * 60; // 1 hour

    await updateDatabase((state) => {
      const toUpdate = state.users.find((u) => u.id === user.id);
      if (toUpdate) {
        // @ts-ignore - add transient fields
        toUpdate.resetToken = token;
        // @ts-ignore
        toUpdate.resetTokenExpiry = expiry;
      }
    });

    const resetUrl = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    const html = `
      <p>Hi ${user.name || ''},</p>
      <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    if (RESEND_API_KEY) {
      const primaryFrom = `Gijayi <${FROM_EMAIL}>`;
      try {
        await sendResetEmail(primaryFrom, email, html);
      } catch (firstError) {
        console.warn('[Email] Primary reset email failed, retrying with fallback sender.', firstError);
        try {
          await sendResetEmail(`Gijayi <${FALLBACK_FROM_EMAIL}>`, email, html);
        } catch (fallbackError) {
          console.error('[Email] Reset email failed with fallback sender too.', fallbackError);
        }
      }
    } else {
      console.error('[Email] RESEND_API_KEY is not configured, cannot send password reset email. Reset link:', resetUrl);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('forgot-password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
