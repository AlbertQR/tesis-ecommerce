import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { ProductModel } from '@core/models';
import { CartService } from '@core/services/cart.service';
import { AuthService } from '@core/services/auth.service';
import { FormatPricePipe } from '@shared/pipes';

@Component({
  selector: 'app-product-card',
  imports: [FormatPricePipe],
  templateUrl: './product-card.component.html'
})
export class ProductCardComponent {
  product = input.required<ProductModel>();

  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);

  addToCart(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']).then(() => {
      });
      return;
    }
    this.cartService.addToCart(this.product());
  }

  getCategoryLabel(): string {
    const labels: Record<string, string> = {
      'cafeteria': 'Cafetería',
      'pizzeria': 'Pizzería',
      'despensa': 'Abastos'
    };
    return labels[this.product().category] || this.product().category;
  }
}
