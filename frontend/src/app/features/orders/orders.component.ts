import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { Order, OrderStatus } from '@core/models/user.model';
import { FormatPricePipe } from '@shared/pipes';

@Component({
  selector: 'app-orders',
  imports: [RouterLink, FormatPricePipe],
  templateUrl: './orders.component.html'
})
export class OrdersComponent {
  activeTab = signal<'all' | 'pending' | 'completed'>('all');
  selectedOrder = signal<Order | null>(null);
  private userService = inject(UserService);
  orders = this.userService.orders;
  pendingOrders = this.userService.pendingOrders;
  completedOrders = this.userService.completedOrders;

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

  setTab(tab: 'all' | 'pending' | 'completed'): void {
    this.activeTab.set(tab);
  }

  getStatusLabel(status: OrderStatus): string {
    return this.userService.getStatusLabel(status);
  }

  getStatusClass(status: OrderStatus): string {
    return this.userService.getStatusClass(status);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  downloadInvoice(orderId: string): void {
    this.userService.downloadInvoice(orderId);
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder.set(order);
  }

  closeOrderDetails(): void {
    this.selectedOrder.set(null);
  }

  cancelOrder(orderId: string): void {
    if (confirm('¿Estás seguro de que quieres cancelar este pedido?'))
      this.userService.cancelOrder(orderId);
  }
}
