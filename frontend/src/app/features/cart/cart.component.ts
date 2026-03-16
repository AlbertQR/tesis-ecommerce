import { Component, inject, signal } from '@angular/core';
import { CartService, PaymentMethod } from '@core/services/cart.service';
import { UserService } from '@core/services/user.service';
import { PaymentService } from '@core/services/payment.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Address } from '@core/models/user.model';
import { FormatPricePipe } from '@shared/pipes';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, FormsModule, FormatPricePipe],
  templateUrl: './cart.component.html'
})
export class CartComponent {
  selectedAddressId = signal<string | null>(null);
  private cartService = inject(CartService);
  private paymentService = inject(PaymentService);
  cartItems = this.cartService.cartItems;
  cartTotal = this.cartService.cartTotal;
  cartCount = this.cartService.cartCount;
  subtotal = this.cartService.subtotal;
  deliveryFee = this.cartService.deliveryFee;
  hasDelivery = this.cartService.hasDelivery;
  paymentMethod = this.cartService.paymentMethod;
  private userService = inject(UserService);
  addresses = this.userService.addresses;
  private router = inject(Router);

  constructor() {
    this.userService.loadAddresses();
  }

  getSelectedAddress(): Address | undefined {
    return this.addresses().find(a => a.id === this.selectedAddressId());
  }

  onPaymentMethodChange(method: PaymentMethod): void {
    this.cartService.setPaymentMethod(method);
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

    const paymentMethod = this.paymentMethod();

    this.cartService.checkout(addressId!, hasDelivery).subscribe({
      next: (order) => {
        if (paymentMethod === 'enzona') {
          this.paymentService.createPayment(order.orderId).subscribe({
            next: (payment) => {
              window.location.href = payment.confirmUrl;
            },
            error: (err) => {
              alert('Error al crear el pago: ' + (err.error?.error || 'Error desconocido'));
            }
          });
        } else {
          this.router.navigate(['/pedido', order.id]).then(() => {
          });
        }
      },
      error: (err) => {
        alert('Error al procesar el pedido: ' + (err.error?.error || 'Error desconocido'));
      }
    });
  }
}
