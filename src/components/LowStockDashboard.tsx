'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  price?: number;
}

export default function LowStockDashboard() {
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchLowStockProducts() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stock');
      const data = await response.json();
      setLowStockProducts(data.lowStockProducts || []);
    } catch (err) {
      setError('Failed to fetch low stock products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLowStockProducts();
    const interval = setInterval(fetchLowStockProducts, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  if (lowStockProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-amber-600" size={20} />
          <h3 className="font-semibold text-amber-900">Low Stock Alert</h3>
          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1 rounded-full">
            {lowStockProducts.length}
          </span>
        </div>
        <button
          onClick={fetchLowStockProducts}
          className="p-2 hover:bg-slate-100 rounded transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {lowStockProducts.map((product) => (
          <div key={product.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900 truncate">{product.name}</p>
              {product.price && (
                <p className="text-xs text-amber-700">₹{product.price.toLocaleString('en-IN')}</p>
              )}
            </div>
            <div className="text-right ml-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                product.stock === 0 
                  ? 'bg-red-200 text-red-800'
                  : 'bg-amber-200 text-amber-800'
              }`}>
                {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-amber-700 mt-4">
        ⚠️ Products with 5 or fewer items in stock are shown above. Please reorder to maintain inventory.
      </p>
    </div>
  );
}
