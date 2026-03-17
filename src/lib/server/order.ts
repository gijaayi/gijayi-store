import { randomInt, randomUUID } from 'crypto';
import { DbOrder, DbOrderItem } from './database';

export function createOrderCode(existingCodes: string[]) {
  let code = '';
  do {
    code = `GJY${randomInt(100000, 999999)}`;
  } while (existingCodes.includes(code));

  return code;
}

export function buildInitialTimeline(): DbOrder['timeline'] {
  const now = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return [
    { label: 'Order confirmed', time: now },
    { label: 'Payment accepted', time: now },
  ];
}

export function computeOrderTotals(items: DbOrderItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal >= 5000 ? 0 : 250;
  const totalAmount = subtotal + shippingCost;

  return { subtotal, shippingCost, totalAmount };
}

export function createOrderId() {
  return randomUUID();
}
