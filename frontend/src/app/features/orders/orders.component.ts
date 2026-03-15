import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { Order, OrderStatus } from '../../core/models/user.model';

/**
 * Componente de lista de pedidos del usuario.
 * Muestra los pedidos con filtros por estado y detalles.
 * 
 * @component OrdersComponent
 * @description Lista los pedidos del usuario con pestañas para filtrar
 *              por estado (todos, pendientes, completados) y muestra
 *              detalles de cada pedido en un modal.
 * 
 * @example
 * ```html
 * <app-orders></app-orders>
 * ```
 * 
 * @requires UserService
 */
@Component({
  selector: 'app-orders',
  imports: [RouterLink],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent {
  /** Servicio de usuario para acceder a pedidos */
  private userService = inject(UserService);

  /**
   * Todos los pedidos del usuario.
   * @readonly
   */
  orders = this.userService.orders;
  
  /**
   * Pedidos pendientes.
   * @readonly
   */
  pendingOrders = this.userService.pendingOrders;
  
  /**
   * Pedidos completados.
   * @readonly
   */
  completedOrders = this.userService.completedOrders;

  /**
   * Signal con la pestaña activa.
   * @type {signal<'all' | 'pending' | 'completed'>}
   */
  activeTab = signal<'all' | 'pending' | 'completed'>('all');

  /**
   * Signal con el pedido seleccionado para ver detalles.
   * @type {signal<Order | null>}
   */
  selectedOrder = signal<Order | null>(null);

  /**
   * Cambia la pestaña activa.
   * 
   * @method setTab
   * @param {('all' | 'pending' | 'completed')} tab - Pestaña a activar
   * @returns {void}
   */
  setTab(tab: 'all' | 'pending' | 'completed'): void {
    this.activeTab.set(tab);
  }

  /**
   * Getter para obtener los pedidos filtrados según la pestaña activa.
   * @returns {Order[]}
   */
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

  /**
   * Obtiene la etiqueta en español del estado del pedido.
   * 
   * @method getStatusLabel
   * @param {OrderStatus} status - Estado del pedido
   * @returns {string} Etiqueta del estado
   */
  getStatusLabel(status: OrderStatus): string {
    return this.userService.getStatusLabel(status);
  }

  /**
   * Obtiene las clases CSS para el badge del estado.
   * 
   * @method getStatusClass
   * @param {OrderStatus} status - Estado del pedido
   * @returns {string} Clases CSS
   */
  getStatusClass(status: OrderStatus): string {
    return this.userService.getStatusClass(status);
  }

  /**
   * Formatea un precio a formato colombiano.
   * 
   * @method formatPrice
   * @param {number} price - Precio a formatear
   * @returns {string} Precio formateado
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  /**
   * Formatea una fecha a formato legible en español.
   * 
   * @method formatDate
   * @param {string | Date} date - Fecha a formatear
   * @returns {string} Fecha formateada
   */
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Descarga la factura de un pedido.
   * 
   * @method downloadInvoice
   * @param {string} orderId - ID del pedido
   * @returns {void}
   */
  downloadInvoice(orderId: string): void {
    this.userService.downloadInvoice(orderId);
  }

  /**
   * Muestra los detalles de un pedido.
   * 
   * @method viewOrderDetails
   * @param {Order} order - Pedido a visualizar
   * @returns {void}
   */
  viewOrderDetails(order: Order): void {
    this.selectedOrder.set(order);
  }

  /**
   * Cierra el modal de detalles del pedido.
   * 
   * @method closeOrderDetails
   * @returns {void}
   */
  closeOrderDetails(): void {
    this.selectedOrder.set(null);
  }

  /**
   * Cancela un pedido.
   * 
   * @method cancelOrder
   * @param {string} orderId - ID del pedido a cancelar
   * @returns {void}
   */
  cancelOrder(orderId: string): void {
    if (confirm('¿Estás seguro de que quieres cancelar este pedido?')) {
      this.userService.cancelOrder(orderId);
    }
  }

  /**
   * Calcula la cantidad total de items en una lista de pedidos.
   * 
   * @method getItemCount
   * @param {Order[]} items - Lista de pedidos
   * @returns {number} Cantidad total de items
   */
  getItemCount(items: Order[]): number {
    return items.reduce((sum, order) => sum + order.items.length, 0);
  }
}
