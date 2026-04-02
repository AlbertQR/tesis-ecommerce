import * as XLSX from 'xlsx';
import { Response } from 'express';

export interface SalesReportRow {
  orderId: string;
  date: string;
  customer: string;
  email: string;
  items: string;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  status: string;
}

export interface OrdersReportRow {
  orderId: string;
  date: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  items: string;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export interface InventoryReportRow {
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  isFeatured: string;
  isHot: string;
  createdAt: string;
}

export class ExportService {
  static exportToExcel(
    data: Array<Record<string, unknown>>,
    filename: string,
    sheetName: string,
    res: Response
  ): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, 20)
    }));
    worksheet['!cols'] = colWidths;

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  static formatSalesReport(orders: Array<{
    orderId: string;
    date: Date;
    userId: { name: string; email: string };
    items: Array<{ productName: string; quantity: number }>;
    subtotal: number;
    shipping: number;
    total: number;
    paymentMethod: string;
    status: string;
  }>): SalesReportRow[] {
    return orders.map(order => ({
      orderId: order.orderId,
      date: new Date(order.date).toLocaleDateString('es-CO'),
      customer: order.userId?.name || 'N/A',
      email: order.userId?.email || 'N/A',
      items: order.items.map(i => `${i.quantity}x ${i.productName}`).join(', '),
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      paymentMethod: order.paymentMethod === 'cash' ? 'Efectivo' : 'EnZona',
      status: this.getStatusLabel(order.status)
    }));
  }

  static formatOrdersReport(orders: Array<{
    orderId: string;
    date: Date;
    userId: { name: string; email: string; phone?: string };
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
  }>): OrdersReportRow[] {
    return orders.map(order => ({
      orderId: order.orderId,
      date: new Date(order.date).toLocaleDateString('es-CO'),
      customer: order.userId?.name || 'N/A',
      email: order.userId?.email || 'N/A',
      phone: order.userId?.phone || 'N/A',
      address: order.deliveryAddress
        ? `${order.deliveryAddress.label || ''} - ${order.deliveryAddress.street || ''} #${order.deliveryAddress.number || ''}, ${order.deliveryAddress.neighborhood || ''}, ${order.deliveryAddress.city || ''}`
        : 'Recoger en tienda',
      items: order.items.map(i => `${i.quantity}x ${i.productName}`).join(', '),
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      paymentMethod: order.paymentMethod === 'cash' ? 'Efectivo' : 'EnZona',
      status: this.getStatusLabel(order.status),
      createdAt: new Date(order.createdAt).toLocaleDateString('es-CO')
    }));
  }

  static formatInventoryReport(products: Array<{
    name: string;
    category: string;
    price: number;
    stock: number;
    isFeatured?: boolean;
    isHot?: boolean;
    createdAt: Date;
  }>): InventoryReportRow[] {
    return products.map(product => ({
      name: product.name,
      category: this.getCategoryLabel(product.category),
      price: product.price,
      stock: product.stock,
      status: product.stock === 0 ? 'Agotado' : product.stock < 5 ? 'Bajo Stock' : 'Disponible',
      isFeatured: product.isFeatured ? 'Sí' : 'No',
      isHot: product.isHot ? 'Sí' : 'No',
      createdAt: new Date(product.createdAt).toLocaleDateString('es-CO')
    }));
  }

  static getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      ready: 'Listo',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  }

  static getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      cafeteria: 'Cafetería',
      pizzeria: 'Pizzería',
      despensa: 'Despensa',
      combo: 'Combo'
    };
    return labels[category] || category;
  }
}
