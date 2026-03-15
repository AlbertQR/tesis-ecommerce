import { Component, inject, signal } from '@angular/core';
import { CartService } from '../../core/services/cart.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  private cartService = inject(CartService);

  cartItems = this.cartService.cartItems;
  cartTotal = this.cartService.cartTotal;
  cartCount = this.cartService.cartCount;
  subtotal = this.cartService.subtotal;
  deliveryFee = this.cartService.deliveryFee;
  hasDelivery = this.cartService.hasDelivery;

  updateQuantity(productId: string, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  removeFromCart(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  }

  onChangeDelivery(): void {
    this.cartService.toggleDelivery();
  }
}
