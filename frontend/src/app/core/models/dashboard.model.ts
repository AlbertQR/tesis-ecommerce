export interface DashboardStats {
  totalUsers: { value: number; label: string; icon: string };
  totalOrders: { value: number; label: string; icon: string };
  totalRevenue: { value: number; label: string; icon: string; change?: string };
  completedOrders: { value: number; label: string; icon: string };
  pendingOrders: { value: number; label: string; icon: string };
  cancelledOrders: { value: number; label: string; icon: string };
  ordersToday: { value: number; label: string; icon: string };
  ordersChange: { value: number; label: string; icon: string; change?: string };
  paidOrders: { value: number; label: string; icon: string };
  totalProducts: { value: number; label: string; icon: string };
}

export interface DashboardData {
  stats: DashboardStats;
  salesData: {
    labels: string[];
    values: number[];
  };
  recentOrders: {
    id: string;
    customer: string;
    total: number;
    status: string;
    date: Date;
  }[];
  topProducts: {
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }[];
}
