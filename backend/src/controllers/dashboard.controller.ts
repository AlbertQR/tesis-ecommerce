import { Response } from 'express';
import { Order, Product, User } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalUsers,
      totalOrders,
      totalProducts,
      ordersToday,
      ordersThisMonth,
      ordersLastMonth,
      revenueToday,
      revenueThisMonth,
      revenueLastMonth,
      recentOrders,
      topProducts,
      ordersByStatus,
      paidOrders
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments({ date: { $gte: startOfDay } }),
      Order.countDocuments({ date: { $gte: startOfMonth } }),
      Order.countDocuments({ date: { $gte: startOfLastMonth, $lt: new Date(now.getFullYear(), now.getMonth(), 1) } }),
      Order.aggregate([
        { $match: { date: { $gte: startOfDay }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $match: { date: { $gte: startOfMonth }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $match: { date: { $gte: startOfLastMonth, $lte: endOfLastMonth }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.find().sort({ date: -1 }).limit(10).populate('userId', 'name email'),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $unwind: '$items' },
        { $group: { _id: '$items.productId', name: { $first: '$items.productName'}, sales: { $sum: '$items.quantity'}, revenue: { $sum: { $multiply: ['$items.unitPrice', '$items.quantity'] } } } },
        { $sort: { sales: -1 } },
        { $limit: 5 }
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Order.countDocuments({ paymentStatus: 'paid' })
    ]);

    const todayRevenue = revenueToday[0]?.total || 0;
    const monthRevenue = revenueThisMonth[0]?.total || 0;
    const lastMonthRevenue = revenueLastMonth[0]?.total || 0;

    const revenueChange = lastMonthRevenue > 0 
      ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    const ordersChange = ordersLastMonth > 0 
      ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100 
      : 0;

    const pendingOrders = ordersByStatus.find((o: { _id: string }) => o._id === 'pending')?.count || 0;
    const completedOrders = ordersByStatus.find((o: { _id: string }) => o._id === 'delivered')?.count || 0;
    const cancelledOrders = ordersByStatus.find((o: { _id: string }) => o._id === 'cancelled')?.count || 0;

    const salesData = await Order.aggregate([
      { $match: { date: { $gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $month: '$date' },
          total: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        month: monthNames[d.getMonth()],
        value: 0
      });
    }

    for (const sale of salesData) {
      const idx = last6Months.findIndex((m: { month: string }) => m.month === monthNames[(sale._id as number) - 1]);
      if (idx !== -1) {
        last6Months[idx].value = sale.total;
      }
    }

    res.json({
      stats: {
        totalUsers: {
          value: totalUsers,
          label: 'Usuarios',
          icon: 'fa-users'
        },
        totalOrders: {
          value: totalOrders,
          label: 'Pedidos',
          icon: 'fa-shopping-bag'
        },
        totalRevenue: {
          value: monthRevenue,
          label: 'Ingresos del mes',
          icon: 'fa-dollar-sign',
          change: revenueChange.toFixed(1)
        },
        completedOrders: {
          value: completedOrders,
          label: 'Pedidos completados',
          icon: 'fa-check-circle'
        },
        pendingOrders: {
          value: pendingOrders,
          label: 'Pedidos pendientes',
          icon: 'fa-clock'
        },
        cancelledOrders: {
          value: cancelledOrders,
          label: 'Pedidos cancelados',
          icon: 'fa-times-circle'
        },
        ordersToday: {
          value: ordersToday,
          label: 'Pedidos hoy',
          icon: 'fa-calendar-day'
        },
        ordersChange: {
          value: ordersThisMonth,
          label: 'Pedidos este mes',
          icon: 'fa-chart-line',
          change: ordersChange.toFixed(1)
        },
        paidOrders: {
          value: paidOrders,
          label: 'Pedidos pagados',
          icon: 'fa-credit-card'
        },
        totalProducts: {
          value: totalProducts,
          label: 'Productos',
          icon: 'fa-box'
        }
      },
      salesData: {
        labels: last6Months.map((m: { month: string }) => m.month),
        values: last6Months.map((m: { value: number }) => m.value)
      },
      recentOrders: recentOrders.map((order: InstanceType<typeof Order>) => ({
        id: order.orderId || String(order._id),
        customer: (order.userId as unknown as { name?: string })?.name || 'Cliente',
        total: order.total,
        status: order.status,
        date: order.date
      })),
      topProducts: topProducts.map((p: { _id: string; name: string; sales: number; revenue: number }) => ({
        id: p._id,
        name: p.name,
        sales: p.sales,
        revenue: p.revenue
      }))
    });
  } catch (error) {
    console.error('GetDashboardStats error:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
