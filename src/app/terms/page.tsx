import type { Metadata } from 'next';
import ReturnExchangeRepairPolicyPage from '@/components/policy/ReturnExchangeRepairPolicyPage';

export const metadata: Metadata = {
  title: 'Return, Exchange & Repair Policy – Gijayi',
  description:
    'Read Gijayi\'s return, exchange, refund, cancellation, and free repair support policy for handcrafted jewellery.',
  keywords: 'Gijayi return policy, exchange policy, repair support, jewellery returns, handcrafted jewellery policy',
};

export default function TermsPage() {
  return <ReturnExchangeRepairPolicyPage />;
}