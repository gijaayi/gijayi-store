import 'server-only';

interface SendOrderConfirmationEmailInput {
  to: string;
  customerName: string;
  orderCode: string;
  totalAmount: number;
  currency: string;
  estimatedDeliveryDate: string;
}

interface SendEmailResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

// Must be a verified domain address in Resend — gmail.com is NOT allowed as sender.
// Set ORDER_CONFIRMATION_FROM_EMAIL="support@gijayi.com" in your env vars.
const ORDER_CONFIRMATION_FROM_EMAIL =
  process.env.ORDER_CONFIRMATION_FROM_EMAIL || 'support@gijayi.com';

const ORDER_CONFIRMATION_CC_EMAIL = process.env.ORDER_CONFIRMATION_CC_EMAIL || '';

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export async function sendOrderConfirmationEmail(
  input: SendOrderConfirmationEmailInput
): Promise<SendEmailResult> {
  if (!RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY is not set — skipping order confirmation email.');
    return { ok: false, skipped: true, error: 'RESEND_API_KEY is not configured.' };
  }

  if (!ORDER_CONFIRMATION_FROM_EMAIL) {
    console.warn('[Email] ORDER_CONFIRMATION_FROM_EMAIL is not set — skipping email.');
    return { ok: false, skipped: true, error: 'Sender email is not configured.' };
  }

  const deliveryDateLabel = new Date(input.estimatedDeliveryDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const orderTotalLabel = formatMoney(input.totalAmount, input.currency);

  // Resend requires a verified domain email as "from" (e.g. support@gijayi.com).
  // Gmail or other free provider addresses will be rejected by Resend's API.
  const fromAddress = `Gijayi <${ORDER_CONFIRMATION_FROM_EMAIL}>`;

  const currentYear = new Date().getFullYear();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmed – Gijayi</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:#1a1a1a;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,serif;font-size:28px;color:#d4af37;letter-spacing:0.08em;">GIJAYI</h1>
              <p style="margin:6px 0 0;font-size:11px;color:#999;letter-spacing:0.3em;text-transform:uppercase;">Luxury Jewellery</p>
            </td>
          </tr>
          <!-- Order confirmed banner -->
          <tr>
            <td style="background:#b8963e;padding:18px 40px;text-align:center;">
              <p style="margin:0;font-size:14px;color:#fff;letter-spacing:0.2em;text-transform:uppercase;font-weight:bold;">&#10003; &nbsp;Order Confirmed</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px;font-size:16px;color:#1a1a1a;">Dear <strong>${input.customerName}</strong>,</p>
              <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.7;">
                Thank you for your order with Gijayi. We are thrilled to be crafting something beautiful for you.
                Your order has been confirmed and is now being processed.
              </p>

              <!-- Order details box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f4;border:1px solid #e8dfc8;border-radius:8px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e8dfc8;">
                    <p style="margin:0;font-size:11px;color:#b8963e;letter-spacing:0.2em;text-transform:uppercase;font-weight:bold;">Order Details</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#555;">Order ID</td>
                        <td style="padding:6px 0;font-size:14px;color:#1a1a1a;font-weight:bold;text-align:right;">${input.orderCode}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#555;">Total Paid</td>
                        <td style="padding:6px 0;font-size:14px;color:#1a1a1a;font-weight:bold;text-align:right;">${orderTotalLabel}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#555;">Estimated Delivery</td>
                        <td style="padding:6px 0;font-size:14px;color:#1a1a1a;font-weight:bold;text-align:right;">${deliveryDateLabel}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 8px;font-size:14px;color:#555;line-height:1.7;">
                You can track your order anytime by logging into your Gijayi account or visiting our order tracking page.
              </p>

              <!-- CTA button -->
              <div style="text-align:center;margin:28px 0;">
                <a href="https://gijayi.com/track-order" style="display:inline-block;background:#1a1a1a;color:#d4af37;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;font-weight:bold;">
                  Track Your Order
                </a>
              </div>

              <p style="margin:24px 0 0;font-size:13px;color:#888;line-height:1.7;">
                If you have any questions, reply to this email or reach us at
                <a href="mailto:support@gijayi.com" style="color:#b8963e;text-decoration:none;">support@gijayi.com</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#1a1a1a;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#666;line-height:1.6;">
                &copy; ${currentYear} Gijayi. All rights reserved.<br />
                <a href="https://gijayi.com" style="color:#b8963e;text-decoration:none;">gijayi.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = [
    `Hi ${input.customerName},`,
    '',
    'Thank you for your order with Gijayi! Your order is confirmed.',
    '',
    `Order ID: ${input.orderCode}`,
    `Total Paid: ${orderTotalLabel}`,
    `Estimated Delivery: ${deliveryDateLabel}`,
    '',
    'Track your order at: https://gijayi.com/track-order',
    '',
    'Questions? Email us at support@gijayi.com',
    '',
    'Regards,',
    'Team Gijayi',
  ].join('\n');

  console.log(`[Email] Sending order confirmation to ${input.to} from ${fromAddress}`);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [input.to],
      ...(ORDER_CONFIRMATION_CC_EMAIL && { cc: [ORDER_CONFIRMATION_CC_EMAIL] }),
      subject: `Your Gijayi Order is Confirmed – ${input.orderCode}`,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Email] Resend API error (${response.status}):`, errorText);
    return { ok: false, error: `Resend error ${response.status}: ${errorText}` };
  }

  const data = (await response.json()) as { id?: string };
  console.log(`[Email] Order confirmation sent successfully. Resend ID: ${data?.id}`);
  return { ok: true };
}
