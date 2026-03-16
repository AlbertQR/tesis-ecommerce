import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '@core/services/data.service';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';
import { ProductCategory } from '@core/models';
import { FormatPricePipe } from '@shared/pipes';

export interface ProductFilters {
  search: string;
  category: ProductCategory | 'all';
  priceRange: { min: number; max: number };
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'popular';
  onlyHot: boolean;
  onlyFeatured: boolean;
  minRating: number;
}

@Component({
  selector: 'app-products',
  imports: [FormsModule, ProductCardComponent, FormatPricePipe],
  templateUrl: './products.component.html'
})
export class ProductsComponent {
  dataService = inject(DataService);
  filters = signal<ProductFilters>({
    search: '',
    category: 'all',
    priceRange: { min: 0, max: 100000 },
    sortBy: 'popular',
    onlyHot: false,
    onlyFeatured: false,
    minRating: 0
  });
  priceMin = signal(0);
  priceMax = signal(100000);
  categories = [
    { id: 'all' as const, name: 'Todos', icon: 'fa-solid fa-border-all' },
    { id: 'cafeteria' as const, name: 'Cafetería', icon: 'fa-solid fa-mug-hot' },
    { id: 'pizzeria' as const, name: 'Pizzería', icon: 'fa-solid fa-pizza-slice' },
    { id: 'despensa' as const, name: 'Despensa', icon: 'fa-solid fa-basket-shopping' },
    { id: 'combo' as const, name: 'Combos', icon: 'fa-solid fa-box-open' }
  ];
  sortOptions = [
    { value: 'popular', label: 'Más Populares' },
    { value: 'name', label: 'Nombre A-Z' },
    { value: 'price-asc', label: 'Menor Precio' },
    { value: 'price-desc', label: 'Mayor Precio' }
  ];
  ratingOptions = [
    { value: 0, label: 'Todas las calificaciones' },
    { value: 4, label: '4+ estrellas' },
    { value: 3, label: '3+ estrellas' },
    { value: 2, label: '2+ estrellas' }
  ];

  filteredProducts = computed(() => {
    let products = [...this.dataService.products()];
    const f = this.filters();

    if (f.search) {
      const search = f.search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      );
    }

    if (f.category !== 'all') {
      products = products.filter(p => p.category === f.category);
    }

    products = products.filter(p =>
      p.price >= this.priceMin() && p.price <= this.priceMax()
    );

    if (f.onlyHot) {
      products = products.filter(p => p.isHot);
    }

    if (f.onlyFeatured) {
      products = products.filter(p => p.isFeatured);
    }

    if (f.minRating > 0) {
      products = products.filter(p => (p.averageRating || 0) >= f.minRating);
    }

    switch (f.sortBy) {
      case 'name':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
      default:
        products.sort((a, b) => (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0));
        break;
    }

    return products;
  });

  productCount = computed(() => this.filteredProducts().length);

  updateSearch(value: string): void {
    this.filters.update(f => ({ ...f, search: value }));
  }

  updateCategory(category: ProductCategory | 'all'): void {
    this.filters.update(f => ({ ...f, category }));
  }

  updateSort(sortBy: string): void {
    this.filters.update(f => ({ ...f, sortBy: sortBy as ProductFilters['sortBy'] }));
  }

  toggleHot(): void {
    this.filters.update(f => ({ ...f, onlyHot: !f.onlyHot }));
  }

  toggleFeatured(): void {
    this.filters.update(f => ({ ...f, onlyFeatured: !f.onlyFeatured }));
  }

  updateMinRating(rating: number): void {
    this.filters.update(f => ({ ...f, minRating: rating }));
  }

  updatePriceRange(): void {
    this.filters.update(f => ({
      ...f,
      priceRange: { min: this.priceMin(), max: this.priceMax() }
    }));
  }

  resetFilters(): void {
    this.filters.set({
      search: '',
      category: 'all',
      priceRange: { min: 0, max: 100000 },
      sortBy: 'popular',
      onlyHot: false,
      onlyFeatured: false,
      minRating: 0
    });
    this.priceMin.set(0);
    this.priceMax.set(100000);
  }

  hasActiveFilters(): boolean {
    const f = this.filters();
    return f.search !== '' ||
      f.category !== 'all' ||
      f.onlyHot ||
      f.onlyFeatured ||
      f.minRating > 0 ||
      this.priceMin() > 0 ||
      this.priceMax() < 100000;
  }

  getCafeteriaTotalProducts() {
    return this.dataService.products().filter(p => p.category === 'cafeteria').length;
  }

  getPizzeriaTotalProducts() {
    return this.dataService.products().filter(p => p.category === 'pizzeria').length;
  }

  getDespensaTotalProducts() {
    return this.dataService.products().filter(p => p.category === 'despensa').length;
  }

  validatePrice(value: number | string): number {
    if (value === null || value === undefined || value === '') return 0;
    const num = typeof value === 'string' ? parseInt(value, 10) : value;
    if (isNaN(num)) return 0;
    return Math.max(0, Math.min(num, 999999));
  }
}
