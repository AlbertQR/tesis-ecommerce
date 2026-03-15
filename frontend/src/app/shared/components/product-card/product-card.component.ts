import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../../core/models';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);

  addToCart(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.cartService.addToCart(this.product);
  }

  getCategoryLabel(): string {
    const labels: Record<string, string> = {
      'cafeteria': 'Cafetería',
      'pizzeria': 'Pizzería',
      'despensa': 'Abastos'
    };
    return labels[this.product.category] || this.product.category;
  }

  getCategoryBadgeClass(): string {
    if (this.product.category === 'despensa') {
      return 'bg-green-600';
    }
    return 'bg-brand';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }
}
