import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductCategory, Product } from '../../core/models/product.model';

export interface ProductFilters {
  search: string;
  category: ProductCategory | 'all';
  priceRange: { min: number; max: number };
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'popular';
  onlyHot: boolean;
  onlyFeatured: boolean;
}

@Component({
  selector: 'app-products',
  imports: [FormsModule, ProductCardComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  dataService = inject(DataService);

  filters = signal<ProductFilters>({
    search: '',
    category: 'all',
    priceRange: { min: 0, max: 100000 },
    sortBy: 'popular',
    onlyHot: false,
    onlyFeatured: false
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
      onlyFeatured: false
    });
    this.priceMin.set(0);
    this.priceMax.set(100000);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  hasActiveFilters(): boolean {
    const f = this.filters();
    return f.search !== '' || 
           f.category !== 'all' || 
           f.onlyHot || 
           f.onlyFeatured ||
           this.priceMin() > 0 || 
           this.priceMax() < 100000;
  }
}
