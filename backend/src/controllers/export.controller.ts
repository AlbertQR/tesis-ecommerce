import { Request, Response } from 'express';
import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { User } from '../models/user.model.js';
import { ExportService } from '../services/export.service.js';

interface PopulatedUser {
  name: string;
  email: string;
  phone?: string;
}

interface PopulatedOrder {
  orderId: string;
  date: Date;
  userId: PopulatedUser;
  items: Array<{ productName: string; quantity: number }>;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  status: string;
  deliveryAddress?: {
    label?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
  };
  createdAt: Date;
}

interface ProductDoc {
  name: string;
  category: string;
  price: number;
  stock: number;
  isFeatured?: boolean;
  isHot?: boolean;
  createdAt: Date;
}

export const exportSalesReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const query: Record<string, unknown> = {
      status: { $nin: ['cancelled'] }
    };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        (query.date as Record<string, Date>).$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        (query.date as Record<string, Date>).$lte = end;
      }
    }

    const orders = await Order.find(query)
      .populate<{ userId: PopulatedUser }>('userId', 'name email')
      .sort({ date: -1 })
      .lean() as PopulatedOrder[];

    const reportData = ExportService.formatSalesReport(orders);

    const filename = `reporte_ventas_${new Date().toISOString().split('T')[0]}.xlsx`;
    ExportService.exportToExcel(reportData as unknown as Array<Record<string, unknown>>, filename, 'Ventas', res);
  } catch (error) {
    console.error('Error exporting sales report:', error);
    res.status(500).json({ error: 'Error al exportar reporte de ventas' });
  }
};

export const exportOrdersReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, startDate, endDate } = req.query;

    const query: Record<string, unknown> = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        (query.date as Record<string, Date>).$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        (query.date as Record<string, Date>).$lte = end;
      }
    }

    const orders = await Order.find(query)
      .populate<{ userId: PopulatedUser }>('userId', 'name email phone')
      .sort({ date: -1 })
      .lean() as PopulatedOrder[];

    const reportData = ExportService.formatOrdersReport(orders);

    const filename = `reporte_pedidos_${new Date().toISOString().split('T')[0]}.xlsx`;
    ExportService.exportToExcel(reportData as unknown as Array<Record<string, unknown>>, filename, 'Pedidos', res);
  } catch (error) {
    console.error('Error exporting orders report:', error);
    res.status(500).json({ error: 'Error al exportar reporte de pedidos' });
  }
};

export const exportInventoryReport = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({})
      .sort({ category: 1, name: 1 })
      .lean() as ProductDoc[];

    const reportData = ExportService.formatInventoryReport(products);

    const filename = `reporte_inventario_${new Date().toISOString().split('T')[0]}.xlsx`;
    ExportService.exportToExcel(reportData as unknown as Array<Record<string, unknown>>, filename, 'Inventario', res);
  } catch (error) {
    console.error('Error exporting inventory report:', error);
    res.status(500).json({ error: 'Error al exportar reporte de inventario' });
  }
};

export const getExportOptions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = {
      ordersByStatus: await Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      totalProducts: await Product.countDocuments(),
      totalOrders: await Order.countDocuments(),
      totalUsers: await User.countDocuments()
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting export options:', error);
    res.status(500).json({ error: 'Error al obtener opciones de exportación' });
  }
};
