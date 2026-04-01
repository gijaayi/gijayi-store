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
const ORDER_CONFIRMATION_FROM_EMAIL = process.env.ORDER_CONFIRMATION_FROM_EMAIL || '';
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

export async function sendOrderConfirmationEmail(input: SendOrderConfirmationEmailInput): Promise<SendEmailResult> {
  if (!RESEND_API_KEY || !ORDER_CONFIRMATION_FROM_EMAIL) {
    return { ok: false, skipped: true, error: 'Resend is not configured.' };
  }

  const deliveryDateLabel = new Date(input.estimatedDeliveryDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const orderTotalLabel = formatMoney(input.totalAmount, input.currency);

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;line-height:1.6;max-width:600px;margin:0 auto;">
      <h2 style="margin-bottom:8px;">Order Confirmed</h2>
      <p style="margin-top:0;">Hi ${input.customerName},</p>
      <p>Thank you for shopping with Gijayi. Your order has been confirmed successfully.</p>
      <div style="background:#faf8f4;border:1px solid #eee;padding:14px 16px;border-radius:8px;">
        <p style="margin:0 0 6px;"><strong>Order ID:</strong> ${input.orderCode}</p>
        <p style="margin:0 0 6px;"><strong>Total Paid:</strong> ${orderTotalLabel}</p>
        <p style="margin:0;"><strong>Estimated Delivery:</strong> ${deliveryDateLabel}</p>
      </div>
      <p style="margin-top:16px;">You can track your order anytime from your account or order tracking page.</p>
      <p style="margin-top:20px;">Regards,<br />Team Gijayi</p>
    </div>
  `;

  const text = [
    `Hi ${input.customerName},`,
    '',
    'Your order is confirmed successfully.',
    `Order ID: ${input.orderCode}`,
    `Total Paid: ${orderTotalLabel}`,
    `Estimated Delivery: ${deliveryDateLabel}`,
    '',
    'Regards,',
    'Team Gijayi',
  ].join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: ORDER_CONFIRMATION_FROM_EMAIL,
      to: input.to,
      ...(ORDER_CONFIRMATION_CC_EMAIL && { cc: [ORDER_CONFIRMATION_CC_EMAIL] }),
      subject: `Order Confirmed: ${input.orderCode}`,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { ok: false, error: `Resend error: ${errorText}` };
  }

  return { ok: true };
}
