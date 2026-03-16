import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '@core/services/data.service';
import { CartService } from '@core/services/cart.service';
import { AuthService } from '@core/services/auth.service';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';
import { FormatPricePipe } from '@shared/pipes';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCardComponent, FormatPricePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private dataService = inject(DataService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);

  categories = this.dataService.categories;
  featuredProducts = this.dataService.products;
  featuredCombo = this.dataService.featuredCombo;
  testimonials = this.dataService.testimonials;

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  hasHalfStar(rating: number): boolean {
    return rating % 1 !== 0;
  }

  addComboToCart(): void {
    const combo = this.featuredCombo();
    if (!combo) return;

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.addToCart({
      id: combo.id,
      name: combo.name,
      description: combo.description,
      price: combo.price,
      image: combo.image,
      category: 'combo',
      stock: 1,
      isFeatured: combo.isFeatured ?? false,
      isHot: false,
      isCombo: true
    });
  }
}
