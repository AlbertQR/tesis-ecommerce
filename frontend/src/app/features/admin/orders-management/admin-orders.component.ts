import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Order, OrderStatus } from '@core/models/user.model';
import { environment } from '@environments/environment';
import { FormatPricePipe, FormatDatePipe } from '@shared/pipes';
import { getStatusLabel, getStatusClass } from '@shared/utils/order-helpers';

@Component({
  selector: 'app-admin-orders',
  imports: [FormsModule, FormatPricePipe, FormatDatePipe],
  templateUrl: './admin-orders.component.html'
})
export class AdminOrdersComponent implements OnInit {
  orders = signal<Order[]>([]);
  statusFilter = signal<'all' | OrderStatus>('all');
  searchTerm = signal('');
  selectedOrder = signal<Order | null>(null);
  isLoading = signal(false);
  assigningDelivery = signal<string | null>(null);
  deliveryPersonName = signal('');
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.http.get<Order[]>(`${this.apiUrl}/admin/orders`).subscribe({
      next: (data) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  filteredOrders(): Order[] {
    let result = this.orders();
    if (this.statusFilter() !== 'all') {
      result = result.filter(o => o.status === this.statusFilter());
    }
    if (this.searchTerm()) {
      const search = this.searchTerm().toLowerCase();
      result = result.filter(o =>
        (o.orderId?.toLowerCase().includes(search) || o.id.toLowerCase().includes(search))
      );
    }
    return result;
  }

  getStatusLabel = getStatusLabel;
  getStatusClass = getStatusClass;

  updateStatus(orderId: string, newStatus: OrderStatus): void {
    this.http.put<Order>(`${this.apiUrl}/admin/orders/${orderId}/status`, { status: newStatus }).subscribe({
      next: (updated) => {
        this.orders.update(orders => orders.map(o => o.id === orderId ? updated : o));
      }
    });
  }

  viewOrder(order: Order): void {
    this.selectedOrder.set(order);
    this.deliveryPersonName.set(order.deliveryPerson || '');
  }

  closeModal(): void {
    this.selectedOrder.set(null);
    this.assigningDelivery.set(null);
    this.deliveryPersonName.set('');
  }

  startAssignDelivery(orderId: string): void {
    this.assigningDelivery.set(orderId);
    const order = this.orders().find(o => o.id === orderId);
    this.deliveryPersonName.set(order?.deliveryPerson || '');
  }

  saveDeliveryPerson(orderId: string): void {
    const name = this.deliveryPersonName().trim();
    this.http.put<Order>(`${this.apiUrl}/admin/orders/${orderId}/delivery`, { deliveryPerson: name }).subscribe({
      next: (updated) => {
        this.orders.update(orders => orders.map(o => o.id === orderId ? updated : o));
        this.assigningDelivery.set(null);
      }
    });
  }

  getPaymentMethodLabel(method?: string): string {
    return method === 'enzona' ? 'EnZona' : 'Efectivo';
  }

  getPaymentStatusLabel(status?: string): string {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'pending': return 'Pendiente';
      case 'refunded': return 'Reembolsado';
      default: return 'N/A';
    }
  }

  getPaymentStatusClass(status?: string): string {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
