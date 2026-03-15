import { Component, inject, signal } from '@angular/core';
import { CartService } from '@core/services/cart.service';
import { UserService } from '@core/services/user.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Address } from '@core/models/user.model';
import { FormatPricePipe } from '@shares/pipes';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, FormsModule, FormatPricePipe],
  templateUrl: './cart.component.html'
})
export class CartComponent {
  selectedAddressId = signal<string | null>(null);
  private cartService = inject(CartService);
  cartItems = this.cartService.cartItems;
  cartTotal = this.cartService.cartTotal;
  cartCount = this.cartService.cartCount;
  subtotal = this.cartService.subtotal;
  deliveryFee = this.cartService.deliveryFee;
  hasDelivery = this.cartService.hasDelivery;
  private userService = inject(UserService);
  addresses = this.userService.addresses;
  private router = inject(Router);

  constructor() {
    this.userService.loadAddresses();
  }

  getSelectedAddress(): Address | undefined {
    return this.addresses().find(a => a.id === this.selectedAddressId());
  }

  onAddressChange(): void {
    const address = this.getSelectedAddress();
    if (address) {
      this.selectedAddressId.set(address.id);
    }
  }

  updateQuantity(productId: string, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  removeFromCart(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  onChangeDelivery(): void {
    this.cartService.toggleDelivery();
    if (!this.hasDelivery()) {
      this.selectedAddressId.set(null);
    }
  }

  processCheckout(): void {
    const hasDelivery = this.hasDelivery();
    const addressId = hasDelivery ? this.selectedAddressId() : '';

    if (hasDelivery && !addressId) {
      alert('Por favor selecciona una dirección de entrega');
      return;
    }

    this.cartService.checkout(addressId!, hasDelivery).subscribe({
      next: (order) => {
        this.router.navigate(['/pedido', order.id]).then(() => {
        });
      },
      error: (err) => {
        alert('Error al procesar el pedido: ' + (err.error?.error || 'Error desconocido'));
      }
    });
  }
}
