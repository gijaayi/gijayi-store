import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { readDatabase } from '@/lib/server/database';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  const db = await readDatabase();
  
  // Calculate revenue and order metrics
  const totalRevenue = db.orders.reduce((sum, order) => sum + order.totalAmount, 0);
  
  // Revenue trend data (last 7 days)
  const last7Days = Array.from({length: 7}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const revenueTrendData = last7Days.map((date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const dayRevenue = db.orders
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= dayStart && orderDate <= dayEnd;
      })
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      date: date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
      revenue: dayRevenue,
    };
  });

  // Order status distribution
  const ordersByStatus = db.orders.reduce((acc, order) => {
    const status = order.status as keyof typeof acc;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });

  // Top products by sales
  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
  db.orders.forEach(order => {
    order.items.forEach(item => {
      if (!productSales[item.productId]) {
        const product = db.products.find(p => p.id === item.productId);
        productSales[item.productId] = {
          name: product?.name || 'Unknown',
          quantity: 0,
          revenue: 0,
        };
      }
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].revenue += item.price * item.quantity;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  // Monthly comparison (last 6 months)
  const monthlyData = Array.from({length: 6}, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    date.setDate(1);
    
    const monthStart = new Date(date);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(date);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);
    monthEnd.setHours(23, 59, 59, 999);
    
    const monthOrdersData = db.orders
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });

    const monthRevenue = monthOrdersData.reduce((sum, order) => sum + order.totalAmount, 0);
    const monthOrders = monthOrdersData.length;

    return {
      month: date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      revenue: monthRevenue,
      orders: monthOrders,
    };
  });

  return NextResponse.json({
    stats: {
      users: db.users.length,
      products: db.products.length,
      categories: db.categories.length,
      orders: db.orders.length,
      contacts: db.contacts.length,
      revenue: totalRevenue,
    },
    revenueTrendData,
    ordersByStatus,
    topProducts,
    monthlyData,
    latestOrders: db.orders.slice(0, 8),
    latestContacts: db.contacts.slice(0, 8),
  });
}
