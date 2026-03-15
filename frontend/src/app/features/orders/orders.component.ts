import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { Order, OrderStatus } from '../../core/models/user.model';

@Component({
  selector: 'app-orders',
  imports: [RouterLink],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent {
  private userService = inject(UserService);

  orders = this.userService.orders;
  pendingOrders = this.userService.pendingOrders;
  completedOrders = this.userService.completedOrders;

  activeTab = signal<'all' | 'pending' | 'completed'>('all');

  selectedOrder = signal<Order | null>(null);

  setTab(tab: 'all' | 'pending' | 'completed'): void {
    this.activeTab.set(tab);
  }

  get filteredOrders(): Order[] {
    switch (this.activeTab()) {
      case 'pending':
        return this.pendingOrders();
      case 'completed':
        return this.completedOrders();
      default:
        return this.orders();
    }
  }

  getStatusLabel(status: OrderStatus): string {
    return this.userService.getStatusLabel(status);
  }

  getStatusClass(status: OrderStatus): string {
    return this.userService.getStatusClass(status);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder.set(order);
  }

  closeOrderDetails(): void {
    this.selectedOrder.set(null);
  }

  getItemCount(items: Order[]): number {
    return items.reduce((sum, order) => sum + order.items.length, 0);
  }
}
