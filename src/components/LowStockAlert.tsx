'use client';

import { AlertTriangle } from 'lucide-react';

interface LowStockAlertProps {
  stock: number;
  threshold?: number;
}

const LOW_STOCK_THRESHOLD = 5;

/**
 * Customer-facing low-stock notice.
 * Must not show exact inventory counts or admin reorder instructions.
 * Admin inventory details live in LowStockDashboard (admin panel only).
 */
export default function LowStockAlert({ stock, threshold = LOW_STOCK_THRESHOLD }: LowStockAlertProps) {
  if (stock > threshold) return null;

  const isOutOfStock = stock === 0;

  return (
    <div className="mt-4 border border-amber-300 bg-amber-50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-amber-600 mt-1 flex-shrink-0" size={18} />
        <div>
          <h3 className="font-semibold text-amber-900 text-sm">
            {isOutOfStock ? 'Out of Stock' : 'Low Stock'}
          </h3>
          <p className="text-amber-800 text-sm mt-1">
            {isOutOfStock
              ? 'This product is currently unavailable.'
              : 'Only a few items left — order soon.'}
          </p>
        </div>
      </div>
    </div>
  );
}
