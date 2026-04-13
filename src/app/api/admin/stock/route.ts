import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, updateDatabase } from '@/lib/server/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body as { items: Array<{ productId: string; quantity: number }> };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const db = await updateDatabase((state) => {
      for (const item of items) {
        const product = state.products.find((p) => p.id === item.productId);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
        }
      }
    });

    // Get low stock products for admin notifications
    const lowStockProducts = db.products.filter((p) => p.stock <= 5).map((p) => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
    }));

    return NextResponse.json({
      success: true,
      message: 'Stock updated successfully',
      lowStockProducts,
    });
  } catch (error) {
    console.error('Failed to update stock:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}

// Get low stock products
export async function GET() {
  try {
    const db = await readDatabase();
    const lowStockProducts = db.products
      .filter((p) => p.stock <= 5)
      .map((p) => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        price: p.price,
      }))
      .sort((a, b) => a.stock - b.stock);

    return NextResponse.json({
      lowStockProducts,
      count: lowStockProducts.length,
    });
  } catch (error) {
    console.error('Failed to fetch low stock products:', error);
    return NextResponse.json({ error: 'Failed to fetch low stock products' }, { status: 500 });
  }
}
