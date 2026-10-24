import type { Metadata } from 'next';
import ReturnExchangeRepairPolicyPage from '@/components/policy/ReturnExchangeRepairPolicyPage';

export const metadata: Metadata = {
  title: 'Return, Exchange & Repair Policy – Gijayi',
  description:
    'Read Gijayi\'s 7-day return, exchange, refund, cancellation, and complimentary 6-month repair support policy for handcrafted jewellery.',
  keywords: 'Gijayi return policy, 7 day exchange policy, refund policy, repair support, handcrafted jewellery policy',
};

export default function TermsPage() {
  return <ReturnExchangeRepairPolicyPage />;
}