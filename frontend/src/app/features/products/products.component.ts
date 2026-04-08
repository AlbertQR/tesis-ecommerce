import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '@core/services/data.service';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';
import { ProductFilters } from '@core/models';
import { FormatPricePipe } from '@shared/pipes';

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
  
  // Generar opciones de categorías desde el DataService
  categories = computed(() => {
    const cats = this.dataService.categories();
    const options: { id: string; name: string; icon: string }[] = [
      { id: 'all', name: 'Todos', icon: 'fa-solid fa-border-all' }
    ];
    
    // Agregar las categorías del API con su icono
    cats.forEach(cat => {
      options.push({
        id: cat.id,
        name: cat.name,
        icon: 'fa-solid ' + (cat.icon || 'fa-folder')
      });
    });
    
    return options;
  });
  
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
    const filters = this.filters();

    if (filters.search) {
      const search = filters.search.toLowerCase();
      products = products.filter(product =>
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search)
      );
    }

    if (filters.category !== 'all')
      products = products.filter(product => product.category === filters.category);

    products = products.filter(product =>
      product.price >= this.priceMin() && product.price <= this.priceMax()
    );

    if (filters.onlyHot) products = products.filter(product => product.isHot);

    if (filters.onlyFeatured) products = products.filter(product => product.isFeatured);

    if (filters.minRating > 0) {
      products = products
        .filter(product => (product.averageRating || 0) >= filters.minRating);
    }

    switch (filters.sortBy) {
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
    this.filters.update(filter => ({ ...filter, search: value }));
  }

  updateCategory(category: string | 'all'): void {
    this.filters.update(filter => ({ ...filter, category }));
  }

  updateSort(sortBy: string): void {
    this.filters.update(filter =>
      ({ ...filter, sortBy: sortBy as ProductFilters['sortBy'] }));
  }

  toggleHot(): void {
    this.filters.update(filter => ({ ...filter, onlyHot: !filter.onlyHot }));
  }

  toggleFeatured(): void {
    this.filters.update(filter => ({ ...filter, onlyFeatured: !filter.onlyFeatured }));
  }

  updateMinRating(rating: number): void {
    this.filters.update(filter => ({ ...filter, minRating: rating }));
  }

  updatePriceRange(): void {
    this.filters.update(filter => ({
      ...filter,
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
    const filters = this.filters();
    return filters.search !== '' ||
      filters.category !== 'all' ||
      filters.onlyHot ||
      filters.onlyFeatured ||
      filters.minRating > 0 ||
      this.priceMin() > 0 ||
      this.priceMax() < 100000;
  }

  getCategoryProductCount(categoryId: string): number {
    if (categoryId === 'all') {
      return this.dataService.products().length;
    }
    return this.dataService.products()
      .filter(product => product.category === categoryId).length;
  }

  validatePrice(value: number | string): number {
    if (value === null || value === undefined || value === '') return 0;
    const num = typeof value === 'string' ? parseInt(value, 10) : value;
    if (isNaN(num)) return 0;
    return Math.max(0, Math.min(num, 999999));
  }
}
