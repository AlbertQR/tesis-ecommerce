import { Component, inject, OnInit, signal } from '@angular/core';
import { DashboardService } from '@core/services/dashboard.service';
import { FormatPricePipe } from '@shared/pipes';

interface Stats {
  title: string;
  value: string;
  change: string;
  changeType: 'up' | 'down' | 'neutral';
  icon: string;
}

interface RecentOrder {
  id: string;
  customer: string;
  total: number;
  status: string;
  date: Date;
  time?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [FormatPricePipe],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  stats = signal<Stats[]>([]);
  salesData = signal<{ labels: string[]; values: number[] }>({ labels: [], values: [] });
  recentOrders = signal<RecentOrder[]>([]);
  topProducts = signal<{ name: string; sales: number; revenue: number }[]>([]);
  isLoading = signal(true);
  private dashboardService = inject(DashboardService);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        const statsList: Stats[] = [
          {
            title: 'Usuarios',
            value: data.stats.totalUsers.value.toString(),
            change: '',
            changeType: 'neutral',
            icon: 'fa-users'
          },
          {
            title: 'Pedidos Totales',
            value: data.stats.totalOrders.value.toString(),
            change: '',
            changeType: 'neutral',
            icon: 'fa-shopping-bag'
          },
          {
            title: 'Ingresos del Mes',
            value: new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0
            }).format(data.stats.totalRevenue.value),
            change: data.stats.totalRevenue.change || '0',
            changeType: parseFloat(data.stats.totalRevenue.change || '0') >= 0 ? 'up' : 'down',
            icon: 'fa-dollar-sign'
          },
          {
            title: 'Pedidos Hoy',
            value: data.stats.ordersToday.value.toString(),
            change: '',
            changeType: 'neutral',
            icon: 'fa-calendar-day'
          },
          {
            title: 'Pedidos Completados',
            value: data.stats.completedOrders.value.toString(),
            change: '',
            changeType: 'neutral',
            icon: 'fa-check-circle'
          },
          {
            title: 'Pedidos Pendientes',
            value: data.stats.pendingOrders.value.toString(),
            change: '',
            changeType: 'neutral',
            icon: 'fa-clock'
          },
          {
            title: 'Pedidos Pagados',
            value: data.stats.paidOrders.value.toString(),
            change: '',
            changeType: 'neutral',
            icon: 'fa-credit-card'
          },
          {
            title: 'Productos',
            value: data.stats.totalProducts.value.toString(),
            change: '',
            changeType: 'neutral',
            icon: 'fa-box'
          }
        ];

        this.stats.set(statsList);
        this.salesData.set(data.salesData);
        this.recentOrders.set(data.recentOrders.map(o => ({
          ...o,
          time: this.getTimeAgo(o.date)
        })));
        this.topProducts.set(data.topProducts);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  getTimeAgo(date: Date | string): string {
    const now = new Date();
    const orderDate = new Date(date);
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins} min`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hora${Math.floor(diffMins / 60) > 1 ? 's' : ''}`;
    return `${Math.floor(diffMins / 1440)} día${Math.floor(diffMins / 1440) > 1 ? 's' : ''}`;
  }

  getStatusLabel(status: string): string {
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

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getMaxSales(): number {
    const values = this.salesData().values;
    return values.length > 0 ? Math.max(...values) : 0;
  }
}
