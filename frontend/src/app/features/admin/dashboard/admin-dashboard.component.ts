import { Component } from '@angular/core';

interface Stats {
  title: string;
  value: string;
  change: string;
  changeType: 'up' | 'down' | 'neutral';
  icon: string;
}

interface SalesData {
  labels: string[];
  values: number[];
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  stats: Stats[] = [
    { title: 'Ventas Totales', value: '$12.5M', change: '+12.5%', changeType: 'up', icon: 'fa-dollar-sign' },
    { title: 'Pedidos', value: '1,234', change: '+8.2%', changeType: 'up', icon: 'fa-box' },
    { title: 'Clientes', value: '856', change: '+15.3%', changeType: 'up', icon: 'fa-users' },
    { title: 'Ticket Promedio', value: '$45,000', change: '-2.1%', changeType: 'down', icon: 'fa-receipt' }
  ];

  salesData: SalesData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    values: [1200000, 1900000, 1500000, 2100000, 1800000, 2400000]
  };

  recentOrders = [
    { id: 'ORD-005', customer: 'María García', total: 85000, status: 'pending', time: '5 min' },
    { id: 'ORD-004', customer: 'Juan López', total: 32000, status: 'preparing', time: '15 min' },
    { id: 'ORD-003', customer: 'Pedro Martínez', total: 56000, status: 'delivered', time: '1 hora' },
    { id: 'ORD-002', customer: 'Ana Rodríguez', total: 42000, status: 'delivered', time: '2 horas' }
  ];

  topProducts = [
    { name: 'Pizza Pepperoni', sales: 145, revenue: 5075000 },
    { name: 'Combo Familiar', sales: 89, revenue: 4895000 },
    { name: 'Latte Caramel', sales: 234, revenue: 2808000 },
    { name: 'Harina 1kg', sales: 312, revenue: 1404000 }
  ];

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  getMaxSales(): number {
    return Math.max(...this.salesData.values);
  }
}
