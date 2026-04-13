'use client';

import { AlertTriangle } from 'lucide-react';

interface LowStockAlertProps {
  stock: number;
  threshold?: number;
}

const LOW_STOCK_THRESHOLD = 5;

export default function LowStockAlert({ stock, threshold = LOW_STOCK_THRESHOLD }: LowStockAlertProps) {
  if (stock > threshold) return null;

  return (
    <div className="mt-4 border border-amber-300 bg-amber-50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-amber-600 mt-1 flex-shrink-0" size={18} />
        <div>
          <h3 className="font-semibold text-amber-900 text-sm">Low Stock Alert</h3>
          <p className="text-amber-800 text-sm mt-1">
            {stock === 0 
              ? 'This product is out of stock!' 
              : `Only ${stock} item${stock !== 1 ? 's' : ''} left in stock`}
          </p>
          {stock === 0 && (
            <p className="text-amber-700 text-xs mt-2">
              Please reorder this product to make it available for customers.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
