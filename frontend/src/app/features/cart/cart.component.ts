import { Component, inject, signal } from '@angular/core';
import { CartService } from '../../core/services/cart.service';
import { UserService } from '../../core/services/user.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Address } from '../../core/models/user.model';

/**
 * Componente del carrito de compras.
 * Muestra los productos agregados, permite modificar cantidades,
 * calcular totales y procesar el checkout.
 * 
 * @component CartComponent
 * @description Visualiza y gestiona el carrito de compras del usuario.
 *              Muestra items, subtotal, costo de envío y total.
 *              Permite alternar entre delivery y recogida.
 * 
 * @example
 * ```html
 * <app-cart></app-cart>
 * ```
 * 
 * @requires CartService
 */
@Component({
  selector: 'app-cart',
  imports: [RouterLink, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  /** Servicio de carrito para gestionar las operaciones */
  private cartService = inject(CartService);
  
  /** Servicio de usuario para obtener direcciones */
  private userService = inject(UserService);
  
  /** Router para navegación */
  private router = inject(Router);

  /**
   * Items del carrito desde el servicio.
   * @readonly
   */
  cartItems = this.cartService.cartItems;
  
  /**
   * Total del carrito (subtotal + envío).
   * @readonly
   */
  cartTotal = this.cartService.cartTotal;
  
  /**
   * Cantidad total de items.
   * @readonly
   */
  cartCount = this.cartService.cartCount;
  
  /**
   * Subtotal sin envío.
   * @readonly
   */
  subtotal = this.cartService.subtotal;
  
  /**
   * Costo de envío actual.
   * @readonly
   */
  deliveryFee = this.cartService.deliveryFee;
  
  /**
   * Indica si el usuario eligió delivery.
   * @readonly
   */
  hasDelivery = this.cartService.hasDelivery;

  /**
   * Direcciones del usuario.
   * @readonly
   */
  addresses = this.userService.addresses;
  
  /**
   * Dirección seleccionada para entrega.
   */
  selectedAddressId = signal<string | null>(null);
  
  /**
   * Dirección predeterminada.
   */
  defaultAddress = this.userService.defaultAddress;

  constructor() {
    this.userService.loadAddresses();
  }

  /**
   * Obtiene la dirección seleccionada.
   */
  getSelectedAddress(): Address | undefined {
    return this.addresses().find(a => a.id === this.selectedAddressId());
  }

  /**
   * Cambia la dirección seleccionada.
   */
  onAddressChange(): void {
    const address = this.getSelectedAddress();
    if (address) {
      this.selectedAddressId.set(address.id);
    }
  }

  /**
   * Actualiza la cantidad de un producto en el carrito.
   * 
   * @method updateQuantity
   * @param {string} productId - ID del producto
   * @param {number} quantity - Nueva cantidad
   * @returns {void}
   */
  updateQuantity(productId: string, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  /**
   * Elimina un producto del carrito.
   * 
   * @method removeFromCart
   * @param {string} productId - ID del producto a eliminar
   * @returns {void}
   */
  removeFromCart(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  /**
   * Vacía completamente el carrito.
   * 
   * @method clearCart
   * @returns {void}
   */
  clearCart(): void {
    this.cartService.clearCart();
  }

  /**
   * Formatea un precio a formato colombiano (COP).
   * 
   * @method formatPrice
   * @param {number} price - Precio a formatear
   * @returns {string} Precio formateado
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  }

  /**
   * Alterna la opción de delivery/recogida.
   * 
   * @method onChangeDelivery
   * @returns {void}
   */
  onChangeDelivery(): void {
    this.cartService.toggleDelivery();
    if (!this.hasDelivery()) {
      this.selectedAddressId.set(null);
    }
  }

  /**
   * Procesa el checkout del carrito.
   * 
   * @method processCheckout
   * @returns {void}
   */
  processCheckout(): void {
    const hasDelivery = this.hasDelivery();
    const addressId = hasDelivery ? this.selectedAddressId() : '';
    
    if (hasDelivery && !addressId) {
      alert('Por favor selecciona una dirección de entrega');
      return;
    }

    this.cartService.checkout(addressId!, hasDelivery).subscribe({
      next: (order) => {
        this.router.navigate(['/pedido', order.id]);
      },
      error: (err) => {
        alert('Error al procesar el pedido: ' + (err.error?.error || 'Error desconocido'));
      }
    });
  }
}
