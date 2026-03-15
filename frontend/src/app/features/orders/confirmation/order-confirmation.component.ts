import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Order } from '@core/models/user.model';
import { UserService } from '@core/services/user.service';
import { FormatPricePipe } from '@shares/pipes';

@Component({
  selector: 'app-order-confirmation',
  imports: [CommonModule, RouterLink, FormatPricePipe],
  template: `
    <section class="py-16 bg-gray-50 min-h-screen">
      <div class="container mx-auto px-4">
        @if (isLoading()) {
          <div class="text-center py-16">
            <div
              class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
            <p class="mt-4 text-gray-600">Cargando...</p>
          </div>
        } @else if (order()) {
          @let o = order()!;
          <div class="max-w-2xl mx-auto">
            <!-- Éxito -->
            <div class="bg-white rounded-xl shadow-md p-8 text-center mb-6">
              <div
                class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fa-solid fa-check text-4xl text-green-600"></i>
              </div>
              <h1 class="text-3xl font-bold text-gray-800 mb-2">¡Pedido Realizado!</h1>
              <p class="text-gray-600">Tu pedido ha sido confirmado successfully.</p>

              <div class="mt-6 p-4 bg-gray-50 rounded-lg inline-block">
                <p class="text-sm text-gray-500">Número de Pedido</p>
                <p class="text-xl font-bold text-brand">{{ o.id }}</p>
              </div>
            </div>

            <!-- Detalles del pedido -->
            <div class="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4">Detalles del Pedido</h2>

              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Fecha:</span>
                  <span class="font-medium">{{ formatDate(o.date) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Estado:</span>
                  <span class="font-medium" [class]="getStatusClass(o.status)">
                    {{ getStatusLabel(o.status) }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Tipo:</span>
                  <span class="font-medium">
                    @if (o.deliveryAddress && o.deliveryAddress.label && o.deliveryAddress.label !== 'Recogida en tienda') {
                      <i class="fa-solid fa-truck"></i> Delivery
                    } @else {
                      <i class="fa-solid fa-store"></i> Recogida en tienda
                    }
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Expira:</span>
                  <span class="font-medium text-orange-600">{{ getExpiresAt() }}</span>
                </div>
              </div>

              @if (o.deliveryAddress && o.deliveryAddress.label && o.deliveryAddress.label !== 'Recogida en tienda') {
                <div class="mt-4 pt-4 border-t">
                  <h3 class="font-medium text-gray-700 mb-2">Dirección de Entrega:</h3>
                  <p class="text-gray-600">
                    {{ o.deliveryAddress.label }}<br>
                    {{ o.deliveryAddress.street }} #{{ o.deliveryAddress.number }}<br>
                    {{ o.deliveryAddress.neighborhood }}, {{ o.deliveryAddress.city }}
                    @if (o.deliveryAddress.instructions) {
                      <br><span class="text-sm">{{ o.deliveryAddress.instructions }}</span>
                    }
                  </p>
                </div>
              }
            </div>

            <!-- Productos -->
            <div class="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4">Productos</h2>
              <div class="space-y-3">
                @for (item of o.items; track item.productId) {
                  <div class="flex justify-between items-center">
                    <div class="flex items-center gap-3">
                      <span class="text-gray-500">{{ item.quantity }}x</span>
                      <span class="font-medium">{{ item.productName }}</span>
                    </div>
                    <span
                      class="text-brand font-medium">{{ (item.unitPrice * item.quantity) | formatPrice }}</span>
                  </div>
                }
              </div>

              <div class="mt-4 pt-4 border-t space-y-2">
                <div class="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{{ o.subtotal | formatPrice }}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>{{ o.shipping | formatPrice }}</span>
                </div>
                <div class="flex justify-between text-xl font-bold pt-2">
                  <span>Total</span>
                  <span class="text-brand">{{ o.total | formatPrice }}</span>
                </div>
              </div>
            </div>

            <!-- Botones -->
            <div class="flex gap-4">
              <a routerLink="/pedidos"
                 class="flex-1 bg-brand text-white font-bold py-3 rounded-lg text-center hover:bg-brand-hover transition-colors">
                Ver Mis Pedidos
              </a>
              <a routerLink="/productos"
                 class="flex-1 border border-brand text-brand font-bold py-3 rounded-lg text-center hover:bg-brand hover:text-white transition-colors">
                Seguir Comprando
              </a>
            </div>
          </div>
        } @else {
          <div class="text-center py-16">
            <i class="fa-solid fa-triangle-exclamation text-6xl text-red-300 mb-4"></i>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Pedido no encontrado</h2>
            <p class="text-gray-600 mb-6">No se encontró el pedido que buscas.</p>
            <a routerLink="/productos"
               class="inline-block bg-brand text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-hover transition-colors">
              Volver a la tienda
            </a>
          </div>
        }
      </div>
    </section>
  `
})
export class OrderConfirmationComponent implements OnInit {
  order = signal<Order | null>(null);
  isLoading = signal(true);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.loadOrder();
  }

  loadOrder(): void {
    this.userService.loadOrders();
    setTimeout(() => {
      const orderId = this.route.snapshot.paramMap.get('id');
      const orders = this.userService.orders() as Order[];
      const found = orders.find((o: Order) => o.id === orderId);
      if (found) this.order.set(found);
      this.isLoading.set(false);
    }, 500);
  }

  getExpiresAt(): string {
    const o = this.order();
    if (!o?.expiresAt) return 'N/A';
    return this.formatDate(o.expiresAt);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmado',
      'preparing': 'Preparando',
      'ready': 'Listo',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'pending': 'text-yellow-600',
      'confirmed': 'text-blue-600',
      'preparing': 'text-orange-600',
      'ready': 'text-green-600',
      'delivered': 'text-green-600',
      'cancelled': 'text-red-600'
    };
    return classes[status] || '';
  }
}
