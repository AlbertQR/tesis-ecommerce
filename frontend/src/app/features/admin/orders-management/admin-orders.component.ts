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
        o.id.toLowerCase().includes(search)
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
  }

  closeModal(): void {
    this.selectedOrder.set(null);
  }
}
