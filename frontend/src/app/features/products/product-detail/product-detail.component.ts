import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataService } from '@core/services/data.service';
import { CartService } from '@core/services/cart.service';
import { FavoritesService } from '@core/services/favorites.service';
import { AuthService } from '@core/services/auth.service';
import { ProductModel, ProductCategory } from '@core/models';
import { ProductReviewsComponent } from '@shared/components/product-reviews/product-reviews.component';
import { FormatPricePipe } from '@shared/pipes';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterLink, ProductReviewsComponent, FormatPricePipe],
  template: `
    <section class="py-8 bg-gray-50 min-h-screen">
      <div class="container mx-auto px-4">
        <!-- Breadcrumb -->
        <nav class="mb-6">
          <ol class="flex items-center gap-2 text-sm">
            <li><a routerLink="/" class="text-brand hover:underline">Inicio</a></li>
            <li class="text-gray-400">/</li>
            <li><a routerLink="/productos" class="text-brand hover:underline">Productos</a></li>
            <li class="text-gray-400">/</li>
            <li class="text-gray-600">{{ product()?.name }}</li>
          </ol>
        </nav>

        @if (product(); as p) {
          <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="grid md:grid-cols-2 gap-8 p-6">
              <!-- Imagen -->
              <div class="relative">
                <img [alt]="p.name" [src]="p.image"
                     class="w-full h-96 object-cover rounded-lg">
                <button (click)="toggleFavorite($event)"
                        class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-md hover:bg-brand hover:text-white flex items-center justify-center transition-colors">
                  <i [class]="isFavorite() ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart'"></i>
                </button>
                @if (p.isHot) {
                  <span class="absolute top-4 left-4 bg-brand text-white text-sm font-bold px-3 py-1 rounded">Hot</span>
                }
                @if (p.isCombo) {
                  <span class="absolute top-4 left-4 bg-purple-600 text-white text-sm font-bold px-3 py-1 rounded">Combo</span>
                }
                @if (p.category === 'despensa') {
                  <span class="absolute top-4 left-4 bg-green-600 text-white text-sm font-bold px-3 py-1 rounded">Despensa</span>
                }
              </div>

              <!-- Info -->
              <div>
                <span class="text-sm text-gray-500 uppercase font-semibold">{{ getCategoryLabel(p.category) }}</span>
                <h1 class="text-3xl font-bold text-gray-800 mt-1 mb-4">{{ p.name }}</h1>
                
                <p class="text-gray-600 mb-6">{{ p.description }}</p>

                <div class="flex items-center gap-4 mb-6">
                  <span class="text-3xl font-bold text-brand">{{ p.price | formatPrice }}</span>
                  @if (p.stock > 0) {
                    <span class="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">{{ p.stock }} disponibles</span>
                  } @else {
                    <span class="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">Sin stock</span>
                  }
                </div>

                <div class="flex gap-4">
                  <button (click)="addToCart()"
                          [disabled]="p.stock === 0"
                          class="flex-1 bg-brand text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <i class="fa-solid fa-cart-plus mr-2"></i> Agregar al Carrito
                  </button>
                  <button (click)="toggleFavorite($event)"
                          class="px-4 border-2 border-gray-200 rounded-lg hover:border-brand hover:text-brand transition-colors">
                    <i [class]="isFavorite() ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart'"></i>
                  </button>
                </div>

                @if (!isAuthenticated()) {
                  <p class="text-sm text-gray-500 mt-4">
                    <a routerLink="/login" class="text-brand hover:underline">Inicia sesión</a> para agregar a favoritos
                  </p>
                }
              </div>
            </div>

            <!-- Reviews -->
            <div class="p-6 border-t">
              <app-product-reviews [productId]="p.id"/>
            </div>
          </div>
        } @else {
          <div class="text-center py-12">
            <i class="fa-solid fa-circle-notch fa-spin text-4xl text-brand"></i>
            <p class="mt-4 text-gray-600">Cargando producto...</p>
          </div>
        }
      </div>
    </section>
  `
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataService = inject(DataService);
  private cartService = inject(CartService);
  private favoritesService = inject(FavoritesService);
  private authService = inject(AuthService);

  product = signal<ProductModel | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const found = this.dataService.products().find(p => p.id === id);
      if (found) {
        this.product.set(found);
      } else {
        this.router.navigate(['/productos']);
      }
    }
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.cartService.addToCart(p);
  }

  toggleFavorite(event: Event): void {
    event.preventDefault();
    const p = this.product();
    if (!p) return;

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.favoritesService.toggleFavorite(p.id);
  }

  isFavorite(): boolean {
    const p = this.product();
    return p ? this.favoritesService.isFavorite(p.id) : false;
  }

  get isAuthenticated() {
    return this.authService.isAuthenticated;
  }

  getCategoryLabel(category: ProductCategory): string {
    const labels: Record<string, string> = {
      'cafeteria': 'Cafetería',
      'pizzeria': 'Pizzería',
      'despensa': 'Abastos',
      'combo': 'Combo'
    };
    return labels[category] || category;
  }
}
